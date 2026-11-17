"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { useMotionTokens } from "@/motion/useMotionTokens";
import type { SocialNetwork } from "@/types/content";
import styles from "./Footer.module.css";

/* Quanto tempo o aviso fica depois de um toque (no celular não existe hover). Não é movimento: é leitura. */
const NOTICE_HOLD_MS = 2600;
/* Quanto o círculo sobe no hover/foco (token distance.micro = 4; aqui 3 para não encostar no aviso). */
const LIFT_PX = 3;
const RING_RADIUS = 20;
const RING_CENTER = 22;
const RING_PATH = `M${RING_CENTER} ${RING_CENTER - RING_RADIUS} a${RING_RADIUS} ${RING_RADIUS} 0 1 1 0 ${2 * RING_RADIUS} a${RING_RADIUS} ${RING_RADIUS} 0 1 1 0 ${-2 * RING_RADIUS}`;

interface SocialButtonProps {
  network: SocialNetwork;
  label: string;
  /** Endereço oficial confirmado pela cliente (nunca inventado). null = ainda em confirmação: vira <button> com aviso. */
  href: string | null;
  /** Avisa a lista quando este botão pede (ou deixa de pedir) o aviso "Endereço em confirmação". */
  onNoticeChange: (network: SocialNetwork, visible: boolean) => void;
}

/* Ícone de perfil social. Com endereço confirmado é um link externo real; sem endereço (href null) é um <button>,
   nunca um link falso, e hover/foco/toque pedem o aviso "Endereço em confirmação" que a lista (SocialProfiles)
   desenha uma vez só. Hover/foco: o ícone se encaixa (escala e giro com spring.ui) e um anel ciano se desenha
   (o traço). A célula de 48px é a área de toque; o círculo visual tem 36px. Movimento reduzido: nenhum
   deslocamento, só o anel aparece com opacidade. */
export function SocialButton({ network, label, href, onNoticeChange }: SocialButtonProps) {
  const t = useMotionTokens();
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [tapped, setTapped] = useState(false);
  const tapTimerRef = useRef<number | undefined>(undefined);
  const pending = href === null;

  useEffect(() => () => window.clearTimeout(tapTimerRef.current), []);

  const active = hovered || keyboardFocus;
  const showNotice = pending && (active || tapped);

  useEffect(() => {
    onNoticeChange(network, showNotice);
  }, [network, showNotice, onNoticeChange]);

  /* Desmontar (ex.: troca de rota) não pode deixar o aviso preso na lista. */
  useEffect(() => () => onNoticeChange(network, false), [network, onNoticeChange]);

  function handleClick() {
    setTapped(true);
    window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => setTapped(false), NOTICE_HOLD_MS);
  }

  const circleTransition = t.reduced ? { duration: 0 } : t.spring.ui;
  const ringTransition = t.reduced
    ? { duration: t.duration.quick }
    : { duration: t.duration.base, ease: t.ease.stroke };

  const sharedProps = {
    className: styles.socialButton,
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") setHovered(true);
    },
    onPointerLeave: () => setHovered(false),
    onFocus: (event: FocusEvent<HTMLElement>) => setKeyboardFocus(event.currentTarget.matches(":focus-visible")),
    onBlur: () => setKeyboardFocus(false),
    /* O círculo sobe e cresce um pouco; no toque encolhe. Reduzido: nenhum movimento. */
    animate: t.reduced ? { y: 0, scale: 1 } : { y: active ? -LIFT_PX : 0, scale: active ? 1.1 : 1 },
    whileTap: t.reduced ? undefined : { scale: 0.92, y: 0 },
    transition: circleTransition,
  };

  const content = (
    <>
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
      {/* O encaixe: o ícone assenta com uma mola curta. */}
      <motion.span
        className={styles.socialGlyph}
        animate={t.reduced ? { scale: 1, rotate: 0 } : { scale: active ? 1.14 : 1, rotate: active ? -8 : 0 }}
        transition={circleTransition}
      >
        <SocialIcon network={network} />
      </motion.span>
    </>
  );

  return (
    <div className={styles.socialItem}>
      {pending ? (
        <motion.button
          type="button"
          aria-label={`${label}: endereço em confirmação`}
          onClick={handleClick}
          {...sharedProps}
        >
          {content}
        </motion.button>
      ) : (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} (abre em nova aba)`}
          {...sharedProps}
        >
          {content}
        </motion.a>
      )}
    </div>
  );
}
