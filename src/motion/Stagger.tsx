"use client";

import { motion, stagger as staggerChildren, type Variants } from "motion/react";
import { Children, type ReactNode } from "react";
import { inViewWait, useHoldInView } from "./pageSequence";
import { revealVariants, type RevealVariant } from "./Reveal";
import { useEntranceReady } from "./transitions/useEntranceReady";
import { useEntranceTokens } from "./useMotionTokens";

type StaggerTag = "div" | "ul" | "ol" | "dl" | "section";
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
  /** "inView" (padrão): ao entrar na tela. "mount": ao montar (topo da página), depois do cabeçalho e da cortina.
      "parent": segue o bloco de fora (que já é Reveal/Stagger por viewport);
      para o que fica dentro de um recorte (wipe/mask), que esconderia o próprio bloco do observador de viewport. */
  trigger?: "inView" | "mount" | "parent";
  /** Só com "mount": false = a cascata não segura as entradas por viewport (o que vem depois tem tempo próprio). */
  holdsInView?: boolean;
}

/* Orquestra a entrada dos filhos <StaggerItem> em sequência, quando o grupo entra na tela (ou ao montar).
   Um único observador de viewport para o grupo inteiro (mais leve que um por item). */
export function Stagger({
  children,
  as = "div",
  pace = "items",
  delay = 0,
  once = true,
  className,
  trigger = "inView",
  holdsInView = true,
  ...aria
}: StaggerProps) {
  const t = useEntranceTokens();
  const ready = useEntranceReady();
  const MotionTag = motion[as] as typeof motion.div;
  const gap = t.reduced ? 0 : t.stagger[pace];
  const mount = trigger === "mount";
  const variants: Variants = {
    hidden: {},
    /* Função: resolvida quando o grupo entra; por viewport, soma a espera pelo topo da página (ordem de leitura). */
    visible: () => ({
      transition: {
        delayChildren: staggerChildren(gap, { startDelay: t.reduced ? 0 : delay * t.pace + (mount ? 0 : inViewWait()) }),
      },
    }),
  };
  /* Ao montar, a cascata faz parte do topo: o que vem abaixo espera o último item já subindo. */
  const lastItem = Math.max(0, Children.count(children) - 1);
  useHoldInView(mount && holdsInView && !t.reduced ? delay + (lastItem * gap + t.duration.base) / t.pace : 0, ready);

  const play = mount
    ? { animate: ready ? "visible" : "hidden" }
    : trigger === "parent"
      ? {}
      : {
        whileInView: "visible",
        /* Movimento reduzido: nada volta a se esconder ao sair da tela (once forçado), como no Reveal. */
        viewport: { ...t.viewport, once: once || t.reduced },
      };

  return (
    <MotionTag
      /* Como no Reveal: com once=false, remonta ao mudar o modo para o "once forçado" do reduzido valer. */
      key={once ? undefined : t.reduced ? "reduced" : "full"}
      className={className}
      initial={trigger === "parent" ? undefined : "hidden"}
      variants={variants}
      {...play}
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
  const t = useEntranceTokens();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag className={className} data-reveal="" variants={revealVariants(variant, t)}>
      {children}
    </MotionTag>
  );
}
