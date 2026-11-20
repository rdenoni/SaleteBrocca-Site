"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useId, useRef, type MouseEventHandler } from "react";
import { DrawRule } from "./DrawRule";
import styles from "./HeroSequence.module.css";
import { TextReveal } from "./TextReveal";
import { TransitionLink } from "./transitions/TransitionLink";
import { useEntranceReady } from "./transitions/useEntranceReady";
import { useHoldInView } from "./pageSequence";
import { heroTimeline, type HeroTimelineStep } from "./timeline";
import { useMotionTokens } from "./useMotionTokens";
import { useScrollWillChange } from "./useScrollWillChange";

/* Textos e foto do Hero ORIGINAL do site. São só valores padrão: a página pode sobrescrever. */
const DEFAULT_TITLE = "Conheça nossos cursos";
const DEFAULT_TEXT = "Formação, conhecimento e ferramentas para compreender as dificuldades de aprendizagem.";
const DEFAULT_CTA_LABEL = "Explorar cursos";
const DEFAULT_CTA_HREF = "/cursos";
const DEFAULT_IMAGE = "/images/hero/crianca-escrevendo.jpg";

/* Foto: parte de 1,08 e assenta em 1 (a foto é a imagem do LCP: a opacidade nunca anima). */
const PHOTO_START_SCALE = 1.08;
/* Saída por scroll (parallax mais evidente, ainda calmo):
   - a foto desce 28% da altura do Hero e aproxima 1 → 1,06 enquanto o Hero sai;
   - o texto sobe 1,75× a distância de seção (40px → 70px) e esmaece até 0,4.
   Sem borda vazia: a foto cobre de 0,28·p·H para baixo e a parte visível do Hero começa em p·H (p = progresso 0–1),
   então o topo fica coberto enquanto a descida for menor que 100%; o fundo é recortado pelo overflow do Hero. */
const PHOTO_DRIFT = "28%";
const PHOTO_EXIT_SCALE = 1.06;
const CONTENT_RISE_FACTOR = 1.75;
const CONTENT_END_OPACITY = 0.4;

export { heroTimeline, type HeroTimelineStep } from "./timeline";

export interface HeroSequenceProps {
  /** Nível do título. O laboratório usa "h2" porque a página já tem um h1. */
  headingLevel?: "h1" | "h2";
  title?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageSrc?: string;
  /** Opcional: intercepta o clique do botão (ex.: rolar até uma âncora e mover o foco). Sem ele, link comum. */
  onCtaClick?: MouseEventHandler<HTMLAnchorElement>;
}

/* O Hero original, animado. Em repouso é idêntico ao do site (foto P&B em soft-light sobre --blue-strong,
   véu navy, título fluido, régua ciano, texto e botão fantasma).
   Entrada: foto assenta, título palavra por palavra, régua se desenha, texto e botão sobem em sequência.
   Saída (scroll): a foto desce em parallax e o conteúdo sobe e esmaece um pouco.
   Movimento reduzido: foto estática, sem parallax, só fades rápidos de texto e botão. */
export function HeroSequence({
  headingLevel = "h1",
  title = DEFAULT_TITLE,
  text = DEFAULT_TEXT,
  ctaLabel = DEFAULT_CTA_LABEL,
  ctaHref = DEFAULT_CTA_HREF,
  imageSrc = DEFAULT_IMAGE,
  onCtaClick,
}: HeroSequenceProps) {
  const t = useMotionTokens();
  const titleId = useId();
  const heroRef = useRef<HTMLElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);

  /* Uma assinatura por vez: chegando pela cortina, a sequência espera a cortina começar a abrir.
     Só na primeira vez: sair da página não faz o Hero voltar ao estado inicial sob a cortina. */
  const ready = useEntranceReady();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  /* A foto só é promovida (will-change) durante a saída por scroll; em repouso, no topo, nada fica promovido. */
  useScrollWillChange(photoLayerRef, scrollYProgress, !t.reduced);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", PHOTO_DRIFT]);
  const photoExitScale = useTransform(scrollYProgress, [0, 1], [1, PHOTO_EXIT_SCALE]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -t.distance.section * CONTENT_RISE_FACTOR]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, CONTENT_END_OPACITY]);

  const steps = heroTimeline(t, title.split(/\s+/).filter(Boolean).length);
  const startOf = (id: HeroTimelineStep["id"]): number => (t.reduced ? 0 : (steps.find((step) => step.id === id)?.start ?? 0));
  /* Seções já na tela ao abrir só entram depois do Hero (ordem de leitura). */
  useHoldInView(t.reduced ? 0 : startOf("cta") + t.duration.base, ready);

  /* Texto e botão: sobem e aparecem (reduzido: só opacidade, rápido). `y: 0` no destino garante que nada fica deslocado. */
  const riseIn = (id: "text" | "cta") => ({
    initial: { opacity: 0, y: t.reduced ? 0 : t.distance.base },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: t.reduced ? 0 : t.distance.base },
    transition: t.reduced
      ? { duration: t.duration.quick }
      : { duration: t.duration.gentle, ease: t.ease.out, delay: startOf(id) },
  });

  return (
    <section ref={heroRef} className={styles.hero} aria-labelledby={titleId} data-surface="photo">
      {/* Duas camadas: a de fora (mistura, P&B, opacidade) leva o parallax do scroll (descida + aproximação);
          a de dentro leva só a escala de entrada. A opacidade nunca sai de 1 na entrada (é a imagem do LCP). */}
      <motion.div
        ref={photoLayerRef}
        aria-hidden="true"
        className={styles.photoLayer}
        style={t.reduced ? { y: 0, scale: 1 } : { y: photoY, scale: photoExitScale }}
      >
        <motion.div
          className={styles.photoSettle}
          data-reveal-transform=""
          initial={{ scale: PHOTO_START_SCALE }}
          animate={{ scale: ready ? 1 : PHOTO_START_SCALE }}
          transition={t.reduced ? { duration: 0 } : { duration: t.duration.story, ease: t.ease.out }}
        >
          <Image src={imageSrc} alt="" fill priority sizes="100vw" className={styles.photo} />
        </motion.div>
      </motion.div>

      <motion.div className={styles.inner} style={t.reduced ? undefined : { y: contentY, opacity: contentOpacity }}>
        <TextReveal
          as={headingLevel}
          id={titleId}
          text={title}
          className={styles.title}
          trigger="mount"
          play={ready}
          delay={startOf("title")}
        />
        <DrawRule trigger="mount" play={ready} delay={startOf("rule")} className={styles.rule} />
        <motion.p className={styles.text} data-reveal="" {...riseIn("text")}>
          {text}
        </motion.p>
        <motion.div data-reveal="" {...riseIn("cta")}>
          <TransitionLink href={ctaHref} className={styles.cta} onClick={onCtaClick}>
            <span>{ctaLabel}</span>
          </TransitionLink>
        </motion.div>
      </motion.div>
    </section>
  );
}
