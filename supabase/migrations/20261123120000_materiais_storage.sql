-- APLICADA em 23/11/2026 com aprovação do responsável (projeto dhshqcrcusuuiqlvikha, migration "materiais_storage").
--
-- Materiais de apoio dos cursos (PDF pago). Bucket PRIVADO: nada tem link público.
-- Regras:
--   * Caminho = <course_slug>/<arquivo>.pdf (a primeira pasta é o slug do curso).
--   * O download passa por /api/materiais/[id]: o servidor confere login + matrícula ativa e devolve um link assinado
--     de curta duração. O RLS abaixo repete a conferência no banco (defesa em profundidade): sem matrícula ativa no
--     curso da pasta, o aluno não consegue nem gerar o link.
--   * Quem grava é o admin (painel do Supabase ou service role). O navegador nunca grava aqui.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materiais', 'materiais', false, 20971520, array['application/pdf']);

-- A subconsulta em enrollments roda com o RLS de enrollments (o aluno só enxerga as próprias matrículas).
create policy "materiais: aluno com matrícula ativa lê os arquivos do curso"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'materiais'
    and exists (
      select 1
      from public.enrollments e
      where e.user_id = (select auth.uid())
        and e.course_slug = (storage.foldername(objects.name))[1]
        and e.status = 'active'
    )
  );
