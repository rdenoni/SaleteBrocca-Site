"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useMotionTokens } from "@/motion/useMotionTokens";
import type { SocialNetwork } from "@/types/content";
import styles from "./Footer.module.css";

/* Quanto o círculo sobe no hover/foco (token distance.micro = 4; aqui 3). */
const LIFT_PX = 3;
const RING_RADIUS = 20;
const RING_CENTER = 22;
const RING_PATH = `M${RING_CENTER} ${RING_CENTER - RING_RADIUS} a${RING_RADIUS} ${RING_RADIUS} 0 1 1 0 ${2 * RING_RADIUS} a${RING_RADIUS} ${RING_RADIUS} 0 1 1 0 ${-2 * RING_RADIUS}`;

interface SocialButtonProps {
  network: SocialNetwork;
  label: string;
  /** Endereço oficial confirmado pela cliente (nunca inventado). */
  href: string;
}

/* Ícone de perfil social: link externo real. Hover/foco: o ícone se encaixa (escala e giro com spring.fit) e um
   anel ciano se desenha (o traço). A célula de 48px é a área de toque; o círculo visual tem 36px.
   Movimento reduzido: nenhum deslocamento, só o anel aparece com opacidade. */
export function SocialButton({ network, label, href }: SocialButtonProps) {
  const t = useMotionTokens();
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const active = hovered || keyboardFocus;

  const circleTransition = t.reduced ? { duration: 0 } : t.spring.ui;
  const ringTransition = t.reduced
    ? { duration: t.duration.quick }
    : { duration: t.duration.base, ease: t.ease.stroke };

  return (
    <div className={styles.socialItem}>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.socialButton}
        aria-label={`${label} (abre em nova aba)`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => setKeyboardFocus(event.currentTarget.matches(":focus-visible"))}
        onBlur={() => setKeyboardFocus(false)}
        animate={t.reduced ? { y: 0, scale: 1 } : { y: active ? -LIFT_PX : 0, scale: active ? 1.1 : 1 }}
        whileTap={t.reduced ? undefined : { scale: 0.92, y: 0 }}
        transition={circleTransition}
      >
        {/* O anel se desenha ao redor do botão (stroke): o traço da marca. */}
        <svg className={styles.socialRing} viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false">
          <motion.path
            d={RING_PATH}
            stroke="var(--cyan)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: t.reduced ? 1 : 0, opacity: 0 }}
            animate={t.reduced ? { pathLength: 1, opacity: active ? 1 : 0 } : { pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
            transition={ringTransition}
          />
        </svg>
        <motion.span
          className={styles.socialGlyph}
          animate={t.reduced ? { scale: 1, rotate: 0 } : { scale: active ? 1.14 : 1, rotate: active ? -8 : 0 }}
          transition={circleTransition}
        >
          <SocialIcon network={network} />
        </motion.span>
      </motion.a>
    </div>
  );
}
