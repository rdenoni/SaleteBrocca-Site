"use client";

import { motion, type Variants } from "motion/react";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  percent: number;
  /** Nome acessível (ex.: "Progresso no curso"). */
  label: string;
  /** "dark" sobre fundos navy. */
  tone?: "light" | "dark";
  /** Sobre painel azul-claro: a trilha fica branca (cinza-claro some nesse fundo). */
  onTint?: boolean;
}

/* A trilha continua sendo o progressbar de verdade (role e aria-valuenow). O preenchimento cresce da esquerda
   (scaleX) herdando o estado "hidden"/"visible" do bloco em volta: começa quando o bloco começa e, fora de um bloco
   animado, aparece pronto. Coloque a barra dentro de um StaggerItem (que repassa o atraso da cascata): num Reveal
   com `delay`, o preenchimento herdaria o estado mas não o atraso e cresceria cedo demais. Sem `delay` próprio: um delay 0 anularia o do pai. */
export function ProgressBar({ percent, label, tone = "light", onTint = false }: ProgressBarProps) {
  const t = useMotionTokens();
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  /* Reduzido: só opacidade, escala fixa em 1 (o fill pode ter hidratado com scaleX 0). */
  const variants: Variants = t.reduced
    ? {
        hidden: { opacity: 0, scaleX: 1 },
        visible: { opacity: 1, scaleX: 1, transition: { duration: t.duration.quick, scaleX: { duration: 0 } } },
      }
    : {
        hidden: { scaleX: 0 },
        visible: { scaleX: 1, transition: { duration: t.duration.slow, ease: t.ease.out } },
      };

  return (
    <div
      className={styles.track}
      data-tone={tone}
      data-on-tint={onTint ? "" : undefined}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <motion.span className={styles.fill} data-reveal="" style={{ width: `${value}%`, originX: 0 }} variants={variants} />
    </div>
  );
}
