"use client";

import { motion, stagger as staggerChildren, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { inViewWait } from "./pageSequence";
import { revealVariants, type RevealVariant } from "./Reveal";
import { useMotionTokens } from "./useMotionTokens";

type StaggerTag = "div" | "ul" | "ol" | "section";
type ItemTag = "div" | "li" | "article";

interface StaggerProps {
  children: ReactNode;
  as?: StaggerTag;
  /** Cadência entre filhos: "items" (listas) ou "cards" (grades). */
  pace?: "items" | "cards";
  delay?: number;
  once?: boolean;
  className?: string;
  "aria-label"?: string;
}

/* Orquestra a entrada dos filhos <StaggerItem> em sequência, quando o grupo entra na tela.
   Um único observador de viewport para o grupo inteiro (mais leve que um por item). */
export function Stagger({ children, as = "div", pace = "items", delay = 0, once = true, className, ...aria }: StaggerProps) {
  const t = useMotionTokens();
  const MotionTag = motion[as] as typeof motion.div;
  const gap = t.reduced ? 0 : t.stagger[pace];
  const variants: Variants = {
    hidden: {},
    /* Função: resolvida quando o grupo entra na tela; soma a espera pelo topo da página (ordem de leitura). */
    visible: () => ({
      transition: { delayChildren: staggerChildren(gap, { startDelay: t.reduced ? 0 : delay + inViewWait() }) },
    }),
  };

  return (
    <MotionTag
      /* Como no Reveal: com once=false, remonta ao mudar o modo para o "once forçado" do reduzido valer. */
      key={once ? undefined : t.reduced ? "reduced" : "full"}
      className={className}
      initial="hidden"
      whileInView="visible"
      /* Movimento reduzido: nada volta a se esconder ao sair da tela (once forçado), como no Reveal. */
      viewport={{ ...t.viewport, once: once || t.reduced }}
      variants={variants}
      {...aria}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  as?: ItemTag;
  variant?: RevealVariant;
  className?: string;
}

export function StaggerItem({ children, as = "div", variant = "rise", className }: StaggerItemProps) {
  const t = useMotionTokens();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag className={className} data-reveal="" variants={revealVariants(variant, t)}>
      {children}
    </MotionTag>
  );
}
