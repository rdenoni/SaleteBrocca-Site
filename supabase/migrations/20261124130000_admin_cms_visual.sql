-- Painel Administrativo — Etapa 1 (CMS Visual: Hero, Depoimentos e Links/Contato)
-- Regras:
--   * RLS ligado em todas as tabelas e no bucket público `site-media`.
--   * Leitura pública somente de itens ativos/publicados e chaves públicas de site_settings.
--   * Escrita restrita a administradores (private.is_admin) e service_role.

-- Slides da Hero -------------------------------------------------------------------------------------------------
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  text text not null default '',
  badge text,
  cta_label text not null default 'Saiba mais',
  cta_href text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  media_url text not null check (btrim(media_url) <> ''),
  image_position text not null default '60% 40%',
  tone text not null default 'blue' check (tone in ('blue', 'color')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_slides_sort_idx on public.hero_slides (sort_order asc, created_at asc);

create trigger hero_slides_touch_updated_at
  before update on public.hero_slides
  for each row execute function private.touch_updated_at();

alter table public.hero_slides enable row level security;

create policy "publico le slides ativos da hero"
  on public.hero_slides for select
  to anon, authenticated
  using (is_active = true or private.is_admin((select auth.uid())));

create policy "admin gerencia slides da hero"
  on public.hero_slides for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- Depoimentos / Comentários --------------------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (btrim(author_name) <> ''),
  author_role text not null default '',
  quote text not null check (btrim(quote) <> ''),
  photo_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_sort_idx on public.testimonials (sort_order asc, created_at asc);

create trigger testimonials_touch_updated_at
  before update on public.testimonials
  for each row execute function private.touch_updated_at();

alter table public.testimonials enable row level security;

create policy "publico le depoimentos publicados"
  on public.testimonials for select
  to anon, authenticated
  using (is_published = true or private.is_admin((select auth.uid())));

create policy "admin gerencia depoimentos"
  on public.testimonials for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- Configurações do site (redes sociais, telefone, e-mail, etc.) --------------------------------------------------
create table if not exists public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function private.touch_updated_at();

alter table public.site_settings enable row level security;

create policy "publico le configuracoes publicas do site"
  on public.site_settings for select
  to anon, authenticated
  using (key in ('social_links', 'contact_info') or private.is_admin((select auth.uid())));

create policy "admin gerencia configuracoes do site"
  on public.site_settings for all
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

-- Bucket público de mídia do site (fotos/vídeos da Hero, depoimentos, artigos, podcasts) -------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mp4', 'audio/mpeg', 'audio/x-m4a']
)
on conflict (id) do nothing;

create policy "leitura publica de site-media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-media');

create policy "admin envia arquivos em site-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and private.is_admin((select auth.uid())));

create policy "admin atualiza arquivos em site-media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and private.is_admin((select auth.uid())));

create policy "admin apaga arquivos em site-media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and private.is_admin((select auth.uid())));

-- Permissões de tabela -------------------------------------------------------------------------------------------
revoke all on public.hero_slides, public.testimonials, public.site_settings from anon;
revoke all on public.hero_slides, public.testimonials, public.site_settings from authenticated;

grant select on public.hero_slides, public.testimonials, public.site_settings to anon;
grant select, insert, update, delete on public.hero_slides, public.testimonials, public.site_settings to authenticated;
grant select, insert, update, delete on public.hero_slides, public.testimonials, public.site_settings to service_role;
