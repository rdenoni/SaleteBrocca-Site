"use client";

import { motion, type Variants } from "motion/react";
import { useState } from "react";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { HOME_SECTION_IDS, HOME_TESTIMONIALS } from "@/lib/content/home";
import type { Testimonial } from "@/types/content";
import { EvaluationForm } from "./EvaluationForm";
import styles from "./EvaluationSection.module.css";
import { TestimonialSlider } from "./TestimonialSlider";

const OPEN = "inset(0% 0% 0% 0%)";
/* Recorte fechado na borda direita: a coluna navy se abre da direita para a esquerda. */
const CLOSED_AT_RIGHT = "inset(0% 0% 0% 100%)";
/* Fração da abertura em que o texto do depoimento já pode subir. */
const TESTIMONIAL_START = 0.4;

/* Duas colunas assimétricas da referência: avaliação (branco, 48%) e depoimento (navy, 52%).
   Entrada: a coluna navy é "varrida" para dentro (traço, ease.stroke) enquanto o formulário sobe. */
interface EvaluationSectionProps {
  testimonials: readonly Testimonial[];
}

export function EvaluationSection({ testimonials }: EvaluationSectionProps) {
  const t = useMotionTokens();
  /* A coluna navy nasce recortada: o observador do depoimento não a enxerga, então a entrada vem daqui. */
  const [testimonialPlays, setTestimonialPlays] = useState(false);

  /* Reduzido: só opacidade; recorte e deslocamento neutros nos dois estados (a hidratação pode ter começado recortada). */
  const wipe: Variants = t.reduced
    ? {
        hidden: { opacity: 0, clipPath: OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
        visible: { opacity: 1, clipPath: OPEN, transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
      }
    : {
        hidden: { clipPath: CLOSED_AT_RIGHT },
        visible: { clipPath: OPEN, transition: { duration: t.duration.slow, ease: t.ease.stroke } },
      };

  const rise: Variants = t.reduced
    ? {
        hidden: { opacity: 0, y: 0, transition: { duration: t.duration.quick, y: { duration: 0 } } },
        visible: { opacity: 1, y: 0, transition: { duration: t.duration.quick, y: { duration: 0 } } },
      }
    : {
        hidden: { opacity: 0, y: t.distance.base },
        visible: { opacity: 1, y: 0, transition: { duration: t.duration.gentle, ease: t.ease.out } },
      };

  return (
    /* UM gatilho só, na seção: formulário, "?" e coluna dos depoimentos começam juntos (pedido do cliente).
       Antes cada bloco tinha o próprio whileInView e o formulário (topo mais baixo por causa do respiro) entrava
       depois da coluna navy. Os filhos herdam "hidden" → "visible" pelos variants. */
    <motion.section
      className={styles.section}
      id={HOME_SECTION_IDS.evaluation}
      aria-label="Avaliação e depoimento"
      initial="hidden"
      whileInView="visible"
      viewport={t.viewport}
      onViewportEnter={() => setTestimonialPlays(true)}
    >
      <div className={styles.form}>
        <motion.div className={styles.formInner} data-reveal="" variants={rise}>
          <EvaluationForm />
        </motion.div>
      </div>
      <motion.div className={styles.testimonial} data-surface="dark" data-reveal="" variants={wipe}>
        <TestimonialSlider
          items={testimonials}
          simulatedLabel={HOME_TESTIMONIALS.simulatedTag}
          note={testimonials.some((item) => item.simulated) ? HOME_TESTIMONIALS.simulatedNote : undefined}
          delay={t.duration.slow * TESTIMONIAL_START}
          play={testimonialPlays}
        />
      </motion.div>
    </motion.section>
  );
}
