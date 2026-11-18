import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProgressBar } from "@/components/student/ProgressBar";
import { StudentModuleList } from "@/components/student/StudentModuleList";
import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/Button";
import { COURSES_PATH } from "@/lib/auth-paths";
import { getCourse, getCourses } from "@/lib/content/courses";
import {
  getCourseProgress,
  getEnrolledCourse,
  getStudentProgress,
  lessonHref,
  requireStudentSession,
} from "@/lib/content/student";
import styles from "./curso-aluno.module.css";

interface StudentCoursePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  /* Catálogo inteiro: a matrícula é conferida na página, a cada requisição. */
  return getCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: StudentCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return course ? { title: `${course.title} | Área do Aluno` } : {};
}

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const { slug } = await params;
  if (!getCourse(slug)) notFound();
  await requireStudentSession(`/area-do-aluno/cursos/${slug}`);
  /* Sem matrícula ativa não há conteúdo do curso. */
  const course = await getEnrolledCourse(slug);
  if (!course) redirect(COURSES_PATH);

  const progressByCourse = await getStudentProgress();
  const progress = getCourseProgress(course, progressByCourse);

  return (
    <StudentShell eyebrow="Meus cursos" title={course.title} active="cursos" activeIsAncestor>
      <section className={styles.summary} aria-labelledby="progresso-curso">
        <div className={styles.summaryText}>
          <h2 id="progresso-curso" className={styles.summaryTitle}>
            Seu progresso
          </h2>
          <p className={styles.count}>
            <strong>{progress.completed}</strong> de {progress.total} aulas · {progress.percent}%
          </p>
        </div>
        <div className={styles.bar}>
          <ProgressBar percent={progress.percent} label={`Progresso em ${course.title}`} onTint />
        </div>
        {progress.current && (
          <Button href={lessonHref(course.slug, progress.current)} variant="primary">
            Continuar aula
          </Button>
        )}
      </section>

      <section aria-labelledby="modulos-aulas">
        <h2 id="modulos-aulas" className={styles.heading}>
          Módulos e aulas
        </h2>
        <StudentModuleList course={course} progress={progressByCourse} openModule={progress.current?.moduleNumber} />
      </section>
    </StudentShell>
  );
}
