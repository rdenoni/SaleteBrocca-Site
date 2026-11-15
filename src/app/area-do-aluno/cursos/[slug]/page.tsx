import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/student/ProgressBar";
import { StudentModuleList } from "@/components/student/StudentModuleList";
import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/Button";
import { getCourseProgress, getEnrolledCourse, getEnrolledCourses, lessonHref } from "@/lib/content/student";
import styles from "./curso-aluno.module.css";

interface StudentCoursePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getEnrolledCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: StudentCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getEnrolledCourse(slug);
  return course ? { title: `${course.title} | Área do Aluno` } : {};
}

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const { slug } = await params;
  const course = getEnrolledCourse(slug);
  if (!course) notFound();

  const progress = getCourseProgress(course);

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
        <StudentModuleList course={course} openModule={progress.current?.moduleNumber} />
      </section>
    </StudentShell>
  );
}
