"use client";

import { useEffect, useMemo } from "react";
import { MOTION_SPEED } from "../settings";
import { distance, duration, ease, stagger, type CubicBezier } from "../tokens";
import { useMotionTokens } from "../useMotionTokens";
import { registerGsap } from "./registerGsap";
import { GSAP_CONDITIONS } from "./gsapConditions";

/* Condições para gsap.matchMedia(). O movimento reduzido chega pelo flag `reduced` deste hook
   (e entra nas dependências do useGSAP).
   Moram em gsapConditions.ts (sem importar o GSAP) para o CourseTrail decidir a largura antes de carregá-lo. */
export { GSAP_CONDITIONS };

/* Curva cúbica de Bézier como função (p) => valor, no formato que o GSAP aceita em `ease`.
   Assim o GSAP usa exatamente as mesmas curvas dos tokens do Motion. */
export function bezierEase([x1, y1, x2, y2]: CubicBezier): (progress: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;

  return (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let step = 0; step < 24; step += 1) {
      const middle = (low + high) / 2;
      if (sampleX(middle) < progress) low = middle;
      else high = middle;
    }
    return sampleY((low + high) / 2);
  };
}

export const gsapEase = {
  out: bezierEase(ease.out),
  inOut: bezierEase(ease.inOut),
  in: bezierEase(ease.in),
  stroke: bezierEase(ease.stroke),
};

export interface GsapMotion {
  /** true quando o sistema pede menos movimento (prefers-reduced-motion). */
  reduced: boolean;
  /** Sempre 1 em produção (mantido para a forma do hook). */
  speed: number;
  duration: typeof duration;
  stagger: typeof stagger;
  distance: typeof distance;
  ease: typeof gsapEase;
}

/* Liga o GSAP ao site: registra os plugins e expõe o movimento reduzido. A velocidade é fixa em 1×. */
export function useGsapMotion(): GsapMotion {
  const { reduced } = useMotionTokens();

  useEffect(() => {
    registerGsap();
  }, []);

  return useMemo(
    () => ({ reduced, speed: MOTION_SPEED, duration, stagger, distance, ease: gsapEase }),
    [reduced],
  );
}
