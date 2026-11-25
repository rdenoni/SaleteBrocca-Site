"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { getLqip } from "@/lib/images/lqip";
import { DrawRule } from "@/motion/DrawRule";
import { useHoldInView } from "@/motion/pageSequence";
import { afterBanner, heroTimeline } from "@/motion/timeline";
import { Reveal } from "@/motion/Reveal";
import { TextReveal } from "@/motion/TextReveal";
import { useEntranceReady } from "@/motion/transitions/useEntranceReady";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./PageBanner.module.css";

interface PageBannerProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Foto tratada em azul; sem foto o banner é azul liso. */
  image?: string;
  imagePosition?: string;
  size?: "default" | "compact";
  children?: ReactNode;
}

/* Banner das páginas internas: mesmo tratamento azul do hero da Home, mais baixo.
   Também reserva o espaço do header flutuante.
   Entrada na mesma partitura do Hero (título palavra por palavra → régua → texto → extra), ao montar,
   esperando a cortina de transição abrir quando a página chega por ela. */
export function PageBanner({
  title,
  eyebrow,
  subtitle,
  image,
  imagePosition,
  size = "default",
  children,
}: PageBannerProps) {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  /* Seções já na tela ao abrir só entram depois do banner (ordem de leitura). */
  useHoldInView(t.reduced ? 0 : afterBanner(t, title, Boolean(children)), ready);
  const steps = heroTimeline(t, title.split(/\s+/).length);
  const start = (id: (typeof steps)[number]["id"]): number => steps.find((step) => step.id === id)?.start ?? 0;

  return (
    <section className={styles.banner} data-size={size} data-surface="photo" aria-labelledby="page-title">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          placeholder="blur"
          blurDataURL={getLqip(image)}
          sizes="100vw"
          className={styles.photo}
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      )}
      <div className={styles.inner}>
        {eyebrow && (
          <Reveal as="p" variant="fade" trigger="mount" play={ready} className={`eyebrow ${styles.eyebrow}`}>
            {eyebrow}
          </Reveal>
        )}
        <TextReveal
          as="h1"
          id="page-title"
          className={styles.title}
          text={title}
          trigger="mount"
          play={ready}
          delay={start("title")}
        />
        <DrawRule className={styles.rule} trigger="mount" play={ready} delay={start("rule")} />
        {subtitle && (
          <Reveal as="p" trigger="mount" play={ready} delay={start("text")} className={styles.subtitle}>
            {subtitle}
          </Reveal>
        )}
        {children && (
          <Reveal trigger="mount" play={ready} delay={start("cta")} className={styles.extra}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
