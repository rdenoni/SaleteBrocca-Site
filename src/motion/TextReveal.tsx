"use client";

import { motion, stagger as staggerChildren, type Variants } from "motion/react";
import { Fragment } from "react";
import styles from "./TextReveal.module.css";
import { useMotionTokens } from "./useMotionTokens";

type TextTag = "h1" | "h2" | "h3" | "p" | "span";

interface TextRevealProps {
  /** Uma quebra de linha no texto vira <br /> entre as palavras; leitores de tela recebem o texto numa linha só. */
  text: string;
  as?: TextTag;
  className?: string;
  id?: string;
  delay?: number;
  /** "mount": anima ao montar (Hero). "inView": ao entrar na tela. */
  trigger?: "mount" | "inView";
  /** Só com trigger "mount": false segura o estado inicial (ex.: esperar a cortina de transição abrir). */
  play?: boolean;
}

/* Título que surge palavra por palavra, cada uma subindo de dentro de uma máscara (como a linha de um caderno).
   Acessibilidade: leitores de tela recebem o texto inteiro (visually-hidden); as palavras animadas ficam aria-hidden.
   Quebra de linha natural: cada palavra é inline-block, então funciona em qualquer largura sem medir linhas. */
export function TextReveal({ text, as = "h2", className, id, delay = 0, trigger = "inView", play = true }: TextRevealProps) {
  const t = useMotionTokens();
  const Tag = as;
  const lines = text
    .split("\n")
    .map((line) => line.split(/\s+/).filter(Boolean))
    .filter((line) => line.length > 0);
  const plainText = lines.map((line) => line.join(" ")).join(" ");

  const container: Variants = {
    hidden: {},
    visible: { transition: { delayChildren: staggerChildren(t.reduced ? 0 : t.stagger.words, { startDelay: delay }) } },
  };
  /* Reduzido: só opacidade, e y zerado nos dois estados. A hidratação roda com o movimento completo
     (o servidor não sabe a preferência), então a palavra pode já estar deslocada quando o modo troca. */
  const word: Variants = t.reduced
    ? {
        hidden: { opacity: 0, y: "0%" },
        visible: { opacity: 1, y: "0%", transition: { duration: t.duration.quick, y: { duration: 0 } } },
      }
    : {
        hidden: { y: "105%" },
        visible: { y: "0%", transition: { duration: t.duration.slow, ease: t.ease.out } },
      };

  const playProps =
    trigger === "mount" ? { animate: play ? "visible" : "hidden" } : { whileInView: "visible", viewport: t.viewport };

  return (
    <Tag id={id} className={className}>
      <span className="visually-hidden">{plainText}</span>
      <motion.span aria-hidden="true" className={styles.words} initial="hidden" variants={container} {...playProps}>
        {/* O espaço fica FORA da máscara: dentro de um inline-block, o espaço final colapsa. */}
        {lines.map((words, lineIndex) => (
          <Fragment key={lineIndex}>
            {words.map((value, index) => (
              <Fragment key={`${value}-${index}`}>
                <span className={styles.mask}>
                  <motion.span className={styles.word} data-reveal="" variants={word}>
                    {value}
                  </motion.span>
                </span>
                {index < words.length - 1 ? " " : null}
              </Fragment>
            ))}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
