"use client";

import { motion } from "motion/react";
import { CirclePlay, Layers } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { MotionButton } from "@/motion/MotionButton";
import { TransitionLink } from "@/motion/transitions/TransitionLink";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { useScrollEntrance } from "@/motion/useScrollEntrance";
import { countLessons } from "@/lib/content/courses";
import { HOME_COURSES } from "@/lib/content/home";
import type { Course } from "@/types/content";
import { CountUp } from "./CountUp";
import styles from "./CourseCard.module.css";

/* No hover o card sobe poucos pixels (a foto aproxima 1,04 em CSS, dentro da moldura). */
const HOVER_LIFT = -4;

/* Card do curso em destaque (CourseCard do site), animado.
   Entrada: conduzida pela rolagem (opacidade + subida do card inteiro; rolar para cima desfaz), começando quando o
   topo do card está ~12% dentro da tela e terminando antes do meio dela. Os números ainda contam ao entrar na tela.
   Hover: o card sobe e a foto aproxima (CSS). */
interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const t = useMotionTokens();
  const moduleCount = course.modules.length;
  const lessonCount = countLessons(course);
  const courseHref = `/cursos/${course.slug}`;
  const entranceRef = useRef<HTMLDivElement>(null);
  const { style } = useScrollEntrance(entranceRef);

  /* Os números só começam a contar um pouco depois de entrarem na faixa, quando o card já aparece. */
  const countDelay = t.reduced ? 0 : t.duration.gentle;

  return (
    /* O estilo de entrada fica neste invólucro, não no <article>: o hover (y) do article não disputa o mesmo transform.
       data-reveal: sem JavaScript o <noscript> do layout anula o opacity 0 inicial. */
    <motion.div ref={entranceRef} style={style} data-reveal="">
      <motion.article
        className={styles.shell}
        data-reduced={t.reduced ? "" : undefined}
        whileHover={t.reduced ? undefined : { y: HOVER_LIFT }}
        transition={t.spring.ui}
      >
        <div className={styles.card}>
          {/* Link só para o mouse: cobre o card inteiro. Teclado e leitor de tela usam o botão "Ver curso". */}
          <TransitionLink href={courseHref} className={styles.cardLink} tabIndex={-1} aria-hidden="true" />
          <div className={styles.media}>
            <div className={styles.zoom}>
              <div className={styles.imageLayer}>
                <Image
                  src={course.image}
                  alt={course.imageAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, 600px"
                  className={styles.image}
                />
              </div>
            </div>
            <span className={styles.badge}>{HOME_COURSES.badge}</span>
          </div>
          <div className={styles.body}>
            <h3 className={styles.title}>{course.title}</h3>
            <p className={styles.text}>{course.audience}</p>
            <ul className={styles.meta}>
              <li>
                <span className={styles.icon}>
                  <Layers aria-hidden="true" />
                </span>
                <CountUp value={moduleCount} unit={moduleCount === 1 ? "módulo" : "módulos"} delay={countDelay} />
              </li>
              <li>
                <span className={styles.icon}>
                  <CirclePlay aria-hidden="true" />
                </span>
                <CountUp value={lessonCount} unit={lessonCount === 1 ? "aula" : "aulas"} delay={countDelay} />
              </li>
            </ul>
            <div className={styles.action}>
              <MotionButton href={courseHref} variant="primary" withCurtain>
                {HOME_COURSES.cta}
              </MotionButton>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
