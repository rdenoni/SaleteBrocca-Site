"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import styles from "./GuidedReading.module.css";
import { useMotionTokens } from "./useMotionTokens";
import { useLockedProgress } from "./useScrollEntrance";

/* Tom das palavras ainda não lidas (opacidade do --navy). Alto o bastante para o parágrafo continuar legível. */
const UNREAD_OPACITY = 0.28;
/* Cada palavra clareia numa janela de ~3 palavras: a "luz" se move como um dedo sobre a linha. */
const WINDOW_WORDS = 3;

type GuidedTag = "p" | "blockquote" | "div";

export interface GuidedReadingProps {
  text: string;
  as?: GuidedTag;
  className?: string;
}

interface WordProps {
  value: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function Word({ value, index, total, progress }: WordProps) {
  const slots = total + WINDOW_WORDS - 1;
  const opacity = useTransform(progress, [index / slots, (index + WINDOW_WORDS) / slots], [UNREAD_OPACITY, 1], {
    clamp: true,
  });
  return (
    <motion.span className={styles.word} data-reveal="" style={{ opacity }}>
      {value}
    </motion.span>
  );
}

/* "Leitura guiada" (portado do salete-motion-lab): as palavras passam do tom claro à cor plena do texto conforme o parágrafo atravessa a tela
   (do momento em que o topo chega a 85% da altura até o fim chegar a 50%).
   Acessibilidade: o leitor de tela recebe o texto uma vez (visually-hidden); as palavras animadas são aria-hidden.
   Movimento reduzido: texto simples, em tom pleno. */
export function GuidedReading({ text, as = "p", className }: GuidedReadingProps) {
  const t = useMotionTokens();
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const lockedProgress = useLockedProgress(scrollYProgress);
  const progress = useSpring(lockedProgress, t.follow);

  if (t.reduced) {
    return (
      <Tag ref={ref as never} className={className}>
        {text}
      </Tag>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref as never} className={className}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((value, index) => (
          <span key={`${value}-${index}`}>
            <Word value={value} index={index} total={words.length} progress={progress} />
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
