"use client";

import { useMemo } from "react";
import { useMotionPace } from "./MotionPace";
import { MOTION_SPEED } from "./settings";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { distance, duration, ease, follow, spring, stagger, viewport } from "./tokens";

type Durations = { [K in keyof typeof duration]: number };
type Staggers = { [K in keyof typeof stagger]: number };
type Springs = { -readonly [K in keyof typeof spring]: { type: "spring"; visualDuration: number; bounce: number } };

export interface ResolvedMotionTokens {
  duration: Durations;
  stagger: Staggers;
  spring: Springs;
  ease: typeof ease;
  follow: typeof follow;
  distance: typeof distance;
  viewport: typeof viewport;
  /** true quando o sistema pede menos movimento (prefers-reduced-motion). */
  reduced: boolean;
  /** Multiplicador de tempo (1 / velocidade). Fixo em 1 em produção. */
  timeScale: number;
  /** Ritmo das entradas (MotionPace). 1 em useMotionTokens; useEntranceTokens traz o do trecho. */
  pace: number;
}

const TIME_SCALE = 1 / MOTION_SPEED;

function scale<T extends Record<string, number>>(values: T, factor: number): { [K in keyof T]: number } {
  const result = {} as { [K in keyof T]: number };
  for (const key of Object.keys(values) as (keyof T)[]) {
    result[key] = Math.round(values[key] * factor * 1000) / 1000;
  }
  return result;
}

/* Todo componente lê o tempo daqui, nunca direto de tokens.ts.
   Em produção a velocidade é 1× e o movimento reduzido vem só do sistema operacional. */
export function useMotionTokens(): ResolvedMotionTokens {
  const reduced = usePrefersReducedMotion();

  return useMemo(() => {
    const springs = {} as Springs;
    for (const key of Object.keys(spring) as (keyof typeof spring)[]) {
      springs[key] = { ...spring[key], visualDuration: spring[key].visualDuration * TIME_SCALE };
    }
    return {
      duration: scale(duration, TIME_SCALE),
      stagger: scale(stagger, TIME_SCALE),
      spring: springs,
      ease,
      follow,
      distance,
      viewport,
      reduced,
      timeScale: TIME_SCALE,
      pace: 1,
    };
  }, [reduced]);
}

/* Só para os componentes de entrada (Reveal, Stagger, TextReveal, DrawRule): durações e cadências no ritmo do trecho.
   O atraso recebido por prop continua em tempo normal; o componente multiplica por `pace`. */
export function useEntranceTokens(): ResolvedMotionTokens {
  const t = useMotionTokens();
  const pace = useMotionPace();
  return useMemo(
    () => (pace === 1 ? t : { ...t, pace, duration: scale(t.duration, pace), stagger: scale(t.stagger, pace) }),
    [t, pace],
  );
}
