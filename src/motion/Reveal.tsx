"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useHoldInView, withInViewWait } from "./pageSequence";
import { useEntranceReady } from "./transitions/useEntranceReady";
import { useMotionTokens, type ResolvedMotionTokens } from "./useMotionTokens";

export type RevealVariant = "rise" | "fade" | "mask" | "scale";
type RevealTag = "div" | "section" | "article" | "header" | "footer" | "aside" | "figure" | "li" | "ul" | "ol" | "p";

export interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  /** rise: sobe 24px · fade: só opacidade · mask: desvela de baixo para cima · scale: aproxima 4%. */
  variant?: RevealVariant;
  delay?: number;
  /** false = entrada e saída: o bloco volta ao estado inicial quando sai da tela (mais rápido, curva "in"). */
  once?: boolean;
  /** Fração do bloco visível para disparar (0–1). */
  amount?: number;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
  "aria-hidden"?: boolean;
  /** Superfície do bloco (ex.: "dark"), lida pelos estilos globais de foco e link. */
  "data-surface"?: string;
  /** "inView" (padrão): ao entrar na tela. "mount": ao montar (topo da página), segurado por `play`. */
  trigger?: "inView" | "mount";
  /** Só com trigger "mount": false segura o estado inicial. Sem valor, espera a cortina de transição abrir. */
  play?: boolean;
}

/* Saída sempre mais curta que a entrada e com curva "in": some sem disputar atenção. */
export function revealVariants(variant: RevealVariant, t: ResolvedMotionTokens, delay = 0): Variants {
  const exit = { duration: t.duration.base, ease: t.ease.in };
  /* Sem atraso próprio, a chave `delay` fica de fora: um `delay: 0` explícito anula o atraso que a cascata do pai
     (delayChildren/stagger) passa para o filho, e os itens de um Stagger entravam todos juntos. */
  const ownDelay = delay > 0 ? { delay } : {};
  const enter = { duration: t.duration.gentle, ease: t.ease.out, ...ownDelay };

  /* Reduzido: só opacidade. Transform e recorte ficam neutros nos dois estados, sem animar: o bloco pode ter
     hidratado com o estado inicial do movimento completo (o servidor não sabe a preferência). */
  if (t.reduced) {
    const still = { y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" };
    const instant = { y: { duration: 0 }, scale: { duration: 0 }, clipPath: { duration: 0 } };
    return {
      hidden: { opacity: 0, ...still, transition: { duration: t.duration.quick, ...instant } },
      visible: { opacity: 1, ...still, transition: { duration: t.duration.quick, delay: 0, ...instant } },
    };
  }

  switch (variant) {
    case "fade":
      return { hidden: { opacity: 0, transition: exit }, visible: { opacity: 1, transition: enter } };
    case "scale":
      return {
        hidden: { opacity: 0, scale: 0.96, transition: exit },
        visible: { opacity: 1, scale: 1, transition: enter },
      };
    case "mask":
      return {
        hidden: { clipPath: "inset(100% 0% 0% 0%)", y: t.distance.small, transition: exit },
        visible: {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          transition: { duration: t.duration.slow, ease: t.ease.out, ...ownDelay },
        },
      };
    case "rise":
    default:
      return {
        hidden: { opacity: 0, y: t.distance.base, transition: exit },
        visible: { opacity: 1, y: 0, transition: enter },
      };
  }
}

/* Entrada de bloco ao entrar na viewport. Renderiza a tag pedida (seção, artigo, li...).
   data-reveal permite o <noscript> do layout mostrar tudo se o JavaScript não carregar. */
export function Reveal({
  children,
  as = "div",
  variant = "rise",
  delay = 0,
  once = true,
  amount,
  className,
  id,
  trigger = "inView",
  play,
  ...aria
}: RevealProps) {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  const MotionTag = motion[as] as typeof motion.div;
  /* Ao montar, o bloco faz parte do topo da página: o que vem abaixo espera ele já subindo (ordem de leitura). */
  useHoldInView(trigger === "mount" && !t.reduced ? delay + t.duration.base : 0, play ?? ready);

  return (
    <MotionTag
      /* O Motion lê `once` só ao criar o observador, e a preferência real chega depois da hidratação:
         com once=false, remonta ao mudar o modo para o "once forçado" do reduzido valer. */
      key={once ? undefined : t.reduced ? "reduced" : "full"}
      id={id}
      className={className}
      data-reveal=""
      initial="hidden"
      {...(trigger === "mount"
        ? { animate: (play ?? ready) ? "visible" : "hidden" }
        : {
            whileInView: "visible",
            /* Movimento reduzido: nada volta a se esconder ao sair da tela (once forçado). */
            viewport: { ...t.viewport, once: once || t.reduced, amount: amount ?? t.viewport.amount },
          })}
      /* Por viewport: espera o topo da página se a seção já estava na tela ao abrir (ordem de leitura). */
      variants={trigger === "inView" ? withInViewWait(revealVariants(variant, t, delay)) : revealVariants(variant, t, delay)}
      {...aria}
    >
      {children}
    </MotionTag>
  );
}
