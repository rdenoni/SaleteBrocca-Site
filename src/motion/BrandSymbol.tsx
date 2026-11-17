"use client";

import { motion, type Transition } from "motion/react";
import { useMotionTokens } from "./useMotionTokens";

/* Símbolo Salete Brocca reconstruído como dois traços (peça ciano + peça azul), para poder animar.
   Geometria medida sobre public/brand/logo/simbolo-cor.png (500×500): traço de 62px, pontas e cantos arredondados.
   Para uso estático, prefira o PNG oficial; antes de produção, trocar pelos vetores do Manual da Marca. */
export const CYAN_PIECE = "M 318 114 H 160 Q 128 114 128 146 V 270 Q 128 302 160 302 H 220";
export const BLUE_PIECE = "M 182 386 H 340 Q 372 386 372 354 V 230 Q 372 198 340 198 H 280";
export const SYMBOL_STROKE = 62;
/* Recorte do desenho (500×500) que enquadra o símbolo, para quem monta as peças por conta própria. */
export const SYMBOL_VIEWBOX = "70 70 360 360";
const STROKE = SYMBOL_STROKE;

export type BrandSymbolMode = "draw" | "fit" | "static";

interface BrandSymbolProps {
  /** draw: as peças são escritas como um traço de caneta. fit: as peças chegam de lados opostos e se encaixam. */
  mode?: BrandSymbolMode;
  size?: number | string;
  trigger?: "mount" | "inView";
  delay?: number;
  className?: string;
  /** Texto alternativo. Vazio = decorativo. */
  title?: string;
}

export function BrandSymbol({ mode = "fit", size = 160, trigger = "inView", delay = 0, className, title }: BrandSymbolProps) {
  const t = useMotionTokens();
  const effectiveMode: BrandSymbolMode = t.reduced ? "static" : mode;

  const pieces = [
    { d: CYAN_PIECE, color: "var(--cyan)", from: { x: -56, y: -40 }, order: 0 },
    { d: BLUE_PIECE, color: "var(--blue)", from: { x: 56, y: 40 }, order: 1 },
  ];

  function initialFor(from: { x: number; y: number }) {
    if (effectiveMode === "draw") return { pathLength: 0, opacity: 0 };
    if (effectiveMode === "fit") return { x: from.x, y: from.y, opacity: 0 };
    return { opacity: t.reduced ? 0 : 1 };
  }

  function targetFor() {
    if (effectiveMode === "draw") return { pathLength: 1, opacity: 1 };
    if (effectiveMode === "fit") return { x: 0, y: 0, opacity: 1 };
    /* Estático: peças no lugar e traço completo, mesmo se hidratou no estado inicial de "fit" ou "draw". */
    return { opacity: 1, x: 0, y: 0, pathLength: 1 };
  }

  function transitionFor(order: number): Transition {
    const start = delay + order * (effectiveMode === "draw" ? t.duration.gentle : t.duration.quick);
    if (effectiveMode === "draw") {
      return {
        pathLength: { duration: t.duration.slow, ease: t.ease.stroke, delay: start },
        opacity: { duration: t.duration.instant, delay: start },
      };
    }
    if (effectiveMode === "fit") {
      return { ...t.spring.fit, delay: start, opacity: { duration: t.duration.quick, delay: start } };
    }
    return { duration: t.duration.quick, delay };
  }

  const viewportProps = trigger === "mount" ? {} : { viewport: t.viewport };

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="70 70 360 360"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      overflow="visible"
    >
      {pieces.map((piece) => (
        <motion.path
          key={piece.color}
          d={piece.d}
          fill="none"
          stroke={piece.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          data-reveal=""
          initial={initialFor(piece.from)}
          {...(trigger === "mount" ? { animate: targetFor() } : { whileInView: targetFor() })}
          {...viewportProps}
          transition={transitionFor(piece.order)}
        />
      ))}
    </svg>
  );
}
