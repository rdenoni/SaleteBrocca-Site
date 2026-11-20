"use client";

import type { TargetAndTransition, Transition, Variants } from "motion/react";
import { useLayoutEffect } from "react";
import { headerGateAt } from "./transitions/useEntranceReady";

/* Ordem de leitura (de cima para baixo, da esquerda para a direita): uma seção que já está na tela quando a página
   abre não pode entrar antes do topo (cabeçalho → banner → apresentação). As sequências do topo (PageBanner,
   AboutIntro, HeroSequence) avisam até quando vão; as entradas por viewport (Reveal, TextReveal, Stagger, DrawRule...)
   somam a espera que falta no momento em que disparam. Rolando a página depois, a espera já é zero. */

let holdUntil = 0;

function now(): number {
  return typeof performance === "undefined" ? 0 : performance.now();
}

/** Segundos que uma entrada por viewport ainda deve esperar o topo da página. */
export function inViewWait(): number {
  return Math.max(0, (holdUntil - now()) / 1000);
}

/** Sequências do topo: até quando (s a partir do início delas) as entradas por viewport devem esperar. */
export function useHoldInView(seconds: number, ready: boolean): void {
  /* Layout effect: roda antes de qualquer observador de viewport disparar. Sem `ready` (esperando o cabeçalho ou a
     cortina), estima o início pelo momento em que o cabeçalho libera a página; ao liberar, recalcula. */
  useLayoutEffect(() => {
    const start = ready ? now() : Math.max(now(), headerGateAt() ?? now());
    holdUntil = Math.max(holdUntil, start + seconds * 1000);
  }, [seconds, ready]);
}

function shiftDelays(target: TargetAndTransition, wait: number): TargetAndTransition {
  if (wait <= 0) return target;
  const transition = (target.transition ?? {}) as Record<string, unknown>;
  const shifted: Record<string, unknown> = { ...transition, delay: Number(transition.delay ?? 0) + wait };
  /* Transições por valor (ex.: opacity: { delay }) não herdam o atraso de cima: desloca cada uma também. */
  for (const [key, value] of Object.entries(transition)) {
    if (value && typeof value === "object" && !Array.isArray(value) && "delay" in value) {
      const valueTransition = value as { delay?: number };
      shifted[key] = { ...valueTransition, delay: Number(valueTransition.delay ?? 0) + wait };
    }
  }
  return { ...target, transition: shifted as Transition };
}

/** Variantes de uma entrada por viewport que esperam o topo da página (resolvidas quando a entrada dispara). */
export function withInViewWait(variants: Variants): Variants {
  const visible = variants.visible;
  if (!visible || typeof visible === "function") return variants;
  return { ...variants, visible: () => shiftDelays(visible, inViewWait()) };
}
