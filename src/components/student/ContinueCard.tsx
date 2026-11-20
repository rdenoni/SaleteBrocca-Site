import Image from "next/image";
import { getCourseProgress, lessonHref, type ProgressByCourse } from "@/lib/content/student";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { motionTokens } from "@/motion/tokens";
import type { Course } from "@/types/content";
import { ProgressBar } from "./ProgressBar";
import styles from "./ContinueCard.module.css";

interface ContinueCardProps {
  course: Course;
  /** Progresso do aluno (carregado pela página com getStudentProgress). */
  progress: ProgressByCourse;
  /** "wide" no painel (navy, foto grande); "card" em Meus cursos. */
  variant?: "wide" | "card";
  /** Com valor (s), entra ao montar como parte do topo da página; sem valor, ao chegar à tela. */
  entranceDelay?: number;
}

const { duration, stagger } = motionTokens;
/* A base se desvela primeiro; o texto começa com ela já subindo. */
const BODY_DELAY = duration.base;

/* Curso do aluno com a próxima aula e o progresso.
   Entrada: a base se desvela → selo → título → próxima aula → progresso (a barra cresce) → botões → a foto se
   desvela por último (ordem de leitura: a foto nunca aparece antes do texto que a apresenta). */
export function ContinueCard({ course, progress: progressByCourse, variant = "wide", entranceDelay }: ContinueCardProps) {
  const progress = getCourseProgress(course, progressByCourse);
  const dark = variant === "wide";
  const titleId = `${variant}-${course.slug}`;
  const trigger = entranceDelay === undefined ? "inView" : "mount";
  const start = entranceDelay ?? 0;
  /* Selo, título, [próxima aula], progresso e botões. */
  const bodyItems = progress.current ? 5 : 4;
  const photoDelay = start + BODY_DELAY + (bodyItems - 1) * stagger.items + duration.base;

  return (
    <Reveal
      as="article"
      /* O card claro tem sombra: o recorte da máscara a cortaria. */
      variant={dark ? "mask" : "rise"}
      trigger={trigger}
      delay={start}
      className={`${styles.card} ${dark ? styles.wide : ""}`}
      data-surface={dark ? "dark" : undefined}
      aria-labelledby={titleId}
    >
      <Reveal variant="mask" trigger={trigger} delay={photoDelay} className={styles.media}>
        <Image src={course.image} alt="" fill sizes="(max-width: 767px) 100vw, 480px" />
      </Reveal>
      <Stagger className={styles.body} trigger={trigger} delay={start + BODY_DELAY}>
        <StaggerItem>
          <p className="eyebrow">{dark ? "Continuar assistindo" : "Curso online"}</p>
        </StaggerItem>
        <StaggerItem>
          <h2 id={titleId} className={styles.title}>
            {course.title}
          </h2>
        </StaggerItem>
        {progress.current && (
          <StaggerItem>
            <p className={styles.next}>
              <span className={styles.nextLabel}>
                Módulo {progress.current.moduleNumber} · Aula {progress.current.numberInModule}
              </span>
              {progress.current.title}
            </p>
          </StaggerItem>
        )}
        <StaggerItem className={styles.progress}>
          <ProgressBar percent={progress.percent} label={`Progresso em ${course.title}`} tone={dark ? "dark" : "light"} />
          <p className={styles.progressText}>
            <strong>{progress.percent}% concluído</strong> · {progress.completed} de {progress.total} aulas
          </p>
        </StaggerItem>
        <StaggerItem className={styles.actions}>
          {progress.current && (
            <MotionButton href={lessonHref(course.slug, progress.current)} variant={dark ? "accent" : "primary"}>
              Continuar aula
            </MotionButton>
          )}
          <MotionButton href={`/area-do-aluno/cursos/${course.slug}`} variant={dark ? "ghost" : "outline"}>
            Ver módulos
          </MotionButton>
        </StaggerItem>
      </Stagger>
    </Reveal>
  );
}
