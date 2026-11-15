import type { Course, CourseProgress, LessonRef, LessonStatus, StudentMaterial } from "@/types/content";
import { getCourse, getCourses } from "./courses";

/* Área do Aluno ainda sem login, vídeo nem banco de dados.
   O progresso abaixo é um EXEMPLO para mostrar os estados da interface (a tela avisa isso ao aluno).
   Na integração, trocar estas funções por dados do aluno autenticado, mantendo as assinaturas. */
export const IS_DEMO = true;

interface DemoProgress {
  completed: readonly string[];
  current: string;
}

const DEMO_PROGRESS: Readonly<Record<string, DemoProgress>> = {
  "dificuldades-na-aprendizagem": { completed: ["M00_A01", "M00_A02", "M01_A01"], current: "M01_A02" },
};

/* Nenhum material complementar confirmado ainda: as telas mostram o estado vazio. */
const MATERIALS: readonly StudentMaterial[] = [];

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

export function getLessonStatus(courseSlug: string, code: string): LessonStatus {
  const progress = DEMO_PROGRESS[courseSlug];
  if (!progress) return "not-started";
  if (progress.completed.includes(code)) return "completed";
  return progress.current === code ? "in-progress" : "not-started";
}

export function getCourseProgress(course: Course): CourseProgress {
  const lessons = getLessonRefs(course);
  const progress = DEMO_PROGRESS[course.slug];
  const completed = lessons.filter((lesson) => progress?.completed.includes(lesson.code)).length;
  const total = lessons.length;
  const finished = total > 0 && completed === total;
  /* Retoma a aula em andamento; sem ela, a primeira ainda não concluída. Curso concluído: nenhuma. */
  const current = finished
    ? undefined
    : (lessons.find((lesson) => lesson.code === progress?.current) ??
      lessons.find((lesson) => !progress?.completed.includes(lesson.code)));
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

export function getEnrolledCourses(): readonly Course[] {
  return getCourses();
}

export function getEnrolledCourse(slug: string): Course | undefined {
  return getCourse(slug);
}

export function getMaterials(courseSlug?: string): readonly StudentMaterial[] {
  return courseSlug ? MATERIALS.filter((material) => material.courseSlug === courseSlug) : MATERIALS;
}
