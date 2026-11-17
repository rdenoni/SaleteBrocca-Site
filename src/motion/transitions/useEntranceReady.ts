"use client";

import { useEffect, useState } from "react";
import { usePageTransition } from "./PageTransitionProvider";

/* Rede de segurança: se por qualquer motivo a fase "covering" nunca terminar, a entrada é liberada mesmo assim.
   O provedor já abre o conteúdo sozinho após 3 s sem navegação; este limite fica logo acima disso. */
const MAX_WAIT_MS = 4000;

/* true = a entrada por montagem (Hero, título da página) pode começar.
   - Carga normal, rota sem transição e fora do provedor: true já no primeiro render (nada espera).
   - Chegando pelo Traço, a página monta com o conteúdo escondido (fase "covering") e a entrada espera o conteúdo
     começar a aparecer.
   A trava só vale para a PRIMEIRA vez: depois de liberada, sair da página (o traço de novo) não faz o título e o
   Hero voltarem ao estado inicial. */
export function useEntranceReady(): boolean {
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
