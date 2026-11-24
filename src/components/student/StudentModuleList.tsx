import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getLessonRefs, getLessonStatus, lessonHref, type ProgressByCourse } from "@/lib/content/student";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { motionTokens } from "@/motion/tokens";
import type { Course } from "@/types/content";
import { LessonStatusBadge } from "./LessonStatusBadge";
import styles from "./StudentModuleList.module.css";

const { duration, stagger } = motionTokens;

interface StudentModuleListProps {
  course: Course;
  /** Progresso do aluno (carregado pela página com getStudentProgress). */
  progress: ProgressByCourse;
  /** Aula aberta no player: fica marcada e seu módulo começa aberto. */
  currentSlug?: string;
  /** Módulo que começa aberto quando não há aula atual. */
  openModule?: number;
  /** Versão estreita da lateral do player: status só com ícone. */
  compact?: boolean;
  /** Espera (s) antes do primeiro módulo; a página passa o fim do título da seção (afterTitle). */
  delay?: number;
}

/* Módulos em acordeão nativo; cada aula é um link para o player, com o estado em ícone + palavra.
   Entrada (por viewport): módulo a módulo, de cima para baixo; as aulas do módulo aberto entram em cascata logo
   depois do cabeçalho dele. Módulos fechados não estão na tela: as aulas entram quando o aluno abre o módulo. */
export function StudentModuleList({
  course,
  progress,
  currentSlug,
  openModule,
  compact = false,
  delay = 0,
}: StudentModuleListProps) {
  const lessons = getLessonRefs(course);

  return (
    <Stagger as="ol" delay={delay} className={compact ? `${styles.list} ${styles.compact}` : styles.list}>
      {course.modules.map((module, index) => {
        const moduleLessons = lessons.filter((lesson) => lesson.moduleNumber === module.number);
        const done = moduleLessons.filter(
          (lesson) => getLessonStatus(course.slug, lesson.code, progress) === "completed",
        ).length;
        const isOpen =
          module.number === openModule || moduleLessons.some((lesson) => lesson.slug === currentSlug);

        return (
          <StaggerItem as="li" key={module.number}>
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
                <ChevronDown className={styles.chevron} aria-hidden="true" size={24} />
              </summary>
              <Stagger
                as="ol"
                className={styles.lessons}
                /* Fechado, o atraso da página não vale: a cascata roda quando o aluno abre o módulo. */
                delay={isOpen ? delay + index * stagger.items + duration.quick : 0}
              >
                {moduleLessons.map((lesson) => (
                  <StaggerItem as="li" key={lesson.code}>
                    <Link
                      href={lessonHref(course.slug, lesson)}
                      className={styles.lesson}
                      aria-current={lesson.slug === currentSlug ? "page" : undefined}
                    >
                      <span className={styles.lessonNumber} aria-hidden="true">
                        {String(lesson.numberInModule).padStart(2, "0")}
                      </span>
                      <span className={styles.lessonTitle}>{lesson.title}</span>
                      <LessonStatusBadge status={getLessonStatus(course.slug, lesson.code, progress)} compact={compact} />
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </details>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
