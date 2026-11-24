-- APLICADA em 20/11/2026 com aprovação do responsável (projeto dhshqcrcusuuiqlvikha, migration "lesson_videos").
--
-- Vídeos das aulas (Mux Signed Playback). Uma linha por aula: liga o código da aula (courses.ts) ao vídeo na Mux.
-- Regras:
--   * O playback_id sozinho não toca nada: a política é "signed" e o player precisa de um token JWT de curta duração,
--     assinado no servidor só depois de conferir sessão + matrícula ativa.
--   * Mesmo assim, o aluno só enxerga as linhas de curso em que tem matrícula ativa (defesa em profundidade).
--   * provider deixa a troca de provedor possível sem mudar o resto do esquema (integração desacoplada, pedida no plano).
--   * Quem grava é o servidor/admin (service role ou SQL direto). O navegador nunca grava aqui.

create table public.lesson_videos (
  course_slug text not null check (course_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  lesson_code text not null check (lesson_code ~ '^M[0-9]{2}_A[0-9]{2}$'),
  provider text not null default 'mux' check (provider in ('mux')),
  asset_id text not null,
  playback_id text not null,
  duration_seconds integer check (duration_seconds > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_slug, lesson_code),
  unique (provider, asset_id),
  unique (provider, playback_id)
);

comment on table public.lesson_videos is
  'Vídeo de cada aula no provedor (Mux, reprodução assinada). Gravado só pelo servidor; o aluno lê só com matrícula ativa.';

create trigger lesson_videos_touch_updated_at
  before update on public.lesson_videos
  for each row execute function private.touch_updated_at();

alter table public.lesson_videos enable row level security;

-- A subconsulta em enrollments roda com o RLS de enrollments (o aluno só enxerga as próprias matrículas).
create policy "aluno com matrícula ativa lê os vídeos do curso"
  on public.lesson_videos for select
  to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_slug = lesson_videos.course_slug
        and e.status = 'active'
    )
  );

-- Permissões de tabela (o RLS decide as linhas). Mesmo padrão da migration da Área do Aluno.
revoke all on public.lesson_videos from anon;
revoke all on public.lesson_videos from authenticated;
grant select on public.lesson_videos to authenticated;
grant select, insert, update on public.lesson_videos to service_role;
