import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { EvaluationForm } from "@/components/home/EvaluationForm";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { PageBanner } from "@/components/layout/PageBanner";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterBanner, afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import { EVALUATION_PAGE } from "@/lib/content/evaluation";
import { HOME_TESTIMONIALS } from "@/lib/content/home";
import {
  PROFILE_ACTIVITIES,
  PROFILE_FORMATION,
  PROFILE_INTRO,
  PROFILE_NAME,
  PROFILE_ROLE,
} from "@/lib/content/profile";
import { getTestimonials } from "@/lib/content/testimonials";
import styles from "./avaliacao.module.css";

/* Só o que a cliente confirmou: o atendimento do consultório e o da APAE (profile.ts) e os depoimentos (Daniele real primeiro). */
const clinic = PROFILE_ACTIVITIES.find((activity) => activity.icon === "clinic");
const institution = PROFILE_ACTIVITIES.find((activity) => activity.icon === "institution");
const testimonials = getTestimonials();

/* Movimento (MOTION-SYSTEM), por hierarquia: banner (título → subtítulo) → formulário e retrato (foto com priority
   desvelando de cima para baixo antes da legenda). Daqui para baixo, cada seção entra ao chegar à tela, o título
   primeiro (afterTitle) e o resto em seguida. */
const { stagger } = motionTokens;
const FORM_START = afterBanner(motionTokens, EVALUATION_PAGE.title);
const WHO_START = afterTitle(motionTokens, EVALUATION_PAGE.whoTitle);

const whoParagraphs: { key: string; className: string; content: ReactNode }[] = [
  { key: "intro", className: styles.reading, content: PROFILE_INTRO },
  ...[clinic, institution].flatMap((activity) =>
    activity
      ? [
          {
            key: activity.title,
            className: styles.activity,
            content: (
              <>
                <strong>{activity.title}.</strong> {activity.text}
              </>
            ),
          },
        ]
      : [],
  ),
];
const FORMATION_START = WHO_START + whoParagraphs.length * stagger.items;
const WHO_LINK_START = FORMATION_START + PROFILE_FORMATION.length * stagger.items;

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export const metadata: Metadata = {
  title: EVALUATION_PAGE.title,
  description: clinic
    ? `Avaliação com ${PROFILE_NAME}, ${PROFILE_ROLE.toLowerCase()}: ${lowerFirst(clinic.text)}`
    : `Avaliação com ${PROFILE_NAME}, ${PROFILE_ROLE.toLowerCase()}.`,
};

export default function EvaluationPage() {
  return (
    <>
      <PageBanner title={EVALUATION_PAGE.title} subtitle={`Pedido de avaliação com ${PROFILE_NAME}, fonoaudióloga clínica.`} size="compact" />

      <section id="formulario" className={styles.request} aria-label="Pedido de avaliação">
        <div className={`container ${styles.requestGrid}`}>
          <div>
            <EvaluationForm variant="page" entranceDelay={FORM_START} />
          </div>

          {/* Foto pré-carregada (priority) com entrada de cima para baixo sincronizada com o topo; legenda entra em seguida. */}
          <figure className={styles.portrait}>
            <Reveal variant="mask" trigger="mount" delay={FORM_START} className={styles.portraitMedia}>
              <Image
                src="/images/about/salete-perfil.jpg"
                alt="Maria Salete Brocca Denoni, de blazer azul-marinho e óculos, em seu escritório diante de uma estante de livros"
                width={900}
                height={1125}
                priority
                sizes="(max-width: 1099px) 420px, 40vw"
              />
            </Reveal>
            <Reveal
              as="figcaption"
              variant="rise"
              trigger="mount"
              delay={FORM_START + motionTokens.duration.base}
              className={styles.portraitCaption}
            >
              <span className={styles.portraitName}>{PROFILE_NAME}</span>
              <span className={styles.portraitRole}>{PROFILE_ROLE}</span>
            </Reveal>
          </figure>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className={styles.testimonial} aria-label="Depoimentos">
          <div className="container">
            <Reveal className={styles.testimonialCard} data-surface="dark">
              <TestimonialSlider items={testimonials} simulatedLabel={HOME_TESTIMONIALS.simulatedTag} />
            </Reveal>
          </div>
        </section>
      )}

      <section id="quem-atende" className={styles.who} aria-labelledby="quem-atende-titulo">
        <div className={`container ${styles.whoGrid}`}>
          <div className={styles.whoText}>
            <TextReveal as="h2" id="quem-atende-titulo" className={styles.heading} text={EVALUATION_PAGE.whoTitle} />
            {whoParagraphs.map((paragraph, index) => (
              <Reveal
                as="p"
                key={paragraph.key}
                delay={WHO_START + index * stagger.items}
                className={paragraph.className}
              >
                {paragraph.content}
              </Reveal>
            ))}
          </div>

          <div className={styles.whoSide}>
            <Stagger as="ul" delay={FORMATION_START} className={styles.formation} aria-label="Formação">
              {PROFILE_FORMATION.map((item) => (
                <StaggerItem as="li" key={item.title}>
                  {item.year && (
                    <>
                      <strong>{item.year}</strong>
                      {" · "}
                    </>
                  )}
                  {item.title}
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={WHO_LINK_START}>
              <MotionButton href={EVALUATION_PAGE.whoLink.href} variant="outline" withCurtain>
                {EVALUATION_PAGE.whoLink.label}
              </MotionButton>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
