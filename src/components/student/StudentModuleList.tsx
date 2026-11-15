import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getLessonRefs, getLessonStatus, lessonHref } from "@/lib/content/student";
import type { Course } from "@/types/content";
import { LessonStatusBadge } from "./LessonStatusBadge";
import styles from "./StudentModuleList.module.css";

interface StudentModuleListProps {
  course: Course;
  /** Aula aberta no player: fica marcada e seu módulo começa aberto. */
  currentSlug?: string;
  /** Módulo que começa aberto quando não há aula atual. */
  openModule?: number;
  /** Versão estreita da lateral do player: status só com ícone. */
  compact?: boolean;
}

/* Módulos em acordeão nativo; cada aula é um link para o player, com o estado em ícone + palavra. */
export function StudentModuleList({ course, currentSlug, openModule, compact = false }: StudentModuleListProps) {
  const lessons = getLessonRefs(course);

  return (
    <ol className={styles.list} data-compact={compact ? "" : undefined}>
      {course.modules.map((module) => {
        const moduleLessons = lessons.filter((lesson) => lesson.moduleNumber === module.number);
        const done = moduleLessons.filter(
          (lesson) => getLessonStatus(course.slug, lesson.code) === "completed",
        ).length;
        const isOpen =
          module.number === openModule || moduleLessons.some((lesson) => lesson.slug === currentSlug);

        return (
          <li key={module.number}>
            <details className={styles.module} open={isOpen}>
              <summary className={styles.head}>
                <span className={styles.number} aria-hidden="true">
                  {module.number}
                </span>
                <span className={styles.titleWrap}>
                  <span className={styles.title}>
                    <span className="visually-hidden">Módulo {module.number}: </span>
                    {module.title}
                  </span>
                  <span className={styles.count}>
                    {done} de {moduleLessons.length} concluídas
                  </span>
                </span>
                <ChevronDown className={styles.chevron} aria-hidden="true" />
              </summary>
              <ol className={styles.lessons}>
                {moduleLessons.map((lesson) => (
                  <li key={lesson.code}>
                    <Link
                      href={lessonHref(course.slug, lesson)}
                      className={styles.lesson}
                      aria-current={lesson.slug === currentSlug ? "page" : undefined}
                    >
                      <span className={styles.lessonNumber} aria-hidden="true">
                        {String(lesson.numberInModule).padStart(2, "0")}
                      </span>
                      <span className={styles.lessonTitle}>{lesson.title}</span>
                      <LessonStatusBadge status={getLessonStatus(course.slug, lesson.code)} compact={compact} />
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
