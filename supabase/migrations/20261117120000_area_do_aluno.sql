-- Área do Aluno: matrículas (liberadas pelo webhook da Kiwify), registro bruto dos eventos da Kiwify e progresso
-- das aulas. Regras:
--   * RLS ligado em todas as tabelas. O navegador nunca grava matrícula nem evento: só o servidor (service role,
--     que ignora RLS) no webhook.
--   * O aluno lê só as próprias matrículas e grava/apaga só o próprio progresso, e só em curso com matrícula ativa.
--   * Reembolso e chargeback mudam o status da matrícula (o acesso some); nada é apagado.
--   * Sem data de expiração: o prazo de acesso do curso ainda não foi confirmado pela cliente.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- updated_at automático ------------------------------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Matrículas -----------------------------------------------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(btrim(email)) and email <> ''),
  user_id uuid references auth.users (id) on delete set null,
  course_slug text not null check (course_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null check (status in ('active', 'refunded', 'chargeback', 'canceled')),
  source text not null default 'kiwify' check (source in ('kiwify', 'manual')),
  order_id text not null,
  product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, order_id, course_slug)
);

comment on table public.enrollments is
  'Matrícula de um e-mail num curso. Criada/atualizada só pelo servidor (webhook da Kiwify ou cadastro manual).';

create index enrollments_user_id_idx on public.enrollments (user_id);
create index enrollments_email_idx on public.enrollments (email);

create trigger enrollments_touch_updated_at
  before update on public.enrollments
  for each row execute function private.touch_updated_at();

alter table public.enrollments enable row level security;

create policy "aluno lê as próprias matrículas"
  on public.enrollments for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Liga a matrícula à conta pelo e-mail, nos dois sentidos:
--   * matrícula nova de quem já tem conta (antes de inserir);
--   * conta nova (ou e-mail trocado) de quem já tinha matrícula (depois de gravar o usuário).
-- Só liga a contas com e-mail confirmado ou convidado: sem isso, quem se cadastrasse com o e-mail de um aluno (sem
-- provar que é dono dele) herdaria a matrícula. (Desligar "Allow new users to sign up" no painel é a outra barreira.)
create or replace function private.enrollment_link_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    select u.id into new.user_id
    from auth.users u
    where lower(u.email) = new.email
      and (u.email_confirmed_at is not null or u.invited_at is not null)
    limit 1;
  end if;
  return new;
end;
$$;

create trigger enrollments_link_user
  before insert or update of email on public.enrollments
  for each row execute function private.enrollment_link_user();

create or replace function private.user_link_enrollments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null and (new.email_confirmed_at is not null or new.invited_at is not null) then
    update public.enrollments e
    set user_id = new.id
    where e.email = lower(new.email)
      and (e.user_id is null or e.user_id <> new.id);
  end if;
  return new;
exception
  when others then
    -- Um erro aqui nunca pode barrar cadastro, convite ou login (o gatilho roda dentro dessas operações no
    -- auth.users). Sem e-mail no aviso. A matrícula se liga na próxima atualização do usuário ou na da matrícula.
    raise warning 'user_link_enrollments falhou (sqlstate %)', sqlstate;
    return new;
end;
$$;

-- Dispara também quando o e-mail é confirmado ou o convite é registrado (o convite cria o usuário e só depois o
-- confirma/convida).
create trigger auth_users_link_enrollments
  after insert or update of email, email_confirmed_at, invited_at on auth.users
  for each row execute function private.user_link_enrollments();

-- Eventos brutos da Kiwify (auditoria e idempotência) ----------------------------------------------------------
create table public.kiwify_events (
  id bigint generated always as identity primary key,
  order_id text not null,
  event_type text not null,
  order_status text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  unique (order_id, event_type)
);

comment on table public.kiwify_events is
  'Cada webhook recebido da Kiwify, uma linha por pedido e tipo de evento (reenvios não duplicam). Só o servidor lê/grava.';

alter table public.kiwify_events enable row level security;
-- Sem políticas: anon e authenticated não leem nem gravam. O service role ignora RLS.

-- Progresso das aulas --------------------------------------------------------------------------------------------
create table public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_slug text not null,
  lesson_code text not null check (lesson_code ~ '^M[0-9]{2}_A[0-9]{2}$'),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_code)
);

comment on table public.lesson_progress is
  'Aulas concluídas por aluno. O aluno grava e apaga só as próprias linhas, em curso com matrícula ativa.';

alter table public.lesson_progress enable row level security;

create policy "aluno lê o próprio progresso"
  on public.lesson_progress for select
  to authenticated
  using (user_id = (select auth.uid()));

-- A subconsulta em enrollments roda com o RLS de enrollments (o aluno só enxerga as próprias matrículas).
create policy "aluno marca aula de curso com matrícula ativa"
  on public.lesson_progress for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_slug = lesson_progress.course_slug
        and e.status = 'active'
    )
  );

create policy "aluno desmarca a própria aula"
  on public.lesson_progress for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Permissões de tabela (o RLS decide as linhas) ---------------------------------------------------------------
-- Tira tudo (os privilégios padrão do Supabase dão acesso total a anon e authenticated) e concede só o necessário.
revoke all on public.enrollments, public.kiwify_events, public.lesson_progress from anon;
revoke all on public.enrollments, public.kiwify_events, public.lesson_progress from authenticated;
grant select on public.enrollments to authenticated;
grant select, insert, delete on public.lesson_progress to authenticated;

-- O service role ignora o RLS, mas não as permissões de tabela: o webhook da Kiwify grava com ele. Sem delete.
-- (kiwify_events.id é identity: o insert não precisa de permissão em sequência.)
grant usage on schema public to service_role;
grant select, insert, update on public.enrollments, public.kiwify_events to service_role;
grant select on public.lesson_progress to service_role;
