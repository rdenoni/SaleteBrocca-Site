-- Painel Administrativo — Etapas 9 e 10
-- Etapa 9: Histórico de Backups Criptografados (AES-256-GCM e GitHub Privado)
-- Etapa 10: Caixa de E-mails ADM (receber e responder)

create table if not exists public.backup_history (
  id uuid primary key default gen_random_uuid(),
  destination text not null check (destination in ('download', 'github', 'restore')),
  filename text not null,
  tables_count integer not null default 0,
  rows_count integer not null default 0,
  size_bytes bigint not null default 0,
  sha256 text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_by_email text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists backup_history_created_idx on public.backup_history (created_at desc);

alter table public.backup_history enable row level security;

create policy "admin gerencia historico de backups"
  on public.backup_history for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create table if not exists public.admin_emails (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  from_email text not null,
  to_email text not null,
  subject text not null default '(sem assunto)',
  body_text text not null default '',
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  external_id text,
  created_at timestamptz not null default now()
);

create index if not exists admin_emails_status_idx on public.admin_emails (status, created_at desc);
create index if not exists admin_emails_thread_idx on public.admin_emails (thread_id, created_at asc);

alter table public.admin_emails enable row level security;

create policy "admin gerencia emails administrativos"
  on public.admin_emails for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

revoke all on public.backup_history, public.admin_emails from anon;
revoke all on public.backup_history, public.admin_emails from authenticated;

grant select, insert, update, delete on public.backup_history, public.admin_emails to authenticated;
grant select, insert, update, delete on public.backup_history, public.admin_emails to service_role;
