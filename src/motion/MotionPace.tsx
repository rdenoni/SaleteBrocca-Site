"use client";

import { createContext, useContext, type ReactNode } from "react";

const PaceContext = createContext(1);

/** Área do Aluno: telas abertas muitas vezes seguidas (aula, curso, materiais). */
export const STUDENT_PACE = 0.4;
/** Loja e Conteúdo: o visitante passa de página em página; a entrada não pode segurar a leitura. */
export const BROWSE_PACE = 0.6;

/** Ritmo das entradas neste trecho da página: 1 = normal; 0,4 = a mesma ordem em 40% do tempo. */
export function useMotionPace(): number {
  return useContext(PaceContext);
}

/* Telas abertas muitas vezes seguidas (a aula) não podem fazer o aluno esperar: mesma ordem de leitura, mais curta.
   Vale para as entradas (Reveal, Stagger, TextReveal, DrawRule e as esperas do topo); hover, toque e abas não mudam.
   Os atrasos continuam escritos em tempo normal: os componentes de entrada aplicam o ritmo. */
export function MotionPace({ pace, children }: { pace: number; children: ReactNode }) {
  return <PaceContext.Provider value={pace}>{children}</PaceContext.Provider>;
}
