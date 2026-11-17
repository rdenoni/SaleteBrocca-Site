"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PAGE_TRANSITION_MODE, type PageTransitionMode } from "../settings";
import { Trace, type TraceHandle } from "./Trace";

export type { PageTransitionMode };
/* "covering" = a página atual está saindo e a nova ainda não chegou; "revealing" = a nova está entrando.
   (O nome vem da cortina do laboratório, que não existe no site.) */
export type PageTransitionPhase = "idle" | "covering" | "revealing";

export interface NavigateOptions {
  replace?: boolean;
}

export interface PageTransitionContextValue {
  /** Sempre "trace" no site. */
  mode: PageTransitionMode;
  phase: PageTransitionPhase;
  /** true quando a transição intercepta cliques. Sempre true no site (o traço também vale com movimento
      reduzido, como esmaecer curto). Nome mantido por compatibilidade com o laboratório. */
  curtainActive: boolean;
  /** Navega tocando o traço. Sem interceptação (mesmo caminho), equivale a router.push. */
  navigate: (href: string, options?: NavigateOptions) => void;
}

const PageTransitionContext = createContext<PageTransitionContextValue | null>(null);

/* Se a navegação travar, a cortina abre mesmo assim depois deste tempo (contado após o router.push). */
const SAFETY_TIMEOUT_MS = 3000;
/* Espera depois que o caminho muda, para a página nova pintar antes de as peças saírem. */
const PAINT_FRAMES = 2;
const FOCUS_DELAY_MS = 80;

interface PathWaiter {
  from: string;
  settle: () => void;
}

/* Elemento da #âncora (hash com o "#"), se existir na página. */
function hashTarget(hash: string): HTMLElement | null {
  if (hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

function nextFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) resolve();
      else requestAnimationFrame(() => step(remaining - 1));
    };
    step(count);
  });
}

/* Máquina de estados da transição de página.
   idle → covering → (router.push, espera o pathname mudar) → revealing → idle.
   - O "Traço" nunca cobre a tela. Saída = régua a ~70% + conteúdo esmaece e sobe; chegada = régua completa
     e some + conteúdo novo sobe e aparece. Movimento reduzido: só um esmaecer curto, sem régua.
   - Voltar/avançar do navegador não passam por aqui: o Next navega sozinho, sem transição.
   - Cliques com modificador, outra aba, outra origem, mesmo caminho ou só hash nem chegam aqui (ver TransitionLink).
   - Só links que usam TransitionLink (ou chamam navigate) tocam o traço; um next/link comum navega direto. */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhaseState] = useState<PageTransitionPhase>("idle");

  const traceRef = useRef<TraceHandle>(null);
  const awaitingArrivalRef = useRef(false);
  const phaseRef = useRef<PageTransitionPhase>("idle");
  const pathnameRef = useRef(pathname);
  const previousPathRef = useRef<string | null>(null);
  const waiterRef = useRef<PathWaiter | null>(null);
  const runIdRef = useRef(0);
  const abortedRef = useRef(false);
  const mountedRef = useRef(false);

  const mode = PAGE_TRANSITION_MODE;
  const curtainActive = true;

  const setPhase = useCallback((next: PageTransitionPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  /* Vida do provedor: o que estiver em andamento é descartado ao desmontar (inclui o strict mode). */
  useEffect(() => {
    mountedRef.current = true;
    const trace = traceRef.current;
    const onPopState = () => {
      abortedRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      mountedRef.current = false;
      runIdRef.current += 1;
      window.removeEventListener("popstate", onPopState);
      waiterRef.current?.settle();
      trace?.reset();
    };
  }, []);

  /* Traço: a página nova monta com o conteúdo já escondido, antes da primeira pintura (sem quadro piscando).
     A chegada (finishReveal) o revela. Roda depois dos efeitos dos filhos, então o que eles medem não muda. */
  useLayoutEffect(() => {
    if (awaitingArrivalRef.current) traceRef.current?.hideContent();
  }, [pathname]);

  /* A cada mudança de caminho: libera quem espera, e (menos na primeira carga) leva o foco ao conteúdo.
     O anúncio da página nova fica com o anunciador de rotas do próprio Next (um segundo anúncio seria repetido).
     Vale para qualquer modo e para voltar/avançar. */
  useEffect(() => {
    pathnameRef.current = pathname;
    const waiter = waiterRef.current;
    if (waiter && pathname !== waiter.from) waiter.settle();

    const previous = previousPathRef.current;
    previousPathRef.current = pathname;
    if (previous === null || previous === pathname) return;

    const timer = window.setTimeout(() => {
      /* Chegou numa #âncora: o foco vai para ela, e o próximo Tab segue dali (não volta ao topo da página).
         O contorno desse foco é tirado em globals.css ([data-anchor-target]); os controles dentro mantêm o anel. */
      const anchor = hashTarget(window.location.hash);
      if (anchor) {
        if (!anchor.hasAttribute("tabindex")) anchor.setAttribute("tabindex", "-1");
        anchor.setAttribute("data-anchor-target", "");
        anchor.focus({ preventScroll: true });
        return;
      }
      const main = document.getElementById("conteudo");
      /* tabindex -1: focável por script, fora da ordem do Tab. O contorno desse foco é tirado no motion.css. */
      if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    }, FOCUS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const waitForPathChange = useCallback((from: string): Promise<void> => {
    return new Promise((resolve) => {
      let done = false;
      const timer = window.setTimeout(() => settle(), SAFETY_TIMEOUT_MS);
      function settle() {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        if (waiterRef.current?.settle === settle) waiterRef.current = null;
        resolve();
      }
      waiterRef.current = { from, settle };
    });
  }, []);

  const finishReveal = useCallback(
    async (runId: number, trace: TraceHandle) => {
      if (!mountedRef.current || runId !== runIdRef.current) return;
      awaitingArrivalRef.current = false;
      /* Entradas por montagem (useEntranceReady) começam agora: junto com o conteúdo novo aparecendo. */
      setPhase("revealing");
      await trace.arrive();
      if (mountedRef.current && runId === runIdRef.current) setPhase("idle");
    },
    [setPhase],
  );

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      const go = (scroll: boolean) => {
        if (options?.replace) router.replace(href, { scroll });
        else router.push(href, { scroll });
      };

      const target = new URL(href, window.location.href);
      const sameDocumentPath = target.pathname === pathnameRef.current;
      const trace = traceRef.current;

      /* Sem transição, durante a saída, ou mesmo caminho: navegação comum.
         Saindo: o clique duplicado é ignorado. */
      if (phaseRef.current === "covering") return;
      if (!trace || sameDocumentPath || phaseRef.current !== "idle") {
        go(true);
        return;
      }

      const runId = ++runIdRef.current;
      abortedRef.current = false;
      setPhase("covering");

      void (async () => {
        await trace.leave();
        if (!mountedRef.current || runId !== runIdRef.current) return;

        /* Voltar/avançar durante a saída: o usuário já decidiu outro destino. Só devolve a tela ao normal. */
        if (abortedRef.current) {
          await finishReveal(runId, trace);
          return;
        }

        const arrival = waitForPathChange(pathnameRef.current);
        awaitingArrivalRef.current = true;
        go(false);
        await arrival;
        if (!mountedRef.current || runId !== runIdRef.current) return;

        /* Como o next/link: com #âncora, chega na âncora; sem, no topo. */
        /* scrollIntoView respeita o scroll-padding-top do <html>: o alvo fica abaixo do cabeçalho fixo. */
        const anchor = hashTarget(target.hash);
        if (anchor) anchor.scrollIntoView({ block: "start", behavior: "instant" });
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        await nextFrames(PAINT_FRAMES);
        await finishReveal(runId, trace);
      })();
    },
    [finishReveal, router, setPhase, waitForPathChange],
  );

  const value = useMemo<PageTransitionContextValue>(
    () => ({ mode, phase, curtainActive, navigate }),
    [mode, curtainActive, phase, navigate],
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
      <Trace handleRef={traceRef} />
    </PageTransitionContext.Provider>
  );
}

/* Fora do provedor devolve null: quem chama cai no comportamento comum do next/link. */
export function usePageTransition(): PageTransitionContextValue | null {
  return useContext(PageTransitionContext);
}
