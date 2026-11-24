"use client";

import {
  cubicBezier,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type EasingFunction,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import { useScrollWillChange } from "./useScrollWillChange";
import { ease } from "./tokens";
import { useMotionTokens } from "./useMotionTokens";

/* Limiar a partir do qual uma animação guiada por scroll é considerada concluída e trava em 1 (não reverte ao subir). */
const LOCK_THRESHOLD = 0.99;

/* Progresso ligado ao scroll que trava em 1 assim que o usuário completa toda a animação (sem reverse ao rolar para cima).
   Enquanto ainda está no meio (0 → <1), acompanha a rolagem normalmente. */
export function useLockedProgress(source: MotionValue<number>, lockAt = LOCK_THRESHOLD): MotionValue<number> {
  const initial = source.get();
  const doneRef = useRef(initial >= lockAt);
  const locked = useMotionValue(doneRef.current ? 1 : initial);

  useMotionValueEvent(source, "change", (latest) => {
    if (doneRef.current) return;
    if (latest >= lockAt) {
      doneRef.current = true;
      locked.set(1);
      return;
    }
    locked.set(latest);
  });

  useEffect(() => {
    const current = source.get();
    if (doneRef.current) {
      locked.set(1);
    } else if (current >= lockAt) {
      doneRef.current = true;
      locked.set(1);
    } else {
      locked.set(current);
    }
  }, [source, locked, lockAt]);

  return locked;
}

/* Onde, na altura da tela, o TOPO do card está quando a entrada começa e quando termina.
   Começa com o card já ~12% dentro da tela (não colado na borda de baixo, como o gatilho antigo de 88%)
   e termina antes de o topo chegar ao meio da tela, para o card estar legível quando está em foco. */
const ENTRANCE_START = 0.88;
const ENTRANCE_END = 0.58;
/* A opacidade fecha antes do deslocamento (60% do trecho): o texto fica legível enquanto o card ainda assenta. */
const OPACITY_DONE_AT = 0.6;

export interface ScrollEntranceOptions {
  /** Posição do card na fileira (0 = primeiro). */
  index?: number;
  /** Quanto da altura da tela cada card seguinte atrasa. 0 = sem cascata (coluna única). */
  step?: number;
}

export interface ScrollEntrance {
  /** Progresso 0 → 1 da entrada (preso nas pontas e travado em 1 após completar). */
  progress: MotionValue<number>;
  /** Estilo pronto para um elemento motion: só opacidade e transform. */
  style: { opacity: MotionValue<number> | number; y: MotionValue<number> | number };
}

/* Entrada de card ligada à rolagem: rolar para baixo revela e, uma vez concluída (100%), trava sem voltar no reverse. */
export function useScrollEntrance(ref: RefObject<HTMLElement | null>, { index = 0, step = 0 }: ScrollEntranceOptions = {}): ScrollEntrance {
  const t = useMotionTokens();
  const shift = index * step;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [
      [0, ENTRANCE_START - shift],
      [0, ENTRANCE_END - shift],
    ],
  });
  const progress = useLockedProgress(scrollYProgress);
  const opacity = useTransform(progress, [0, OPACITY_DONE_AT], [0, 1]);
  const y = useTransform(progress, [0, 1], [t.distance.base, 0]);

  useScrollWillChange(ref, progress, !t.reduced, "transform, opacity");

  return { progress, style: t.reduced ? { opacity: 1, y: 0 } : { opacity, y } };
}

/* ---------------------------------------------------------------------------------------------------------------
   Entrada em partes do EditorialCard (modo "scroll"). Outro hook, com faixa própria, para não mexer no
   useScrollEntrance acima (o CourseCard continua com a subida simples).
   --------------------------------------------------------------------------------------------------------------- */

/* Começa mais tarde (topo do card a 72% da tela, já bem dentro) e termina com o topo a ~32%, ainda no terço de cima:
   o trecho de 40% da tela dá espaço para a coreografia em camadas ser lida enquanto se rola. */
const EDITORIAL_START = 0.72;
const EDITORIAL_END = 0.32;

/* Sub-faixas do progresso do PRÓPRIO card (0 → 1). Elas se sobrepõem de propósito: cada camada começa antes
   de a anterior terminar, como na cascata por tempo do modo "time". Tudo termina em 1. */
const RANGE_BLOCK: number[] = [0, 0.45]; // bloco de cor varre da esquerda
const RANGE_LETTER: number[] = [0.1, 0.5]; // letra de fundo entra
const RANGE_PHOTO: number[] = [0.18, 0.78]; // cortina da foto (sobe de baixo)
const RANGE_PANEL: number[] = [0.45, 0.85]; // painel do título desliza e aparece, logo depois da foto
const RANGE_MORE: number[] = [0.72, 1]; // "Ler artigo" por último
const PANEL_SLIDE_PX = 32;
const PHOTO_ZOOM_FROM = 1.15;

type Bezier = readonly [number, number, number, number];
/* O `ease` do useTransform pede uma função: converte a curva dos tokens. */
const bezier = (curve: Bezier): EasingFunction => cubicBezier(curve[0], curve[1], curve[2], curve[3]);
/* Criadas uma vez (os tokens são constantes): o useTransform não recria o mapeamento a cada render. */
/* Na rolagem o ease.out dos tokens (0,22 1 0,36 1) conclui quase tudo no primeiro terço do trecho e o resto parece parado;
   um easeOutQuad suave aproveita melhor a faixa inteira. */
const EASE_OUT = bezier([0.25, 0.46, 0.45, 0.94]);
const EASE_SWEEP = bezier(ease.stroke);

type Num = MotionValue<number> | number;
type Str = MotionValue<string> | string;

export interface EditorialScrollEntrance {
  progress: MotionValue<number>;
  /** Refs das camadas que se movem: só elas recebem will-change, e só enquanto o progresso está entre 0 e 1. */
  refs: {
    block: RefObject<HTMLDivElement | null>;
    photo: RefObject<HTMLDivElement | null>;
    panel: RefObject<HTMLDivElement | null>;
    more: RefObject<HTMLSpanElement | null>;
  };
  /* Só opacidade e transform em tudo: rolar não repinta nada. */
  block: { scaleX: Num };
  letter: { opacity: Num; x: Num };
  photo: { y: Str; scale: Num };
  panel: { opacity: Num; x: Num };
  more: { opacity: Num; y: Num };
}

/* Entrada do card em camadas, ligada à rolagem. Uma vez concluída (100%), trava em 1 e não desfaz ao rolar para cima. */
export function useEditorialScrollEntrance(
  ref: RefObject<HTMLElement | null>,
  { index = 0, step = 0 }: ScrollEntranceOptions = {},
): EditorialScrollEntrance {
  const t = useMotionTokens();
  const shift = index * step;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [
      [0, EDITORIAL_START - shift],
      [0, EDITORIAL_END - shift],
    ],
  });
  const progress = useLockedProgress(scrollYProgress);
  const out = EASE_OUT;
  const sweep = EASE_SWEEP;

  const blockScale = useTransform(progress, RANGE_BLOCK, [0, 1], { ease: sweep });
  const letterOpacity = useTransform(progress, RANGE_LETTER, [0, 1], { ease: out });
  const letterX = useTransform(progress, RANGE_LETTER, [-t.distance.base, 0], { ease: out });
  /* A foto desce de cima para baixo dentro da moldura (como o desvelar das fotos no resto do site). */
  const photoY = useTransform(progress, RANGE_PHOTO, ["-100%", "0%"], { ease: out });
  const photoScale = useTransform(progress, RANGE_PHOTO, [PHOTO_ZOOM_FROM, 1], { ease: out });
  const panelOpacity = useTransform(progress, RANGE_PANEL, [0, 1], { ease: out });
  const panelX = useTransform(progress, RANGE_PANEL, [PANEL_SLIDE_PX, 0], { ease: out });
  const moreOpacity = useTransform(progress, RANGE_MORE, [0, 1], { ease: out });
  const moreY = useTransform(progress, RANGE_MORE, [t.distance.small, 0], { ease: out });

  const refs = {
    block: useRef<HTMLDivElement>(null),
    photo: useRef<HTMLDivElement>(null),
    panel: useRef<HTMLDivElement>(null),
    more: useRef<HTMLSpanElement>(null),
  };
  const willChange = !t.reduced;
  useScrollWillChange(refs.block, progress, willChange, "transform");
  useScrollWillChange(refs.photo, progress, willChange, "transform");
  useScrollWillChange(refs.panel, progress, willChange, "transform, opacity");
  useScrollWillChange(refs.more, progress, willChange, "transform, opacity");

  if (t.reduced) {
    return {
      progress,
      refs,
      block: { scaleX: 1 },
      letter: { opacity: 1, x: 0 },
      photo: { y: "0%", scale: 1 },
      panel: { opacity: 1, x: 0 },
      more: { opacity: 1, y: 0 },
    };
  }
  return {
    progress,
    refs,
    block: { scaleX: blockScale },
    letter: { opacity: letterOpacity, x: letterX },
    photo: { y: photoY, scale: photoScale },
    panel: { opacity: panelOpacity, x: panelX },
    more: { opacity: moreOpacity, y: moreY },
  };
}
