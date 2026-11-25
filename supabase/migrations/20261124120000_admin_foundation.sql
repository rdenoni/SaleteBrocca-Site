-- Painel Administrativo — Etapa 0 (Fundação, Perfis, Roles e Auditoria Imutável)
-- Regras:
--   * RLS ligado em todas as tabelas.
--   * Roles vivem em tabela separada (public.user_roles) e são conferidas por funções SECURITY DEFINER
--     no schema private, evitando escalação de privilégios e recursão de RLS.
--   * admin_audit_logs é estritamente imutável (somente INSERT e SELECT; UPDATE/DELETE bloqueados por
--     privilégios e trigger).

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Perfis de usuários ---------------------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email <> ''),
  full_name text not null default '',
  phone text,
  status text not null default 'active' check (status in ('active', 'pending', 'expired', 'blocked')),
  expires_at timestamptz,
  attribution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil estendido de cada conta (status, expiração, atribuição UTM). Sincronizado a partir de auth.users.';

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_status_idx on public.profiles (status);

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function private.touch_updated_at();

alter table public.profiles enable row level security;

-- Papéis (Roles) separados do perfil -----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'support', 'student')),
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is
  'Papéis de acesso (admin, editor, support, student). Só o servidor (service_role) ou admin autorizado altera.';

create index if not exists user_roles_role_idx on public.user_roles (role);

alter table public.user_roles enable row level security;

-- Funções SECURITY DEFINER para verificação de role sem recursão -------------------------------------------------
create or replace function private.has_role(target_user_id uuid, target_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = target_user_id
      and ur.role = target_role
  );
$$;

create or replace function private.is_admin(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role(coalesce(target_user_id, auth.uid()), 'admin');
$$;

-- Políticas de RLS para profiles e user_roles --------------------------------------------------------------------
create policy "usuario le o proprio perfil"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy "usuario atualiza nome e telefone do proprio perfil"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "usuario le os proprios papeis"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

-- Trigger para criar perfil automaticamente quando um usuário nasce em auth.users -------------------------------
create or replace function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null then
    insert into public.profiles (id, email, full_name)
    values (
      new.id,
      lower(btrim(new.email)),
      coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), '')
    )
    on conflict (id) do update
      set email = excluded.email,
          updated_at = now();
  end if;
  return new;
exception
  when others then
    raise warning 'handle_new_user_profile falhou (sqlstate %)', sqlstate;
    return new;
end;
$$;

drop trigger if exists auth_users_create_profile on auth.users;
create trigger auth_users_create_profile
  after insert or update of email on auth.users
  for each row execute function private.handle_new_user_profile();

-- Logs de auditoria administrativa (IMUTÁVEL — apenas INSERT) ----------------------------------------------------
create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  admin_email text,
  action text not null check (btrim(action) <> ''),
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_logs is
  'Registro imutável de todas as ações administrativas (LGPD e governança). Apenas INSERT e leitura por admins.';

create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_admin_id_idx on public.admin_audit_logs (admin_id);
create index if not exists admin_audit_logs_action_idx on public.admin_audit_logs (action);

alter table public.admin_audit_logs enable row level security;

create policy "admin le logs de auditoria"
  on public.admin_audit_logs for select
  to authenticated
  using (private.is_admin((select auth.uid())));

create or replace function private.forbid_audit_log_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'admin_audit_logs é imutável: UPDATE e DELETE não são permitidos.';
end;
$$;

drop trigger if exists admin_audit_logs_immutable on public.admin_audit_logs;
create trigger admin_audit_logs_immutable
  before update or delete on public.admin_audit_logs
  for each row execute function private.forbid_audit_log_mutation();

-- Permissões de tabela -------------------------------------------------------------------------------------------
revoke all on public.profiles, public.user_roles, public.admin_audit_logs from anon;
revoke all on public.profiles, public.user_roles, public.admin_audit_logs from authenticated;

grant select, update (full_name, phone) on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.admin_audit_logs to authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.profiles, public.user_roles to service_role;
grant select, insert on public.admin_audit_logs to service_role;
revoke update, delete on public.admin_audit_logs from service_role;
