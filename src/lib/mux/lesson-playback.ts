import "server-only";
import { getCourse } from "@/lib/content/courses";
import { findLesson, getEnrolledCourse, getStudentSession, isDemoMode } from "@/lib/content/student";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decodeSigningKey, playbackExpiry, signPlaybackToken, type SigningKey } from "./playback-token";

/* Libera o vídeo de uma aula: confere login + matrícula ativa a cada pedido e só então assina os tokens.
   O RLS de `lesson_videos` repete a conferência da matrícula no banco (defesa em profundidade). */

export interface LessonPlayback {
  playbackId: string;
  /** Validade dos tokens, em segundos desde 1970. */
  expiresAt: number;
  tokens: { playback: string; thumbnail: string; storyboard: string };
}

export type LessonPlaybackDenial = "not-found" | "not-configured" | "unauthenticated" | "not-enrolled" | "no-video";

export type LessonPlaybackResult = { ok: true; playback: LessonPlayback } | { ok: false; reason: LessonPlaybackDenial };

/** Chave de assinatura das variáveis secretas do servidor; null quando falta ou foi colada errada (fica no log). */
function readSigningKey(): SigningKey | null {
  const keyId = process.env.MUX_SIGNING_KEY_ID?.trim();
  const privateKeyBase64 = process.env.MUX_SIGNING_PRIVATE_KEY?.trim();
  if (!keyId || !privateKeyBase64) return null;
  try {
    return decodeSigningKey(keyId, privateKeyBase64);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "chave de assinatura da Mux inválida");
    return null;
  }
}

export async function getLessonPlayback(courseSlug: string, lessonSlug: string): Promise<LessonPlaybackResult> {
  const catalogCourse = getCourse(courseSlug);
  const location = catalogCourse ? findLesson(catalogCourse, lessonSlug) : undefined;
  if (!location) return { ok: false, reason: "not-found" };
  if (isDemoMode()) return { ok: false, reason: "not-configured" };
  const key = readSigningKey();
  if (!key) return { ok: false, reason: "not-configured" };
  if (!(await getStudentSession())) return { ok: false, reason: "unauthenticated" };
  if (!(await getEnrolledCourse(courseSlug))) return { ok: false, reason: "not-enrolled" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lesson_videos")
    .select("playback_id, duration_seconds")
    .eq("course_slug", courseSlug)
    .eq("lesson_code", location.lesson.code)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar o vídeo da aula: ${error.message}`);
  if (!data) return { ok: false, reason: "no-video" };

  const playbackId = data.playback_id;
  const expiresAt = playbackExpiry(Date.now() / 1000, data.duration_seconds);
  return {
    ok: true,
    playback: {
      playbackId,
      expiresAt,
      tokens: {
        playback: signPlaybackToken(playbackId, "v", expiresAt, key),
        thumbnail: signPlaybackToken(playbackId, "t", expiresAt, key),
        storyboard: signPlaybackToken(playbackId, "s", expiresAt, key),
      },
    },
  };
}
