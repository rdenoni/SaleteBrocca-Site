-- Anotações do aluno, uma por aula (aba "Anotações" da página da aula). Regras:
--   * O aluno lê, cria e altera só as próprias anotações, e só grava em curso com matrícula ativa.
--   * Sem delete: apagar o texto grava a anotação vazia. Conta apagada leva as anotações junto (cascade).
--   * O app salva com upsert (insert ... on conflict do update): precisa das políticas e permissões de insert E update.

create table public.lesson_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_slug text not null,
  lesson_code text not null check (lesson_code ~ '^M[0-9]{2}_A[0-9]{2}$'),
  body text not null default '' check (char_length(body) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_slug, lesson_code)
);

comment on table public.lesson_notes is
  'Anotação de um aluno numa aula. O aluno grava só as próprias linhas, em curso com matrícula ativa.';

create trigger lesson_notes_touch_updated_at
  before update on public.lesson_notes
  for each row execute function private.touch_updated_at();

alter table public.lesson_notes enable row level security;

create policy "aluno lê as próprias anotações"
  on public.lesson_notes for select
  to authenticated
  using (user_id = (select auth.uid()));

-- A subconsulta em enrollments roda com o RLS de enrollments (o aluno só enxerga as próprias matrículas).
create policy "aluno cria anotação em curso com matrícula ativa"
  on public.lesson_notes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_slug = lesson_notes.course_slug
        and e.status = 'active'
    )
  );

create policy "aluno altera a própria anotação em curso com matrícula ativa"
  on public.lesson_notes for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_slug = lesson_notes.course_slug
        and e.status = 'active'
    )
  );

revoke all on public.lesson_notes from anon, authenticated;
grant select, insert, update on public.lesson_notes to authenticated;
