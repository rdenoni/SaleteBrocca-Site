"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;
/* O servidor não sabe a preferência: renderiza o movimento completo. */
const getServerSnapshot = (): boolean => false;

/* Preferência do sistema por menos movimento, segura para a hidratação.
   O useReducedMotion do Motion lê o matchMedia já no primeiro render do cliente, então com "reduzir movimento"
   ligado o cliente renderiza outra árvore que a do servidor (erro de hidratação) e estilos que o React não corrige
   (títulos presos dentro da máscara). Aqui a hidratação usa o valor do servidor e só depois troca para o real. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
