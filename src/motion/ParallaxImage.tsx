"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import styles from "./ParallaxImage.module.css";
import { useMotionTokens } from "./useMotionTokens";
import { useScrollWillChange } from "./useScrollWillChange";

const MAX_STRENGTH = 0.5;

export interface ParallaxImageProps {
  src: string;
  alt: string;
  sizes?: string;
  /** Fração da altura da moldura que a imagem percorre para cada lado (0 a 0,5). Padrão 0,12. */
  strength?: number;
  /** Classe da moldura: é ela que define largura e altura (ou aspect-ratio). */
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  /** Cantos arredondados (--radius-lg) na moldura. */
  rounded?: boolean;
  /** Atalho para a proporção da moldura, ex.: "16 / 9". */
  aspectRatio?: string;
}

/* Parallax de imagem sem bordas vazias.
   A camada interna é mais alta que a moldura em `strength` para cima e para baixo (top/bottom negativos)
   e se desloca no máximo ± essa folga enquanto a moldura atravessa a tela. O translateY em % é relativo
   à própria camada (altura 1 + 2s), por isso o intervalo é ± s / (1 + 2s).
   Movimento reduzido: camada do tamanho da moldura, parada. */
export function ParallaxImage({
  src,
  alt,
  sizes = "100vw",
  strength = 0.12,
  className,
  priority = false,
  objectPosition,
  rounded = false,
  aspectRatio,
}: ParallaxImageProps) {
  const t = useMotionTokens();
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const extra = Math.min(Math.max(strength, 0), MAX_STRENGTH);
  const range = (extra / (1 + 2 * extra)) * 100;

  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-range}%`, `${range}%`]);

  const moving = !t.reduced && extra > 0;
  /* Camada promovida só enquanto a moldura atravessa a tela. */
  useScrollWillChange(layerRef, scrollYProgress, moving);
  const layerStyle = moving
    ? { top: `${-extra * 100}%`, bottom: `${-extra * 100}%`, y }
    : /* y: 0 desfaz o deslocamento se o modo reduzido chegar depois da hidratação. */
      { top: 0, bottom: 0, y: 0, willChange: "auto" as const };

  return (
    <div
      ref={frameRef}
      className={[styles.frame, rounded ? styles.rounded : "", className ?? ""].filter(Boolean).join(" ")}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <motion.div ref={layerRef} className={styles.layer} style={layerStyle}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          style={objectPosition ? { objectPosition } : undefined}
        />
      </motion.div>
    </div>
  );
}
