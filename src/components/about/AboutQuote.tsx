"use client";

import { motion } from "motion/react";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal, revealVariants } from "@/motion/Reveal";
import { GuidedReading } from "@/motion/GuidedReading";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./AboutQuote.module.css";

interface AboutQuoteProps {
  quote: string;
  author: string;
}

/* Frase da Salete em navy com as aspas gigantes ciano (grafismo do Manual): as aspas aproximam, a frase ganha cor
   palavra por palavra conforme a rolagem (leitura guiada, o padrão para mensagens) e a assinatura e o botão sobem. */
export function AboutQuote({ quote, author }: AboutQuoteProps) {
  const t = useMotionTokens();
  const step = (n: number): number => (t.reduced ? 0 : n);
  const afterMark = step(t.duration.quick);

  return (
    <section className={styles.quote} data-surface="dark" aria-label={`Frase de ${author}`}>
      <div className={`container ${styles.inner}`}>
        <Reveal as="div" variant="scale" className={styles.mark} aria-hidden>
          “
        </Reveal>
        <figure className={styles.figure}>
          <blockquote className={styles.blockquote}>
            <GuidedReading as="p" className={styles.text} text={quote} />
          </blockquote>
          <motion.figcaption
            className={styles.author}
            data-reveal=""
            initial="hidden"
            whileInView="visible"
            viewport={t.viewport}
            variants={revealVariants("rise", t, afterMark)}
          >
            {author}
          </motion.figcaption>
        </figure>
        <Reveal delay={afterMark + step(t.stagger.cards)}>
          <MotionButton href="/cursos" variant="accent" withCurtain>
            Conhecer os cursos
          </MotionButton>
        </Reveal>
      </div>
    </section>
  );
}
