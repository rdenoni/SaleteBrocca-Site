"use client";

import { motion } from "motion/react";
import { useMotionTokens } from "../useMotionTokens";

interface MenuToggleIconProps {
  /** true = menu aberto (mostra o X). */
  open: boolean;
  size?: number;
  className?: string;
}

/* Cada linha gira em torno do próprio centro (fill-box), sem depender da origem do SVG. */
const lineStyle = { transformBox: "fill-box", transformOrigin: "50% 50%" } as const;

/* Hambúrguer ↔ fechar. Decorativo: o botão que o contém carrega aria-expanded e aria-label.
   Linhas de cima e de baixo descem/sobem e giram; a do meio some. Reduzido: troca por fade. */
export function MenuToggleIcon({ open, size = 24, className }: MenuToggleIconProps) {
  const t = useMotionTokens();
  const common = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" } as const;

  if (t.reduced) {
    const fade = { duration: t.duration.quick };
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={className}>
        <motion.g {...common} initial={false} animate={{ opacity: open ? 0 : 1 }} transition={fade}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </motion.g>
        <motion.g {...common} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={fade}>
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </motion.g>
      </svg>
    );
  }

  const transition = t.spring.ui;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={className}>
      <motion.line
        {...common}
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        style={lineStyle}
        initial={false}
        animate={{ y: open ? 6 : 0, rotate: open ? 45 : 0 }}
        transition={transition}
      />
      <motion.line
        {...common}
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        style={lineStyle}
        initial={false}
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.4 : 1 }}
        transition={{ duration: t.duration.quick, ease: t.ease.out }}
      />
      <motion.line
        {...common}
        x1="4"
        y1="18"
        x2="20"
        y2="18"
        style={lineStyle}
        initial={false}
        animate={{ y: open ? -6 : 0, rotate: open ? -45 : 0 }}
        transition={transition}
      />
    </svg>
  );
}
