"use client";

import { useEffect, useState } from "react";
import { usePageTransition } from "./PageTransitionProvider";

/* Rede de segurança: se por qualquer motivo a fase "covering" nunca terminar, a entrada é liberada mesmo assim.
   O provedor já abre o conteúdo sozinho após 3 s sem navegação; este limite fica logo acima disso. */
const MAX_WAIT_MS = 4000;
/* A página entra quando a entrada do cabeçalho está 80% feita (regra da cliente: a barra NAV vem primeiro). */
const HEADER_SHARE = 0.8;
/* Se o cabeçalho nunca avisar (ex.: layout sem cabeçalho), a página não fica presa. */
const HEADER_MAX_WAIT_MS = 2500;

/* Momento (performance.now, ms) a partir do qual a página pode entrar. null = o cabeçalho ainda não começou.
   O cabeçalho vive no layout raiz e entra uma vez só: nas navegações seguintes esse momento já passou. */
let pageGateAt: number | null = null;
const listeners = new Set<() => void>();

/** Chamado pelo cabeçalho quando a entrada dele começa, com a duração total dela (s). */
export function openPageGateAfterHeader(headerSeconds: number): void {
  if (pageGateAt !== null) return;
  pageGateAt = performance.now() + headerSeconds * HEADER_SHARE * 1000;
  listeners.forEach((listener) => listener());
}

function gatePassed(): boolean {
  return typeof window !== "undefined" && pageGateAt !== null && performance.now() >= pageGateAt;
}

/* true quando a entrada do cabeçalho já está 80% feita. Na primeira carga começa false (igual ao servidor). */
function useHeaderGate(): boolean {
  const [passed, setPassed] = useState(gatePassed);

  useEffect(() => {
    if (passed) return;
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      const wait = pageGateAt === null ? HEADER_MAX_WAIT_MS : Math.max(0, pageGateAt - performance.now());
      timer = window.setTimeout(() => setPassed(true), wait);
    };
    schedule();
    listeners.add(schedule);
    return () => {
      listeners.delete(schedule);
      window.clearTimeout(timer);
    };
  }, [passed]);

  return passed;
}

/* true = o conteúdo já pode aparecer do ponto de vista da transição de página.
   - Carga normal, rota sem transição e fora do provedor: true já no primeiro render (nada espera).
   - Chegando pelo Traço, a página monta com o conteúdo escondido (fase "covering") e espera o conteúdo aparecer.
   A trava só vale para a PRIMEIRA vez: depois de liberada, sair da página (o traço de novo) não faz o título e o
   Hero voltarem ao estado inicial. Use direto só no cabeçalho; a página usa useEntranceReady. */
export function useCurtainReady(): boolean {
  const transition = usePageTransition();
  const covering = transition?.phase === "covering";
  const [released, setReleased] = useState(!covering);

  useEffect(() => {
    if (!covering) {
      setReleased(true);
      return;
    }
    const timer = window.setTimeout(() => setReleased(true), MAX_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [covering]);

  return released || !covering;
}

/* true = a entrada por montagem da página (Hero, banner, painéis) pode começar: a transição já abriu E a entrada
   do cabeçalho está 80% feita. */
export function useEntranceReady(): boolean {
  const curtain = useCurtainReady();
  const header = useHeaderGate();
  return curtain && header;
}
