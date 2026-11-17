"use client";

import { motion } from "motion/react";
import { useMotionTokens } from "../useMotionTokens";

interface AnimatedCheckProps {
  size?: number;
  /** Atraso antes de começar o traço, em segundos. */
  delay?: number;
  className?: string;
}

/* O traço: o círculo se completa e, em seguida, o check, como a caneta que confirma.
   Decorativo (aria-hidden): a mensagem de sucesso ao lado carrega o significado.
   Reduzido: círculo e check aparecem por opacidade, sem desenho. */
export function AnimatedCheck({ size = 24, delay = 0, className }: AnimatedCheckProps) {
  const t = useMotionTokens();
  const stroke = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

  /* O círculo começa no topo (12h): path em vez de <circle> evita girar o elemento. */
  const circlePath = "M12 2.5a9.5 9.5 0 1 1 0 19a9.5 9.5 0 1 1 0 -19";
  const checkPath = "M7.5 12.5l3 3l6 -6.5";

  const circleFrom = t.reduced ? { opacity: 0, pathLength: 1 } : { opacity: 0, pathLength: 0 };
  const checkFrom = circleFrom;
  const circleTo = { opacity: 1, pathLength: 1 };

  const circleTransition = t.reduced
    ? { duration: t.duration.quick, delay }
    : {
        pathLength: { duration: t.duration.gentle, ease: t.ease.stroke, delay },
        opacity: { duration: t.duration.instant, delay },
      };
  const checkTransition = t.reduced
    ? { duration: t.duration.quick, delay }
    : {
        pathLength: { duration: t.duration.base, ease: t.ease.stroke, delay: delay + t.duration.gentle * 0.7 },
        opacity: { duration: t.duration.instant, delay: delay + t.duration.gentle * 0.7 },
      };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <motion.path
        d={circlePath}
        {...stroke}
        data-reveal=""
        initial={circleFrom}
        animate={circleTo}
        transition={circleTransition}
      />
      <motion.path
        d={checkPath}
        {...stroke}
        data-reveal=""
        initial={checkFrom}
        animate={circleTo}
        transition={checkTransition}
      />
    </svg>
  );
}
