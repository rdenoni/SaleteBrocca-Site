"use client";

import { motion, type Variants } from "motion/react";
import { withInViewWait } from "./pageSequence";
import { useEntranceTokens } from "./useMotionTokens";

interface DrawRuleProps {
  className?: string;
  delay?: number;
  trigger?: "mount" | "inView";
  /** Só com trigger "mount": false segura o estado inicial (ex.: esperar a cortina de transição abrir). */
  play?: boolean;
}

/* O traço: a régua ciano (classe global .rule, 120×6) se desenha da esquerda para a direita,
   como a caneta que sublinha uma palavra. Decorativa: aria-hidden. */
export function DrawRule({ className, delay: delayProp = 0, trigger = "inView", play: shouldPlay = true }: DrawRuleProps) {
  const t = useEntranceTokens();
  const delay = delayProp * t.pace;
  /* Reduzido: só opacidade, com a escala fixa em 1 (a régua pode ter hidratado com scaleX 0). */
  const from = t.reduced ? { opacity: 0, scaleX: 1 } : { scaleX: 0 };
  const to = t.reduced ? { opacity: 1, scaleX: 1 } : { scaleX: 1 };
  const transition = t.reduced
    ? { duration: t.duration.quick, delay, scaleX: { duration: 0 } }
    : { duration: t.duration.slow, ease: t.ease.stroke, delay };
  const base: Variants = { hidden: from, visible: { ...to, transition } };
  /* Por viewport: espera o topo da página se já estava na tela ao abrir (ordem de leitura). */
  const variants = trigger === "mount" ? base : withInViewWait(base);
  const play =
    trigger === "mount"
      ? { animate: shouldPlay ? "visible" : "hidden" }
      : { whileInView: "visible", viewport: t.viewport };

  return (
    <motion.span
      aria-hidden="true"
      className={["rule", className].filter(Boolean).join(" ")}
      data-reveal=""
      style={{ originX: 0 }}
      initial="hidden"
      variants={variants}
      {...play}
    />
  );
}
