import "server-only";
import { getEnrolledCourse, getMaterial, getStudentSession, isDemoMode } from "@/lib/content/student";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* Libera o download de um PDF: confere login + matrícula ativa a cada pedido e só então assina a URL (60 s).
   A URL é assinada com a sessão do aluno (não com chave de serviço): o RLS de `storage.objects` repete a conferência
   da matrícula no banco (defesa em profundidade). */

const SIGNED_URL_SECONDS = 60;
const MATERIALS_BUCKET = "materiais";

export type MaterialDownloadDenial = "not-found" | "not-configured" | "unauthenticated" | "not-enrolled" | "unavailable";

export type MaterialDownloadResult = { ok: true; url: string } | { ok: false; reason: MaterialDownloadDenial };

export async function getMaterialDownload(id: string): Promise<MaterialDownloadResult> {
  const material = getMaterial(id);
  if (!material) return { ok: false, reason: "not-found" };
  if (isDemoMode()) return { ok: false, reason: "not-configured" };
  if (!(await getStudentSession())) return { ok: false, reason: "unauthenticated" };
  if (!(await getEnrolledCourse(material.courseSlug))) return { ok: false, reason: "not-enrolled" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(`${material.courseSlug}/${material.fileName}`, SIGNED_URL_SECONDS, { download: material.fileName });
  if (error || !data) {
    console.error(`Falha ao assinar o material ${material.id}: ${error?.message ?? "sem URL"}`);
    return { ok: false, reason: "unavailable" };
  }
  return { ok: true, url: data.signedUrl };
}
