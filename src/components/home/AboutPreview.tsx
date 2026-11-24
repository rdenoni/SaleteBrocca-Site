"use client";

import { motion, type Variants } from "motion/react";
import { DrawRule } from "@/motion/DrawRule";
import { MotionButton } from "@/motion/MotionButton";
import { ParallaxImage } from "@/motion/ParallaxImage";
import { Reveal } from "@/motion/Reveal";
import { TextReveal } from "@/motion/TextReveal";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { HOME_ABOUT as ABOUT, HOME_SECTION_IDS } from "@/lib/content/home";
import styles from "./AboutPreview.module.css";

const OPEN = "inset(0% 0% 0% 0%)";
const CLOSED_FROM_TOP = "inset(0% 0% 100% 0%)";
const SETTLE_FROM = 1.12;
/* Deslocamento de onde cada peça colorida chega para se encaixar atrás da foto. */
const PIECE_TRAVEL = 40;
/* Parallax pequeno dentro da moldura: só profundidade, sem mostrar borda. */
const PARALLAX_STRENGTH = 0.05;
/* As peças encaixam quando a moldura já abriu cerca de metade. */
const PIECES_START = 0.5;

/* Retrato com a revelação: a moldura abre de cima para baixo enquanto a foto assenta (1,12 → 1);
   as duas peças do símbolo (ciano e azul) se encaixam atrás dela. Depois, parallax leve dentro da moldura. */
function PortraitReveal() {
  const t = useMotionTokens();
  const piecesDelay = t.duration.slow * PIECES_START;

  const frame: Variants = t.reduced
    ? {
        hidden: { opacity: 0, clipPath: OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
        visible: { opacity: 1, clipPath: OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
      }
    : {
        hidden: { clipPath: CLOSED_FROM_TOP },
        visible: { clipPath: OPEN, transition: { duration: t.duration.slow, ease: t.ease.stroke } },
      };

  const settle: Variants = t.reduced
    ? {
        hidden: { scale: 1, transition: { duration: 0 } },
        visible: { scale: 1, transition: { duration: 0 } },
      }
    : {
        hidden: { scale: SETTLE_FROM },
        visible: { scale: 1, transition: { duration: t.duration.slow, ease: t.ease.out } },
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

  return (
    <motion.div
      className={styles.photo}
      initial="hidden"
      whileInView="visible"
      viewport={t.viewport}
      variants={{ hidden: {}, visible: {} }}
    >
      <motion.span
        className={styles.pieceCyan}
        aria-hidden="true"
        data-reveal=""
        variants={piece(-PIECE_TRAVEL, PIECE_TRAVEL)}
      />
      <motion.span
        className={styles.pieceBlue}
        aria-hidden="true"
        data-reveal=""
        variants={piece(PIECE_TRAVEL, -PIECE_TRAVEL)}
      />
      <motion.div className={styles.frame} data-reveal="" variants={frame}>
        <motion.div className={styles.settle} data-reveal-transform="" variants={settle}>
          <ParallaxImage
            src={ABOUT.image}
            alt={ABOUT.imageAlt}
            sizes="(max-width: 1099px) 80vw, 400px"
            aspectRatio="4 / 5"
            strength={PARALLAX_STRENGTH}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function AboutPreview() {
  const t = useMotionTokens();
  /* Ordem do texto: título → traço → parágrafos → botão, cada um começando antes do anterior terminar. */
  const step = (n: number) => (t.reduced ? 0 : n);
  const ruleDelay = step(t.duration.gentle);
  const bodyDelay = (index: number) => step(t.duration.gentle + t.duration.base + index * t.stagger.items * 2);
  const ctaDelay = step(t.duration.gentle + t.duration.base + ABOUT.paragraphs.length * t.stagger.items * 2);

  return (
    <section id={HOME_SECTION_IDS.about} className={styles.section} aria-labelledby="sobre-titulo">
      <div className={`container ${styles.grid}`}>
        <PortraitReveal />
        <div className={styles.text}>
          <TextReveal as="h2" id="sobre-titulo" className={styles.title} text={ABOUT.title} />
          <DrawRule className={styles.rule} delay={ruleDelay} />
          {ABOUT.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} className={styles.bodyItem} delay={bodyDelay(index)}>
              <p className={styles.body}>{paragraph}</p>
            </Reveal>
          ))}
          <Reveal className={styles.cta} delay={ctaDelay}>
            <MotionButton href={ABOUT.cta.href} variant="outline" withCurtain>
              {ABOUT.cta.label}
            </MotionButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
