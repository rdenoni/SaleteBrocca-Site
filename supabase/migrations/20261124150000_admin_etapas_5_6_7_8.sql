-- Painel Administrativo — Etapas 5, 6, 7 e 8
-- Etapa 5: CRM (public.leads)
-- Etapa 6: Suporte (public.support_tickets, public.support_messages)
-- Etapa 7: Sessões Ativas (public.user_sessions)
-- (Etapa 8 usa public.lesson_videos já existente + API de leitura da Mux)

-- ================================================================================================================
-- ETAPA 5: CRM (LEADS)
-- ================================================================================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  email text not null default '',
  whatsapp text not null default '',
  source text not null default 'manual' check (source in ('avaliacao', 'contato', 'checkout', 'manual')),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  tags text[] not null default '{}',
  utm jsonb not null default '{}'::jsonb,
  notes text not null default '',
  converted_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_email_idx on public.leads (lower(email));

create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function private.touch_updated_at();

alter table public.leads enable row level security;

create policy "admin gerencia leads"
  on public.leads for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- ================================================================================================================
-- ETAPA 6: SUPORTE (TICKETS E MENSAGENS)
-- ================================================================================================================

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number bigint generated always as identity unique,
  user_id uuid references auth.users (id) on delete set null,
  requester_name text not null default '',
  requester_email text not null check (btrim(requester_email) <> ''),
  subject text not null check (btrim(subject) <> ''),
  category text not null default 'outro' check (category in ('acesso', 'pagamento', 'curso', 'tecnico', 'lgpd', 'outro')),
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_status_idx on public.support_tickets (status, updated_at desc);
create index if not exists support_tickets_user_idx on public.support_tickets (user_id);

create trigger support_tickets_touch_updated_at
  before update on public.support_tickets
  for each row execute function private.touch_updated_at();

alter table public.support_tickets enable row level security;

create policy "usuario le proprios tickets e admin le todos"
  on public.support_tickets for select
  to authenticated
  using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy "usuario abre proprio ticket"
  on public.support_tickets for insert
  to authenticated
  with check (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy "admin atualiza e exclui tickets"
  on public.support_tickets for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  sender_type text not null check (sender_type in ('user', 'admin')),
  sender_id uuid references auth.users (id) on delete set null,
  sender_email text not null default '',
  body text not null check (btrim(body) <> ''),
  created_at timestamptz not null default now()
);

create index if not exists support_messages_ticket_idx on public.support_messages (ticket_id, created_at asc);

alter table public.support_messages enable row level security;

create policy "usuario le mensagens dos proprios tickets e admin le todas"
  on public.support_messages for select
  to authenticated
  using (
    private.is_admin((select auth.uid()))
    or exists (
      select 1 from public.support_tickets t
      where t.id = support_messages.ticket_id and t.user_id = (select auth.uid())
    )
  );

create policy "usuario responde proprio ticket e admin responde todos"
  on public.support_messages for insert
  to authenticated
  with check (
    private.is_admin((select auth.uid()))
    or (
      sender_type = 'user'
      and exists (
        select 1 from public.support_tickets t
        where t.id = support_messages.ticket_id and t.user_id = (select auth.uid())
      )
    )
  );

-- ================================================================================================================
-- ETAPA 7: SESSÕES ATIVAS
-- ================================================================================================================

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  user_email text not null default '',
  session_key text not null unique,
  status text not null default 'active' check (status in ('active', 'idle', 'revoked')),
  ip_address text not null default '',
  user_agent text not null default '',
  device_label text not null default 'Desconhecido',
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists user_sessions_last_seen_idx on public.user_sessions (last_seen_at desc);
create index if not exists user_sessions_user_idx on public.user_sessions (user_id);

alter table public.user_sessions enable row level security;

create policy "usuario le proprias sessoes e admin gerencia todas"
  on public.user_sessions for select
  to authenticated
  using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

create policy "admin atualiza e exclui sessoes"
  on public.user_sessions for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- Permissões de tabela -------------------------------------------------------------------------------------------
revoke all on public.leads, public.support_tickets, public.support_messages, public.user_sessions from anon;
revoke all on public.leads, public.support_tickets, public.support_messages, public.user_sessions from authenticated;

grant select, insert, update, delete on public.leads, public.support_tickets, public.support_messages, public.user_sessions to authenticated;
grant select, insert, update, delete on public.leads, public.support_tickets, public.support_messages, public.user_sessions to service_role;
