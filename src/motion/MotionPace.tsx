"use client";

import { createContext, useContext, type ReactNode } from "react";

const PaceContext = createContext(1);

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
