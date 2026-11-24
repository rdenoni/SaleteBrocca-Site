"use client";

import { BadgeCheck } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { withInViewWait } from "@/motion/pageSequence";
import { revealVariants } from "@/motion/Reveal";
import { useMotionTokens } from "@/motion/useMotionTokens";
import type { FormationItem } from "@/types/content";
import styles from "./FormationTimeline.module.css";

interface FormationTimelineProps {
  items: readonly FormationItem[];
  /** Registro profissional; null oculta o registro até a cliente confirmar. */
  crfa: string | null;
  /** Espera o título da seção (afterTitle) antes de desenhar o trilho. */
  delay?: number;
}

const OPEN = "inset(0% 0% 0% 0%)";
/* Recorta pela direita E por baixo: o mesmo valor desenha o trilho da esquerda para a direita no desktop
   e de cima para baixo no mobile, sem código por largura. */
const CLOSED = "inset(0% 100% 100% 0%)";

/* Linha do tempo da formação: horizontal no desktop, vertical no mobile.
   O trilho se desenha (o traço) e cada ponto encaixa com a mola curta quando a linha chega até ele;
   ano e título sobem logo depois. Movimento reduzido: só opacidade. */
export function FormationTimeline({ items, crfa, delay = 0 }: FormationTimelineProps) {
  const t = useMotionTokens();
  const draw = t.duration.slow;
  /* Os pontos ficam no início de cada coluna: a linha passa pelo ponto i em i/n do traçado. */
  const at = (index: number): number => (t.reduced ? 0 : delay + (index / items.length) * draw);

  /* Tudo aqui entra por viewport: cada variante espera o topo da página se a seção já estava na tela. */
  const rise = (delay: number): Variants => withInViewWait(revealVariants("rise", t, delay));
  const track: Variants = withInViewWait(t.reduced
    ? {
        hidden: { opacity: 0, clipPath: OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
        visible: { opacity: 1, clipPath: OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
      }
    : {
        hidden: { clipPath: CLOSED },
        visible: { clipPath: OPEN, transition: { duration: draw, ease: t.ease.stroke, delay } },
      });

  const dot = (index: number): Variants =>
    withInViewWait(t.reduced
      ? revealVariants("fade", t)
      : {
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { ...t.spring.fit, delay: at(index), opacity: { duration: t.duration.quick, delay: at(index) } },
          },
        });

  return (
    <motion.div className={styles.wrap} initial="hidden" whileInView="visible" viewport={t.viewport}>
      <div className={styles.rail}>
        <motion.span className={styles.track} aria-hidden="true" data-reveal="" variants={track} />
        <ol className={styles.timeline}>
          {items.map((item, index) => (
            <li key={item.title} className={styles.item}>
              {/* Sem ano confirmado o espaço fica reservado, só para os pontos seguirem alinhados. */}
              <motion.span
                className={styles.year}
                aria-hidden={item.year ? undefined : true}
                data-reveal=""
                variants={rise(at(index) + (t.reduced ? 0 : t.duration.instant))}
              >
                {item.year}
              </motion.span>
              <motion.span className={styles.dot} aria-hidden="true" data-reveal="" variants={dot(index)} />
              <motion.p
                className={styles.title}
                data-reveal=""
                variants={rise(at(index) + (t.reduced ? 0 : t.duration.quick))}
              >
                {item.title}
              </motion.p>
            </li>
          ))}
        </ol>
      </div>

      {crfa && (
        <motion.p className={styles.register} data-reveal="" variants={rise(t.reduced ? 0 : delay + draw)}>
          <BadgeCheck aria-hidden="true" size={24} />
          <span>Registro profissional</span>
          <strong>{crfa}</strong>
        </motion.p>
      )}
    </motion.div>
  );
}
