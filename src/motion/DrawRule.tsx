"use client";

import { motion } from "motion/react";
import { useMotionTokens } from "./useMotionTokens";

interface DrawRuleProps {
  className?: string;
  delay?: number;
  trigger?: "mount" | "inView";
  /** Só com trigger "mount": false segura o estado inicial (ex.: esperar a cortina de transição abrir). */
  play?: boolean;
}

/* O traço: a régua ciano (classe global .rule, 120×6) se desenha da esquerda para a direita,
   como a caneta que sublinha uma palavra. Decorativa: aria-hidden. */
export function DrawRule({ className, delay = 0, trigger = "inView", play: shouldPlay = true }: DrawRuleProps) {
  const t = useMotionTokens();
  /* Reduzido: só opacidade, com a escala fixa em 1 (a régua pode ter hidratado com scaleX 0). */
  const from = t.reduced ? { opacity: 0, scaleX: 1 } : { scaleX: 0 };
  const to = t.reduced ? { opacity: 1, scaleX: 1 } : { scaleX: 1 };
  const transition = t.reduced
    ? { duration: t.duration.quick, delay, scaleX: { duration: 0 } }
    : { duration: t.duration.slow, ease: t.ease.stroke, delay };
  const play = trigger === "mount" ? { animate: shouldPlay ? to : from } : { whileInView: to, viewport: t.viewport };

  return (
    <motion.span
      aria-hidden="true"
      className={["rule", className].filter(Boolean).join(" ")}
      data-reveal=""
      style={{ originX: 0 }}
      initial={from}
      transition={transition}
      {...play}
    />
  );
}
