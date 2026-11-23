import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { loginPathWithNext } from "@/lib/auth-paths";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { EnrollmentStatus } from "@/types/database";
import type { Course, CourseProgress, LessonRef, LessonStatus } from "@/types/content";
import { getCourse, getCourses } from "./courses";

/* Dois modos, decididos por `isSupabaseConfigured()`:
   - sem Supabase (deploy atual e testes): demonstração, com o progresso de EXEMPLO abaixo e o aviso na tela;
   - com Supabase: login real. Cursos = matrículas ativas do aluno; progresso = linhas de `lesson_progress`.
   As funções de progresso são puras (recebem o `ProgressByCourse` já carregado): a tela carrega uma vez por
   requisição com `getStudentProgress()` e passa adiante, em vez de consultar o banco aula por aula. */

/** Demonstração: Supabase não configurado. */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

export interface StudentCourseProgress {
  /** Códigos das aulas concluídas (ex.: "M01_A02"). */
  completed: readonly string[];
  /** Aula em andamento (só na demonstração; com login real a próxima aula é a primeira não concluída). */
  current?: string;
}

export type ProgressByCourse = Readonly<Record<string, StudentCourseProgress>>;

const DEMO_PROGRESS: ProgressByCourse = {
  "dificuldades-na-aprendizagem": { completed: ["M00_A01", "M00_A02", "M01_A01"], current: "M01_A02" },
};

export const ENROLLMENT_STATUS_LABEL: Readonly<Record<EnrollmentStatus, string>> = {
  active: "Ativa",
  refunded: "Reembolsada",
  chargeback: "Estornada",
  canceled: "Cancelada",
};

export interface StudentSession {
  userId: string;
  email: string | undefined;
}

/** Aluno autenticado desta requisição (valida o token com `getClaims`); null sem login ou sem Supabase. */
export const getStudentSession = cache(async (): Promise<StudentSession | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { userId: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined };
});

/** Exige login no modo real (o proxy é só a primeira barreira). Na demonstração devolve null e não redireciona. */
export async function requireStudentSession(returnTo: string): Promise<StudentSession | null> {
  if (!isSupabaseConfigured()) return null;
  const session = await getStudentSession();
  if (!session) redirect(loginPathWithNext(returnTo));
  return session;
}

export interface EnrollmentSummary {
  courseSlug: string;
  courseTitle: string;
  status: EnrollmentStatus;
  createdAt: string;
}

/** Matrículas do aluno (qualquer status), da mais recente para a mais antiga. O RLS já limita às linhas dele. */
export const getEnrollments = cache(async (): Promise<readonly EnrollmentSummary[]> => {
  const session = await getStudentSession();
  if (!session) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_slug, status, created_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar as matrículas: ${error.message}`);
  return data.map((row) => ({
    courseSlug: row.course_slug,
    courseTitle: getCourse(row.course_slug)?.title ?? row.course_slug,
    status: row.status,
    createdAt: row.created_at,
  }));
});

/** Progresso do aluno em todos os cursos, carregado uma vez por requisição. */
export const getStudentProgress = cache(async (): Promise<ProgressByCourse> => {
  if (isDemoMode()) return DEMO_PROGRESS;
  const session = await getStudentSession();
  if (!session) return {};
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("course_slug, lesson_code")
    .eq("user_id", session.userId);
  if (error) throw new Error(`Falha ao carregar o progresso: ${error.message}`);
  const byCourse = new Map<string, string[]>();
  for (const row of data) {
    byCourse.set(row.course_slug, [...(byCourse.get(row.course_slug) ?? []), row.lesson_code]);
  }
  return Object.fromEntries([...byCourse].map(([slug, completed]) => [slug, { completed }]));
});

export function lessonSlug(code: string): string {
  return code.toLowerCase().replace(/_/g, "-");
}

export function getLessonRefs(course: Course): readonly LessonRef[] {
  return course.modules.flatMap((module) =>
    module.lessons.map((lesson, index) => ({
      slug: lessonSlug(lesson.code),
      code: lesson.code,
      title: lesson.title,
      moduleNumber: module.number,
      moduleTitle: module.title,
      moduleSummary: module.summary,
      numberInModule: index + 1,
    })),
  );
}

export interface LessonLocation {
  lesson: LessonRef;
  previous?: LessonRef;
  next?: LessonRef;
}

export function findLesson(course: Course, slug: string): LessonLocation | undefined {
  const lessons = getLessonRefs(course);
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) return undefined;
  return { lesson: lessons[index], previous: lessons[index - 1], next: lessons[index + 1] };
}

export function getLessonStatus(courseSlug: string, code: string, progress: ProgressByCourse): LessonStatus {
  const courseProgress = progress[courseSlug];
  if (!courseProgress) return "not-started";
  if (courseProgress.completed.includes(code)) return "completed";
  return courseProgress.current === code ? "in-progress" : "not-started";
}

export function getCourseProgress(course: Course, progress: ProgressByCourse): CourseProgress {
  const lessons = getLessonRefs(course);
  const courseProgress = progress[course.slug];
  const completed = lessons.filter((lesson) => courseProgress?.completed.includes(lesson.code)).length;
  const total = lessons.length;
  const finished = total > 0 && completed === total;
  /* Retoma a aula em andamento; sem ela, a primeira ainda não concluída. Curso concluído: nenhuma. */
  const current = finished
    ? undefined
    : (lessons.find((lesson) => lesson.code === courseProgress?.current) ??
      lessons.find((lesson) => !courseProgress?.completed.includes(lesson.code)));
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    current,
  };
}

export function lessonHref(courseSlug: string, lesson: LessonRef): string {
  return `/area-do-aluno/cursos/${courseSlug}/aulas/${lesson.slug}`;
}

/** Slugs dos cursos com matrícula ativa do aluno logado. */
const getActiveCourseSlugs = cache(async (): Promise<readonly string[]> => {
  const enrollments = await getEnrollments();
  return [...new Set(enrollments.filter((item) => item.status === "active").map((item) => item.courseSlug))];
});

/** Cursos do aluno: na demonstração, o catálogo; com login, só os de matrícula ativa (e que existem no catálogo). */
export async function getEnrolledCourses(): Promise<readonly Course[]> {
  if (isDemoMode()) return getCourses();
  const slugs = await getActiveCourseSlugs();
  return slugs.flatMap((slug) => getCourse(slug) ?? []);
}

export async function getEnrolledCourse(slug: string): Promise<Course | undefined> {
  if (isDemoMode()) return getCourse(slug);
  const slugs = await getActiveCourseSlugs();
  return slugs.includes(slug) ? getCourse(slug) : undefined;
}

export { getLessonMaterials, getMaterial, getMaterials } from "./materials";
