"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useRef, type RefObject } from "react";

/* `will-change` só enquanto a camada se move de verdade: com o progresso do scroll estritamente entre 0 e 1
   (a moldura atravessando a tela). Fora disso a propriedade sai, e a camada não fica promovida (e na memória
   da GPU) sem animação. A escrita vai direto no elemento e só quando cruza a fronteira: nenhum estado do React,
   nenhuma re-renderização por quadro. Sem `enabled` (movimento reduzido: camada parada) nunca promove. */
export function useScrollWillChange(
  ref: RefObject<HTMLElement | null>,
  progress: MotionValue<number>,
  enabled: boolean,
  property = "transform",
): void {
  const promoted = useRef(false);

  useMotionValueEvent(progress, "change", (value) => {
    const element = ref.current;
    if (!element) return;
    const wanted = enabled && value > 0 && value < 1;
    if (wanted === promoted.current) return;
    promoted.current = wanted;
    element.style.willChange = wanted ? property : "";
  });
}
