"use client";

import { useRouter } from "next/navigation";
import { useCallback, type MouseEvent } from "react";
import { usePageTransition } from "@/motion/transitions/PageTransitionProvider";

/* Clique "comum": botão principal, sem Ctrl/Cmd/Shift/Alt. O resto o navegador trata sozinho (nova aba etc.). */
export function isPlainLeftClick(event: MouseEvent<HTMLElement>): boolean {
  return !event.defaultPrevented && event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

/* Navegação programática do menu móvel: toca o traço da transição de página e, sem o provedor, cai no router
   comum. Os links do site são rotas reais, então não há âncoras da Home nem rolagem aqui. */
export function useChromeNavigation(): { go: (href: string) => void } {
  const router = useRouter();
  const transition = usePageTransition();

  const go = useCallback(
    (href: string) => {
      if (transition) transition.navigate(href);
      else router.push(href);
    },
    [router, transition],
  );

  return { go };
}
