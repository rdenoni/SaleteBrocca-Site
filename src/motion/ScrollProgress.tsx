"use client";

import { motion, useScroll, useTransform } from "motion/react";
import type { RefObject } from "react";
import styles from "./ScrollProgress.module.css";
import { useMotionTokens } from "./useMotionTokens";

export interface ScrollProgressProps {
  /** Acompanha só este elemento (um artigo) em vez da página inteira. */
  target?: RefObject<HTMLElement | null>;
  className?: string;
}

/* Barra de leitura ciano. Decorativa: aria-hidden, sem role (o leitor de tela já tem a própria posição na página).
   O traço é ligado direto ao progresso do scroll (sem mola): o Motion só acelera o valor `transform` (não `scaleX`)
   e só quando ele vem de useScroll sem passar por useSpring. Assim, onde há ScrollTimeline/ViewTimeline, a barra
   roda no compositor, sem JavaScript a cada quadro. Sem suporte, o Motion cai no scroll em JavaScript, igual.
   Com `target`, a barra só aparece enquanto o artigo está sendo lido.
   Movimento reduzido: a barra é um indicador de estado, então continua, mas sem transform:
   o preenchimento é feito por clip-path, instantâneo. */
export function ScrollProgress({ target, className }: ScrollProgressProps) {
  const t = useMotionTokens();
  const { scrollYProgress } = useScroll(
    target ? { target, offset: ["start start", "end end"] } : undefined,
  );
  /* "transform" como valor único (com `from`/`to` em string) é o que o Motion sabe levar ao compositor. */
  const grow = useTransform(scrollYProgress, [0, 1], ["scaleX(0)", "scaleX(1)"]);
  const clip = useTransform(scrollYProgress, (value) => `inset(0 ${(1 - Math.min(Math.max(value, 0), 1)) * 100}% 0 0)`);
  const visibility = useTransform(scrollYProgress, [0, 0.01, 0.99, 1], [0, 1, 1, 0]);

  const style = t.reduced
    ? { clipPath: clip, ...(target ? { opacity: visibility } : null) }
    : { transform: grow, ...(target ? { opacity: visibility } : null) };

  return (
    <motion.div
      aria-hidden="true"
      className={[styles.bar, className ?? ""].filter(Boolean).join(" ")}
      style={style}
    />
  );
}
