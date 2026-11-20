"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
import { Reveal } from "@/motion/Reveal";
import { useHoldInView } from "@/motion/pageSequence";
import { afterBanner } from "@/motion/timeline";
import { useEntranceReady } from "@/motion/transitions/useEntranceReady";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./AboutIntro.module.css";

interface AboutIntroProps {
  /** Título do banner acima: a apresentação só começa depois dele (e do subtítulo). */
  bannerTitle: string;
  intro: string;
  sections: readonly { id: string; label: string }[];
}

/* Foto: a moldura se desvela de baixo para cima (recorte) enquanto a foto assenta 1,08 → 1.
   Pedido da cliente: a foto não pode aparecer antes do texto. Custo aceito: a foto (provável LCP) só pinta quando entra. */
const SETTLE_FROM = 1.08;
const FRAME_CLOSED = "inset(100% 0% 0% 0%)";
const FRAME_OPEN = "inset(0% 0% 0% 0%)";
/* Deslocamento de onde cada peça chega para se encaixar atrás do retrato (o encaixe, como na Home). */
const PIECE_TRAVEL = 40;

/* Apresentação da página Sobre, logo abaixo do banner: a ousadia desta tela é o encaixe das duas peças do símbolo
   (ciano e azul) atrás do retrato. Tudo ao montar, esperando a cortina de transição.
   Ordem por hierarquia: banner (nome → subtítulo) → texto de apresentação → foto (desvela e assenta) → peças → índice. */
export function AboutIntro({ bannerTitle, intro, sections }: AboutIntroProps) {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  const step = (n: number): number => (t.reduced ? 0 : n);
  const leadDelay = step(afterBanner(t, bannerTitle));
  const photoDelay = step(afterBanner(t, bannerTitle) + t.duration.base);
  const tocDelay = step(afterBanner(t, bannerTitle) + t.duration.base * 3);
  /* O que vem abaixo (história...) só entra com o índice e os botões dele já subindo (ordem de leitura). */
  useHoldInView(t.reduced ? 0 : tocDelay + t.duration.base, ready);
  /* As peças encaixam quando a foto já está se abrindo. */
  const piecesDelay = step(afterBanner(t, bannerTitle) + t.duration.base * 2);

  const frame: Variants = t.reduced
    ? {
        hidden: { opacity: 0, clipPath: FRAME_OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
        visible: { opacity: 1, clipPath: FRAME_OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
      }
    : {
        hidden: { clipPath: FRAME_CLOSED },
        visible: { clipPath: FRAME_OPEN, transition: { duration: t.duration.slow, ease: t.ease.out, delay: photoDelay } },
      };

  const settle: Variants = t.reduced
    ? { hidden: { scale: 1, transition: { duration: 0 } }, visible: { scale: 1, transition: { duration: 0 } } }
    : {
        hidden: { scale: SETTLE_FROM },
        visible: { scale: 1, transition: { duration: t.duration.story, ease: t.ease.out, delay: photoDelay } },
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
          <motion.div className={styles.frame} data-reveal="" variants={frame}>
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
          </motion.div>
        </motion.div>

        <div className={styles.text}>
          <Reveal as="p" trigger="mount" play={ready} delay={leadDelay} className={styles.lead}>
            {intro}
          </Reveal>
          <Reveal as="div" trigger="mount" play={ready} delay={tocDelay}>
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
