-- Painel Administrativo — Etapas 2, 3 e 4
-- Etapa 2: Artigos e Podcasts (CMS de Conteúdo)
-- Etapa 3: IPs bloqueados e expiração de matrículas (Usuários & Cadastro)
-- Etapa 4: Hotmart Webhook e Transações Financeiras (Kiwify + Hotmart)

-- ================================================================================================================
-- ETAPA 2: CONTEÚDO (ARTIGOS E PODCASTS)
-- ================================================================================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  excerpt text not null default '',
  category_slug text not null default 'aprendizagem',
  cover_url text,
  cover_alt text not null default '',
  body_markdown text not null default '',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_status_idx on public.articles (status, published_at desc);

create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function private.touch_updated_at();

alter table public.articles enable row level security;

create policy "publico le artigos publicados"
  on public.articles for select
  to anon, authenticated
  using (status = 'published' or private.is_admin((select auth.uid())));

create policy "admin gerencia artigos"
  on public.articles for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  episode_number integer not null default 1 check (episode_number > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  summary text not null default '',
  topics text[] not null default '{}',
  lesson_codes text[] not null default '{}',
  audio_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists podcasts_episode_idx on public.podcasts (episode_number asc);

create trigger podcasts_touch_updated_at
  before update on public.podcasts
  for each row execute function private.touch_updated_at();

alter table public.podcasts enable row level security;

create policy "publico le podcasts publicados"
  on public.podcasts for select
  to anon, authenticated
  using (status = 'published' or private.is_admin((select auth.uid())));

create policy "admin gerencia podcasts"
  on public.podcasts for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- ================================================================================================================
-- ETAPA 3: USUÁRIOS & CONTROLE DE CADASTRO (IPS BLOQUEADOS + EXPIRAÇÃO)
-- ================================================================================================================

alter table public.enrollments
  add column if not exists expires_at timestamptz;

alter table public.enrollments
  drop constraint if exists enrollments_source_check;

alter table public.enrollments
  add constraint enrollments_source_check check (source in ('kiwify', 'hotmart', 'manual'));

create table if not exists public.blocked_ips (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null unique check (btrim(ip_address) <> ''),
  reason text not null default '',
  blocked_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.blocked_ips enable row level security;

create policy "admin gerencia ips bloqueados"
  on public.blocked_ips for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- ================================================================================================================
-- ETAPA 4: FINANCEIRO (HOTMART WEBHOOKS + TRANSAÇÕES UNIFICADAS)
-- ================================================================================================================

create table if not exists public.hotmart_events (
  id bigint generated always as identity primary key,
  transaction_id text not null,
  event_type text not null,
  order_status text,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  unique (transaction_id, event_type)
);

alter table public.hotmart_events enable row level security;

create policy "admin le eventos hotmart"
  on public.hotmart_events for select
  to authenticated
  using (private.is_admin((select auth.uid())));

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('kiwify', 'hotmart', 'manual')),
  order_id text not null,
  customer_name text not null default '',
  customer_email text not null check (customer_email = lower(btrim(customer_email)) and customer_email <> ''),
  user_id uuid references auth.users (id) on delete set null,
  product_name text not null default '',
  course_slug text,
  gross_amount_cents integer not null default 0,
  fee_amount_cents integer not null default 0,
  net_amount_cents integer not null default 0,
  currency text not null default 'BRL',
  status text not null check (status in ('paid', 'pending', 'refunded', 'chargeback', 'canceled')),
  refund_reason text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, order_id)
);

create index if not exists transactions_occurred_idx on public.transactions (occurred_at desc);
create index if not exists transactions_status_idx on public.transactions (status);
create index if not exists transactions_platform_idx on public.transactions (platform);

create trigger transactions_touch_updated_at
  before update on public.transactions
  for each row execute function private.touch_updated_at();

alter table public.transactions enable row level security;

create policy "admin le transacoes financeiras"
  on public.transactions for select
  to authenticated
  using (private.is_admin((select auth.uid())));

-- Permissões de tabela -------------------------------------------------------------------------------------------
revoke all on public.articles, public.podcasts, public.blocked_ips, public.hotmart_events, public.transactions from anon;
revoke all on public.articles, public.podcasts, public.blocked_ips, public.hotmart_events, public.transactions from authenticated;

grant select on public.articles, public.podcasts to anon;
grant select, insert, update, delete on public.articles, public.podcasts, public.blocked_ips to authenticated;
grant select on public.hotmart_events, public.transactions to authenticated;

grant select, insert, update, delete on public.articles, public.podcasts, public.blocked_ips, public.transactions to service_role;
grant select, insert, update on public.hotmart_events to service_role;
