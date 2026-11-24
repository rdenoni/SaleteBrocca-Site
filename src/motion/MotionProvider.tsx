"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { MOTION_REDUCED_SETTING } from "./settings";
import { SmoothScroll } from "./SmoothScroll";

/* Envolve o app uma única vez (no layout raiz).
   MotionConfig reducedMotion="user" desliga transform e layout quando o sistema pede menos movimento;
   opacidade e cor continuam, então nada some e nada fica escondido. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion={MOTION_REDUCED_SETTING}>
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
