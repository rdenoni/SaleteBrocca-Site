"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type MouseEventHandler } from "react";
import { getLqip } from "@/lib/images/lqip";
import { DrawRule } from "./DrawRule";
import styles from "./HeroSequence.module.css";
import { TextReveal } from "./TextReveal";
import { TransitionLink } from "./transitions/TransitionLink";
import { useEntranceReady } from "./transitions/useEntranceReady";
import { useHoldInView } from "./pageSequence";
import { heroTimeline, type HeroTimelineStep } from "./timeline";
import { useMotionTokens } from "./useMotionTokens";
import { useScrollWillChange } from "./useScrollWillChange";

/* Slides reais do Hero: alterna continuamente em fade leve entre o curso disponível
   (Conheça nossos cursos — tratamento azul) e o Curso de Alfabetização (Em breve — foto colorida). */
export interface HeroSlide {
  id: string;
  title: string;
  text: string;
  image: string;
  poster?: string;
  mediaType?: "image" | "video";
  imagePosition?: string;
  tone: "blue" | "color";
  badge?: string;
  ctaLabel: string;
  ctaHref?: string;
}

const DEFAULT_SLIDES: readonly HeroSlide[] = [
  {
    id: "cursos",
    title: "Conheça nossos cursos",
    text: "Formação, conhecimento e ferramentas para compreender as dificuldades de aprendizagem.",
    image: "/videos/hero/crianca-escrevendo.mp4",
    poster: "/images/hero/crianca-escrevendo.jpg",
    mediaType: "video",
    imagePosition: "60% 40%",
    tone: "blue",
    ctaLabel: "Explorar cursos",
    ctaHref: "/cursos",
  },
  {
    id: "alfabetizacao",
    title: "Curso de Alfabetização",
    text: "Em breve. Curso em preparação para pais, professores e profissionais que acompanham crianças no início da alfabetização.",
    image: "/videos/hero/leitura-fluencia.mp4",
    poster: "/images/articles/leitura-fluencia.jpg",
    mediaType: "video",
    imagePosition: "55% 35%",
    tone: "blue",
    badge: "Em breve",
    ctaLabel: "Em breve",
  },
  {
    id: "avaliacao",
    title: "Avaliação fonoaudiológica",
    text: "Atendimento clínico e orientação para famílias e escolas diante de dificuldades na aprendizagem.",
    image: "/videos/hero/avaliacao-fonoaudiologica.mp4",
    poster: "/images/hero/avaliacao-fonoaudiologica.jpg",
    mediaType: "video",
    imagePosition: "65% 30%",
    tone: "blue",
    ctaLabel: "Pedir avaliação",
    ctaHref: "/avaliacao",
  },
  {
    id: "conteudo",
    title: "Conteúdos e artigos",
    text: "Artigos, orientações práticas e reflexões sobre leitura, escrita, fala, audição e aprendizagem.",
    image: "/videos/hero/familia-e-escola.mp4",
    poster: "/images/articles/familia-e-escola.jpg",
    mediaType: "video",
    imagePosition: "55% 35%",
    tone: "blue",
    ctaLabel: "Ver conteúdos",
    ctaHref: "/conteudo",
  },
];

const SLIDE_INTERVAL_MS = 7000;
const CROSSFADE_SECONDS = 1.2;

const PHOTO_START_SCALE = 1.08;
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
  /** Slides vindos do CMS (/admin/hero); sem eles, usa DEFAULT_SLIDES. */
  slides?: readonly HeroSlide[];
  /** Opcional: intercepta o clique do botão (ex.: rolar até uma âncora e mover o foco). Sem ele, link comum. */
  onCtaClick?: MouseEventHandler<HTMLAnchorElement>;
}

/* Hero rotativo em fade leve entre o banner principal (Dificuldades na Aprendizagem)
   e o banner "Em breve" do Curso de Alfabetização (foto colorida + selo ciano).
   Controles centralizados na base apenas para trocar de banner; sem troca automática em movimento reduzido. */
export function HeroSequence({
  headingLevel = "h1",
  title,
  text,
  ctaLabel,
  ctaHref,
  imageSrc,
  slides: customSlides,
  onCtaClick,
}: HeroSequenceProps) {
  const t = useMotionTokens();
  const titleId = useId();
  const heroRef = useRef<HTMLElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);

  const baseSlides = customSlides && customSlides.length > 0 ? customSlides : DEFAULT_SLIDES;
  const slides: readonly HeroSlide[] =
    customSlides && customSlides.length > 0
      ? baseSlides
      : [
          {
            ...baseSlides[0],
            ...(title ? { title } : {}),
            ...(text ? { text } : {}),
            ...(ctaLabel ? { ctaLabel } : {}),
            ...(ctaHref ? { ctaHref } : {}),
            ...(imageSrc && imageSrc !== baseSlides[0].poster
              ? {
                  image: imageSrc,
                  mediaType: /\.(mp4|webm|mov)$/i.test(imageSrc) ? "video" : "image",
                }
              : {}),
          },
          ...baseSlides.slice(1),
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  /* Reinicia a contagem a cada troca (automática ou manual) e volta continuamente ao primeiro slide. */
  useEffect(() => {
    if (t.reduced || hovered || slides.length <= 1) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }
    }, SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, t.reduced, hovered, slides.length]);

  const ready = useEntranceReady();

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  useScrollWillChange(photoLayerRef, scrollYProgress, !t.reduced);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", PHOTO_DRIFT]);
  const photoExitScale = useTransform(scrollYProgress, [0, 1], [1, PHOTO_EXIT_SCALE]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -t.distance.section * CONTENT_RISE_FACTOR]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, CONTENT_END_OPACITY]);

  const activeSlide = slides[activeIndex % slides.length];
  const steps = heroTimeline(t, slides[0].title.split(/\s+/).filter(Boolean).length);
  const startOf = (id: HeroTimelineStep["id"]): number => (t.reduced ? 0 : (steps.find((step) => step.id === id)?.start ?? 0));
  useHoldInView(t.reduced ? 0 : startOf("cta") + t.duration.base, ready);

  const riseIn = (id: "text" | "cta") => ({
    initial: { opacity: 0, y: t.reduced ? 0 : t.distance.base },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: t.reduced ? 0 : t.distance.base },
    transition: t.reduced
      ? { duration: t.duration.quick }
      : { duration: t.duration.gentle, ease: t.ease.out, delay: startOf(id) },
  });

  const HeadingTag = headingLevel;

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      data-tone={activeSlide.tone}
      aria-labelledby={titleId}
      data-surface="photo"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
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
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              className={slide.tone === "blue" ? styles.slideBlue : styles.slideColor}
              initial={false}
              animate={{ opacity: index === activeIndex ? 1 : 0 }}
              transition={{ duration: t.reduced ? 0 : CROSSFADE_SECONDS, ease: "easeInOut" }}
            >
              {slide.mediaType === "video" && !(t.reduced && slide.poster) ? (
                <video
                  src={slide.image}
                  poster={slide.poster}
                  autoPlay={!t.reduced}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  aria-hidden="true"
                  className={styles.photo}
                  style={
                    slide.imagePosition
                      ? { width: "100%", height: "100%", objectPosition: slide.imagePosition }
                      : { width: "100%", height: "100%" }
                  }
                />
              ) : (
                <Image
                  src={slide.poster ?? slide.image}
                  alt=""
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL={getLqip(slide.poster ?? slide.image)}
                  sizes="100vw"
                  className={styles.photo}
                  style={slide.imagePosition ? { objectPosition: slide.imagePosition } : undefined}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div className={styles.inner} style={t.reduced ? undefined : { y: contentY, opacity: contentOpacity }}>
        <AnimatePresence mode="wait" initial={false}>
          {activeIndex === 0 ? (
            <motion.div
              key={slides[0].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: t.reduced ? 0 : 0.45, ease: "easeInOut" }}
            >
              <TextReveal
                as={headingLevel}
                id={titleId}
                text={slides[0].title}
                className={styles.title}
                trigger="mount"
                play={ready}
                delay={startOf("title")}
              />
              <DrawRule trigger="mount" play={ready} delay={startOf("rule")} className={styles.rule} />
              <motion.p className={styles.text} data-reveal="" {...riseIn("text")}>
                {slides[0].text}
              </motion.p>
              <motion.div data-reveal="" {...riseIn("cta")}>
                <TransitionLink href={slides[0].ctaHref ?? "/cursos"} className={styles.cta} onClick={onCtaClick}>
                  <span>{slides[0].ctaLabel}</span>
                </TransitionLink>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: t.reduced ? 0 : 0.45, ease: "easeInOut" }}
            >
              {activeSlide.badge ? <span className={styles.soonBadge}>{activeSlide.badge}</span> : null}
              <HeadingTag id={titleId} className={styles.title}>
                {activeSlide.title}
              </HeadingTag>
              <span className={`rule ${styles.rule}`} aria-hidden="true" />
              <p className={styles.text}>{activeSlide.text}</p>
              {activeSlide.ctaHref ? (
                <div>
                  <TransitionLink href={activeSlide.ctaHref} className={styles.cta}>
                    <span>{activeSlide.ctaLabel}</span>
                  </TransitionLink>
                </div>
              ) : (
                <div className={styles.soonRow}>
                  <button type="button" className={styles.ctaDisabled} disabled>
                    {activeSlide.ctaLabel}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className={styles.controls} aria-label="Selecionar banner">
        <div className={styles.dots}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={styles.dot}
              aria-label={`Mostrar banner ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
