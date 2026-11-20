"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
import { Reveal } from "@/motion/Reveal";
import { useEntranceReady } from "@/motion/transitions/useEntranceReady";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./AboutIntro.module.css";

interface AboutIntroProps {
  intro: string;
  sections: readonly { id: string; label: string }[];
}

/* Foto assenta 1,08 → 1 (é a imagem do LCP: a opacidade e o recorte nunca animam). */
const SETTLE_FROM = 1.08;
/* Deslocamento de onde cada peça chega para se encaixar atrás do retrato (o encaixe, como na Home). */
const PIECE_TRAVEL = 40;

/* Apresentação da página Sobre, logo abaixo do banner: a ousadia desta tela é o encaixe das duas peças do símbolo
   (ciano e azul) atrás do retrato. O texto e o índice só sobem. Tudo ao montar, esperando a cortina de transição. */
export function AboutIntro({ intro, sections }: AboutIntroProps) {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  const piecesDelay = t.reduced ? 0 : t.duration.gentle;

  const settle: Variants = t.reduced
    ? { hidden: { scale: 1, transition: { duration: 0 } }, visible: { scale: 1, transition: { duration: 0 } } }
    : {
        hidden: { scale: SETTLE_FROM },
        visible: { scale: 1, transition: { duration: t.duration.story, ease: t.ease.out } },
      };

  const piece = (x: number, y: number): Variants =>
    t.reduced
      ? {
          hidden: { opacity: 0, x: 0, y: 0, transition: { duration: t.duration.quick, x: { duration: 0 }, y: { duration: 0 } } },
          visible: { opacity: 1, x: 0, y: 0, transition: { duration: t.duration.quick, x: { duration: 0 }, y: { duration: 0 } } },
        }
      : {
          hidden: { opacity: 0, x, y },
          visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: { ...t.spring.fit, delay: piecesDelay, opacity: { duration: t.duration.base, delay: piecesDelay } },
          },
        };

  const step = (n: number): number => (t.reduced ? 0 : n);

  return (
    <section className={styles.intro} aria-label="Apresentação">
      <div className={`container ${styles.grid}`}>
        <motion.div
          className={styles.portrait}
          initial="hidden"
          animate={ready ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: {} }}
        >
          <motion.span className={styles.pieceCyan} aria-hidden="true" data-reveal="" variants={piece(-PIECE_TRAVEL, PIECE_TRAVEL)} />
          <motion.span className={styles.pieceBlue} aria-hidden="true" data-reveal="" variants={piece(PIECE_TRAVEL, -PIECE_TRAVEL)} />
          <div className={styles.frame}>
            <motion.div className={styles.settle} data-reveal-transform="" variants={settle}>
              <Image
                src="/images/about/salete-perfil.jpg"
                alt="Maria Salete Brocca Denoni, de blazer azul-marinho e óculos, em seu escritório diante de uma estante de livros"
                width={900}
                height={1125}
                priority
                sizes="(max-width: 767px) 80vw, 340px"
              />
            </motion.div>
          </div>
        </motion.div>

        <div className={styles.text}>
          <Reveal as="p" trigger="mount" play={ready} delay={step(t.duration.slow)} className={styles.lead}>
            {intro}
          </Reveal>
          <Reveal as="div" trigger="mount" play={ready} delay={step(t.duration.slow + t.stagger.cards * 2)}>
            <nav aria-label="Nesta página" className={styles.toc}>
              <p className={styles.tocLabel}>Nesta página</p>
              <ul>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
