"use server";

import { revalidatePath } from "next/cache";
import { STUDENT_HOME } from "@/lib/auth-paths";
import { getCourse } from "@/lib/content/courses";
import { getLessonRefs, getStudentSession } from "@/lib/content/student";
import { NOTE_MAX_LENGTH } from "@/lib/lesson-notes";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LessonActionResult {
  ok: boolean;
  /** Mensagem em português para mostrar ao aluno quando `ok` é falso. */
  error?: string;
}

const SAVE_ERROR = "Não foi possível salvar o progresso. Tente novamente.";
const SESSION_ERROR = "Sua sessão expirou. Entre de novo para salvar o progresso.";
const PG_UNIQUE_VIOLATION = "23505";

/* Marca ou desmarca uma aula. Confere sessão e aula aqui (o proxy não cobre Server Actions de forma garantida); a matrícula
   ativa é exigida pelo RLS do banco: sem ela o insert é recusado. */
export async function setLessonCompleted(
  courseSlug: string,
  lessonCode: string,
  completed: boolean,
): Promise<LessonActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: SAVE_ERROR };

  const course = typeof courseSlug === "string" ? getCourse(courseSlug) : undefined;
  const lesson = course ? getLessonRefs(course).find((item) => item.code === lessonCode) : undefined;
  if (!course || !lesson) return { ok: false, error: SAVE_ERROR };

  const session = await getStudentSession();
  if (!session) return { ok: false, error: SESSION_ERROR };

  const supabase = await createSupabaseServerClient();
  const { error } = completed
    ? await supabase.from("lesson_progress").insert({ course_slug: course.slug, lesson_code: lesson.code })
    : await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", session.userId)
        .eq("course_slug", course.slug)
        .eq("lesson_code", lesson.code);

  /* Marcar uma aula já marcada não é erro. */
  if (error && error.code !== PG_UNIQUE_VIOLATION) return { ok: false, error: SAVE_ERROR };

  revalidatePath(STUDENT_HOME, "layout");
  return { ok: true };
}

const NOTE_ERROR = "Não foi possível salvar a anotação. Tente novamente.";
const NOTE_SESSION_ERROR = "Sua sessão expirou. Entre de novo para salvar a anotação.";

/* Grava a anotação da aula (cria ou substitui). Mesmas conferências de setLessonCompleted; a matrícula ativa é exigida
   pelo RLS de lesson_notes. */
export async function saveLessonNote(courseSlug: string, lessonCode: string, body: string): Promise<LessonActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: NOTE_ERROR };
  if (typeof body !== "string" || body.length > NOTE_MAX_LENGTH) return { ok: false, error: NOTE_ERROR };

  const course = typeof courseSlug === "string" ? getCourse(courseSlug) : undefined;
  const lesson = course ? getLessonRefs(course).find((item) => item.code === lessonCode) : undefined;
  if (!course || !lesson) return { ok: false, error: NOTE_ERROR };

  const session = await getStudentSession();
  if (!session) return { ok: false, error: NOTE_SESSION_ERROR };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("lesson_notes")
    .upsert(
      { user_id: session.userId, course_slug: course.slug, lesson_code: lesson.code, body },
      { onConflict: "user_id,course_slug,lesson_code" },
    );
  if (error) return { ok: false, error: NOTE_ERROR };
  return { ok: true };
}
