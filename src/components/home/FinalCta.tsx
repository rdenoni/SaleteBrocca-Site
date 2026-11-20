"use client";

import Image from "next/image";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./FinalCta.module.css";

/* Chamada final em fundo branco com as peças da marca (o footer é navy:
   nunca duas seções navy seguidas). Texto proposto — validar com a cliente.
   Entrada: título palavra por palavra → texto → botões em cascata. */
export function FinalCta() {
  const t = useMotionTokens();
  const step = (n: number): number => (t.reduced ? 0 : n);

  return (
    <section className={styles.section} aria-labelledby="cta-titulo">
      <Image
        src="/brand/patterns/grafismo-pecas.png"
        alt=""
        width={1921}
        height={1081}
        className={styles.pieces}
        sizes="(max-width: 767px) 120vw, 60vw"
      />
      <div className={`container ${styles.inner}`}>
        <TextReveal as="h2" id="cta-titulo" className={styles.title} text="Marque uma avaliação" />
        <Reveal as="p" className={styles.text} delay={step(t.duration.base)}>
          Converse com a Salete sobre as dificuldades de aprendizagem.
        </Reveal>
        <Stagger className={styles.actions} delay={step(t.duration.gentle)}>
          <StaggerItem>
            <MotionButton href="/avaliacao" variant="primary" withCurtain>
              Marcar avaliação
            </MotionButton>
          </StaggerItem>
          <StaggerItem>
            <MotionButton href="/cursos" variant="outline" withCurtain>
              Explorar cursos
            </MotionButton>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
