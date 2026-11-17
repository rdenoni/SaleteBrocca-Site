"use client";

import { animate, useInView, useMotionValue, useTransform, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./CountUp.module.css";

interface CountUpProps {
  /** Valor final (vem dos dados reais). */
  value: number;
  /** Texto depois do número, ex.: "módulos". */
  unit: string;
  /** Atraso (s) antes de começar a contar, depois que o número entra na tela. */
  delay?: number;
}

/* Número que conta de 0 até o valor final ao entrar na tela.
   - Os dígitos animados são aria-hidden; leitores de tela (e quem não tem JavaScript) recebem o valor final.
   - O servidor já renderiza o valor final: o 0 só entra no cliente, antes da pintura (useLayoutEffect).
   - O valor passa por um motion value: nenhum estado do React por quadro.
   - Movimento reduzido: número final estático. */
export function CountUp({ value, unit, delay = 0 }: CountUpProps) {
  const t = useMotionTokens();
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useMotionValue(value);
  const rounded = useTransform(shown, (current) => Math.round(current));
  const inView = useInView(ref, { once: true, margin: t.viewport.margin });

  useLayoutEffect(() => {
    shown.set(t.reduced ? value : 0);
  }, [shown, t.reduced, value]);

  useEffect(() => {
    if (!inView || t.reduced) return;
    const controls = animate(shown, value, { duration: t.duration.slow, ease: [...t.ease.out], delay });
    return () => controls.stop();
  }, [inView, t.reduced, t.duration.slow, t.ease.out, shown, value, delay]);

  return (
    <span ref={ref}>
      <span className={styles.digits} aria-hidden="true" style={{ minWidth: `${String(value).length}ch` }}>
        <motion.span>{rounded}</motion.span>
      </span>
      <span className="visually-hidden">{value}</span> {unit}
    </span>
  );
}
