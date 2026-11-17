"use client";

import { animate } from "motion/react";
import { useImperativeHandle, useRef, type Ref } from "react";
import { useMotionTokens } from "../useMotionTokens";
import styles from "./Trace.module.css";

/* Comandos do "Traço". O provedor decide QUANDO; aqui está o COMO.
   Os nomes seguem a Curtain (cover/reveal) para o provedor tratar as duas do mesmo jeito. */
export interface TraceHandle {
  /** Saída: a régua corre até ~70% da largura enquanto o conteúdo atual esmaece e sobe um pouco. */
  leave: () => Promise<void>;
  /** Esconde o conteúdo recém-montado ANTES da pintura (useLayoutEffect), sem animar (só opacidade). */
  hideContent: () => void;
  /** Chegada: a régua completa e some; o conteúdo novo sobe e aparece. */
  arrive: () => Promise<void>;
  /** Interrompe e devolve o conteúdo ao normal (desmontagem). */
  reset: () => void;
}

interface TraceProps {
  handleRef: Ref<TraceHandle>;
}

/* Quanto da largura a régua cobre enquanto a página nova ainda não chegou. */
const LINE_REACH = 0.7;
/* Folga além da duração da saída antes de navegar mesmo sem as animações terminarem (ver leave). */
const LEAVE_GRACE_MS = 250;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

type TraceState = "idle" | "drawing" | "finishing";

function contentElement(): HTMLElement | null {
  return document.getElementById("conteudo");
}

/* Um quadro depois: o Motion grava o estado final (opacity 1, transform none) ao terminar, e isso vem por último. */
function clearContentStyles(element: HTMLElement | null) {
  requestAnimationFrame(() => {
    element?.style.removeProperty("opacity");
    element?.style.removeProperty("transform");
  });
}

/* Régua decorativa (aria-hidden, sem clique, sem foco). O conteúdo que entra e sai é o <main id="conteudo">:
   o cabeçalho e o rodapé nunca se mexem. Ao terminar, o conteúdo fica sem opacity e sem transform inline
   (um transform restante quebraria elementos fixos e o pin do ScrollTrigger). */
export function Trace({ handleRef }: TraceProps) {
  const t = useMotionTokens();
  const tokensRef = useRef(t);
  tokensRef.current = t;

  const lineRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef<{ stop: () => void }[]>([]);

  function setState(state: TraceState) {
    if (lineRef.current) lineRef.current.dataset.state = state;
  }

  function stopRunning() {
    runningRef.current.forEach((controls) => controls.stop());
    runningRef.current = [];
  }

  function resetLine() {
    const line = lineRef.current;
    if (!line) return;
    line.style.removeProperty("opacity");
    line.style.removeProperty("transform");
    setState("idle");
  }

  async function leave() {
    stopRunning();
    const tokens = tokensRef.current;
    const main = contentElement();
    const running: { stop: () => void; finished: Promise<unknown> }[] = [];

    if (main) {
      /* Saída mais curta que a entrada, com ease.in. Movimento reduzido: só opacidade. */
      const keyframes = tokens.reduced ? { opacity: [1, 0] } : { opacity: [1, 0], y: [0, -tokens.distance.micro] };
      running.push(animate(main, keyframes, { duration: tokens.duration.quick, ease: [...tokens.ease.in] }));
    }

    const line = lineRef.current;
    if (line && !tokens.reduced) {
      line.style.opacity = "1";
      setState("drawing");
      running.push(
        animate(line, { scaleX: [0, LINE_REACH] }, { duration: tokens.duration.base, ease: [...tokens.ease.stroke] }),
      );
    }

    runningRef.current = running;
    /* A navegação nunca depende de quadros pintados: com a aba em segundo plano ou o navegador sem desenhar
       (sob carga), as animações não terminam e o clique se perderia. Passado o tempo da saída mais folga, segue. */
    const limitMs = Math.max(tokens.duration.quick, tokens.duration.base) * 1000 + LEAVE_GRACE_MS;
    await Promise.race([Promise.all(running.map((controls) => controls.finished)), wait(limitMs)]);
    runningRef.current = [];
  }

  function hideContent() {
    const main = contentElement();
    if (!main) return;
    /* Só opacidade: sem transform aqui, a rolagem até uma âncora (/home#sobre) e as medidas dos filhos
       não passam por um <main> deslocado. A subida começa em arrive(), com o conteúdo ainda a ~0. */
    main.style.opacity = "0";
    /* O deslocamento da saída (−4 px) também sai: a âncora é medida num <main> na posição de repouso. */
    main.style.removeProperty("transform");
  }

  async function arrive() {
    stopRunning();
    const tokens = tokensRef.current;
    const main = contentElement();
    const line = lineRef.current;
    const running: { stop: () => void; finished: Promise<unknown> }[] = [];
    const tasks: Promise<unknown>[] = [];

    if (main) {
      const keyframes = tokens.reduced ? { opacity: [0, 1] } : { opacity: [0, 1], y: [tokens.distance.small, 0] };
      const duration = tokens.reduced ? tokens.duration.quick : tokens.duration.gentle;
      const controls = animate(main, keyframes, { duration, ease: [...tokens.ease.out] });
      running.push(controls);
      tasks.push(controls.finished.then(() => clearContentStyles(main)));
    }

    if (line && line.dataset.state === "drawing") {
      setState("finishing");
      /* O traço se completa e só então some: nunca desaparece no meio do caminho. */
      const complete = animate(line, { scaleX: 1 }, { duration: tokens.duration.base, ease: [...tokens.ease.out] });
      running.push(complete);
      tasks.push(
        complete.finished.then(() => {
          const fade = animate(line, { opacity: 0 }, { duration: tokens.duration.quick, ease: [...tokens.ease.out] });
          running.push(fade);
          return fade.finished;
        }),
      );
    }

    runningRef.current = running;
    await Promise.all(tasks);
    runningRef.current = [];
    resetLine();
  }

  useImperativeHandle(handleRef, () => ({
    leave,
    hideContent,
    arrive,
    reset: () => {
      stopRunning();
      clearContentStyles(contentElement());
      resetLine();
    },
  }));

  return <div ref={lineRef} className={styles.line} data-state="idle" data-trace-line="" aria-hidden="true" />;
}
