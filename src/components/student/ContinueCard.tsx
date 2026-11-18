import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { getCourseProgress, lessonHref, type ProgressByCourse } from "@/lib/content/student";
import type { Course } from "@/types/content";
import { ProgressBar } from "./ProgressBar";
import styles from "./ContinueCard.module.css";

interface ContinueCardProps {
  course: Course;
  /** Progresso do aluno (carregado pela página com getStudentProgress). */
  progress: ProgressByCourse;
  /** "wide" no painel (navy, foto grande); "card" em Meus cursos. */
  variant?: "wide" | "card";
}

/* Curso do aluno com a próxima aula e o progresso. */
export function ContinueCard({ course, progress: progressByCourse, variant = "wide" }: ContinueCardProps) {
  const progress = getCourseProgress(course, progressByCourse);
  const dark = variant === "wide";
  const titleId = `${variant}-${course.slug}`;

  return (
    <article className={styles.card} data-variant={variant} data-surface={dark ? "dark" : undefined} aria-labelledby={titleId}>
      <div className={styles.media}>
        <Image src={course.image} alt="" fill sizes="(max-width: 767px) 100vw, 480px" />
      </div>
      <div className={styles.body}>
        <p className="eyebrow">{dark ? "Continuar assistindo" : "Curso online"}</p>
        <h2 id={titleId} className={styles.title}>
          {course.title}
        </h2>
        {progress.current && (
          <p className={styles.next}>
            <span className={styles.nextLabel}>
              Módulo {progress.current.moduleNumber} · Aula {progress.current.numberInModule}
            </span>
            {progress.current.title}
          </p>
        )}
        <div className={styles.progress}>
          <ProgressBar percent={progress.percent} label={`Progresso em ${course.title}`} tone={dark ? "dark" : "light"} />
          <p className={styles.progressText}>
            <strong>{progress.percent}% concluído</strong> · {progress.completed} de {progress.total} aulas
          </p>
        </div>
        <div className={styles.actions}>
          {progress.current && (
            <Button href={lessonHref(course.slug, progress.current)} variant={dark ? "accent" : "primary"}>
              Continuar aula
            </Button>
          )}
          <Button href={`/area-do-aluno/cursos/${course.slug}`} variant={dark ? "ghost" : "outline"}>
            Ver módulos
          </Button>
        </div>
      </div>
    </article>
  );
}
