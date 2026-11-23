"use client";

import { createContext, useContext, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { stagger, type Variants } from "motion/react";
import { DrawRule } from "@/motion/DrawRule";
import { useHoldInView } from "@/motion/pageSequence";
import { Reveal, revealVariants } from "@/motion/Reveal";
import { TextReveal } from "@/motion/TextReveal";
import { afterBanner, heroTimeline } from "@/motion/timeline";
import { useEntranceReady } from "@/motion/transitions/useEntranceReady";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./AuthCard.module.css";

/* Quando o formulário do cartão começa (s, contados a partir da liberação da página): o texto de apoio já subindo. */
const FormDelayContext = createContext(0);

/* Entrada em cascata dos formulários dentro do AuthCard (login, recuperar, definir senha, confirmar):
   cada filho direto do formulário é um motion.* com data-reveal e variants={item}, na ordem de leitura.
   O atraso inicial vem do cartão, que sabe quanto o título e o texto levam. */
/** `delayOverride`: para formulário fora do AuthCard (ex.: Minha conta), que não recebe o atraso pelo contexto. */
export function useAuthCascade(delayOverride?: number): { ready: boolean; delay: number; cascade: Variants; item: Variants } {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  const contextDelay = useContext(FormDelayContext);
  const delay = delayOverride ?? contextDelay;
  const cascade: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: stagger(t.reduced ? 0 : t.stagger.items, { startDelay: delay }) } },
  };
  return { ready, delay, cascade, item: revealVariants("rise", t) };
}

interface AuthCardProps {
  title: string;
  lead: string;
  /** Formulário ou mensagem principal. */
  children?: ReactNode;
  /** Quantos itens a cascata do formulário tem (a nota e o rodapé entram depois do último). Sem formulário: 0. */
  formItems?: number;
  /** Nota pequena abaixo do formulário. */
  note?: ReactNode;
  /** Rodapé do cartão, separado por uma linha (links de apoio). */
  footer?: ReactNode;
}

/* Cartão branco sobre azul-claro com as peças da marca (wireframe 3.12): login, recuperar e definir senha.
   Ordem de entrada (leitura): título palavra por palavra → régua ciano → texto de apoio → campos e botões do
   formulário, um a um → nota → aviso de privacidade → links de apoio. As peças da marca ficam fixas (fundo). */
export function AuthCard({ title, lead, children, formItems = children ? 1 : 0, note, footer }: AuthCardProps) {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  const step = (seconds: number): number => (t.reduced ? 0 : seconds);
  const steps = heroTimeline(t, title.split(/\s+/).length);
  const start = (id: (typeof steps)[number]["id"]): number => step(steps.find((s) => s.id === id)?.start ?? 0);

  const formDelay = step(afterBanner(t, title));
  const tailDelay = formDelay + step(formItems * t.stagger.items);
  /* O que está abaixo do cartão (rodapé do site) espera o fim desta sequência. */
  useHoldInView(step(tailDelay + 2 * t.stagger.items + t.duration.base), ready);
  const tail = (index: number): number => tailDelay + step(index * t.stagger.items);

  return (
    <section className={styles.page} aria-labelledby="page-title">
      <Image
        src="/brand/patterns/grafismo-pecas.png"
        alt=""
        width={1921}
        height={1081}
        priority
        className={styles.pieces}
        sizes="(max-width: 767px) 120vw, 60vw"
      />
      <div className={`container ${styles.inner}`}>
        <div className={styles.card}>
          <TextReveal
            as="h1"
            id="page-title"
            className={styles.title}
            text={title}
            trigger="mount"
            play={ready}
            delay={start("title")}
          />
          <DrawRule trigger="mount" play={ready} delay={start("rule")} />
          <Reveal as="p" trigger="mount" play={ready} delay={start("text")} className={styles.lead}>
            {lead}
          </Reveal>
          <FormDelayContext.Provider value={formDelay}>{children}</FormDelayContext.Provider>
          {note && (
            <Reveal as="p" trigger="mount" play={ready} delay={tail(0)} className={styles.note}>
              {note}
            </Reveal>
          )}
          <Reveal as="p" trigger="mount" play={ready} delay={tail(1)} className={styles.privacy}>
            Veja como tratamos seus dados na <Link href="/privacidade">política de privacidade</Link>.
          </Reveal>
          {footer && (
            <Reveal as="p" trigger="mount" play={ready} delay={tail(2)} className={styles.alt}>
              {footer}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
