"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "motion/react";
import { useMotionTokens } from "../useMotionTokens";

interface ChevronToggleProps {
  /** true = conteúdo aberto: a seta gira 180°. */
  open: boolean;
  size?: number;
  className?: string;
}

/* Seta de acordeão/seletor. Decorativa: o estado vive no aria-expanded do botão.
   Reduzido: troca instantânea de seta (sem rotação). */
export function ChevronToggle({ open, size = 20, className }: ChevronToggleProps) {
  const t = useMotionTokens();

  if (t.reduced) {
    const Icon = open ? ChevronUp : ChevronDown;
    return <Icon aria-hidden="true" width={size} height={size} strokeWidth={2.5} className={className} />;
  }

  return (
    <motion.span
      aria-hidden="true"
      className={className}
      style={{ display: "inline-flex", flex: "none" }}
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: t.duration.base, ease: t.ease.out }}
    >
      <ChevronDown width={size} height={size} strokeWidth={2.5} />
    </motion.span>
  );
}
