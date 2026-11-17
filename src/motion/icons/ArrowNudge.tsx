"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useMotionTokens } from "../useMotionTokens";

interface ArrowNudgeProps {
  size?: number;
  /** Controla o deslocamento por fora (ex.: o pai está em hover/foco). Sem isso, a própria seta reage ao hover. */
  active?: boolean;
  className?: string;
}

/* Seta que avança distance.micro (4px) quando ativa. Decorativa.
   Com movimento reduzido, não se desloca. */
export function ArrowNudge({ size = 18, active, className }: ArrowNudgeProps) {
  const t = useMotionTokens();
  const shift = t.reduced ? 0 : t.distance.micro;
  const transition = { duration: t.duration.quick, ease: t.ease.out };

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      style={{ display: "inline-flex", flex: "none" }}
      initial={false}
      animate={active === undefined ? undefined : { x: active ? shift : 0 }}
      whileHover={active === undefined ? { x: shift } : undefined}
      transition={transition}
    >
      <ArrowRight width={size} height={size} strokeWidth={2.5} />
    </motion.span>
  );
}
