"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useHoldInView, withInViewWait } from "./pageSequence";
import { useEntranceReady } from "./transitions/useEntranceReady";
import { useEntranceTokens, type ResolvedMotionTokens } from "./useMotionTokens";

export type RevealVariant = "rise" | "fade" | "mask" | "scale";
type RevealTag = "div" | "section" | "article" | "header" | "footer" | "aside" | "figure" | "figcaption" | "li" | "ul" | "ol" | "p";

export interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  /** rise: sobe 24px · fade: só opacidade · mask: desvela de cima para baixo, parado (fotos e bases) · scale: aproxima 4%. */
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
  /** "inView" (padrão): ao entrar na tela. "mount": ao montar (topo da página), segurado por `play`.
      "parent": segue o bloco de fora (que já é Reveal/Stagger por viewport);
      para o que fica dentro de um recorte (wipe/mask), que esconderia o próprio bloco do observador de viewport. */
  trigger?: "inView" | "mount" | "parent";
  /** Só com trigger "mount": false segura o estado inicial. Sem valor, espera a cortina de transição abrir. */
  play?: boolean;
}

/* Saída sempre mais curta que a entrada e com curva "in": some sem disputar atenção. */
export function revealVariants(variant: RevealVariant, t: ResolvedMotionTokens, delay = 0): Variants {
  if (t.pace === 0) {
    const instant = { opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0 } };
    return { hidden: instant, visible: instant };
  }

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
    /* Fotos e bases: o recorte desce de cima para baixo, sem deslocamento (subir enquanto desce brigaria). */
    case "mask":
      return {
        hidden: { clipPath: "inset(0% 0% 100% 0%)", transition: exit },
        visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: t.duration.slow, ease: t.ease.out, ...ownDelay } },
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
  const t = useEntranceTokens();
  const ready = useEntranceReady();
  const skip = t.pace === 0;
  const MotionTag = motion[as] as typeof motion.div;
  /* Ao montar, o bloco faz parte do topo da página: o que vem abaixo espera ele já subindo (ordem de leitura).
     A espera vai em tempo normal (useHoldInView aplica o ritmo). */
  useHoldInView(!skip && trigger === "mount" && !t.reduced ? delay + t.duration.base / t.pace : 0, play ?? ready);
  const variants = revealVariants(variant, t, delay * t.pace);

  return (
    <MotionTag
      /* O Motion lê `once` só ao criar o observador, e a preferência real chega depois da hidratação:
         com once=false, remonta ao mudar o modo para o "once forçado" do reduzido valer. */
      key={once ? undefined : t.reduced ? "reduced" : "full"}
      id={id}
      className={className}
      data-reveal=""
      initial={skip ? false : trigger === "parent" ? undefined : "hidden"}
      {...(skip
        ? { animate: "visible" }
        : trigger === "mount"
          ? { animate: (play ?? ready) ? "visible" : "hidden" }
          : trigger === "parent"
            ? {}
            : {
              whileInView: "visible",
              /* Movimento reduzido: nada volta a se esconder ao sair da tela (once forçado). */
              viewport: { ...t.viewport, once: once || t.reduced, amount: amount ?? t.viewport.amount },
            })}
      /* Por viewport: espera o topo da página se a seção já estava na tela ao abrir (ordem de leitura). */
      variants={skip || trigger === "mount" ? variants : withInViewWait(variants)}
      style={skip ? { opacity: 1, transform: "none", clipPath: "none" } : undefined}
      {...aria}
    >
      {children}
    </MotionTag>
  );
}
