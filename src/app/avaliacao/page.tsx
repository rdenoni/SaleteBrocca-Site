import type { Metadata } from "next";
import Image from "next/image";
import { Clock, MapPin, Tag, Users, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EvaluationForm } from "@/components/home/EvaluationForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { GuidedReading } from "@/motion/GuidedReading";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterBanner, afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import {
  EVALUATION_FACTS,
  EVALUATION_PAGE,
  EVALUATION_STEPS,
  type EvaluationFactIcon,
} from "@/lib/content/evaluation";
import {
  PROFILE_ACTIVITIES,
  PROFILE_FORMATION,
  PROFILE_INTRO,
  PROFILE_NAME,
  PROFILE_ROLE,
} from "@/lib/content/profile";
import { getTestimonials } from "@/lib/content/testimonials";
import styles from "./avaliacao.module.css";

const FACT_ICONS: Record<EvaluationFactIcon, LucideIcon> = {
  place: MapPin,
  hours: Clock,
  age: Users,
  price: Tag,
};

/* Fundo de cada bloco da ficha, pela ordem de EVALUATION_FACTS: ciano, azul claro e dois brancos. */
const FACT_TONES = [styles.toneCyan, styles.toneLightBlue, styles.toneWhite, styles.toneWhite];

/* Só o que a cliente confirmou: o atendimento do consultório e o da APAE (profile.ts) e o depoimento real da Daniele. */
const clinic = PROFILE_ACTIVITIES.find((activity) => activity.icon === "clinic");
const institution = PROFILE_ACTIVITIES.find((activity) => activity.icon === "institution");
const realTestimonial = getTestimonials().filter((testimonial) => !testimonial.simulated)[0];

/* Movimento (MOTION-SYSTEM), por hierarquia: banner (título → subtítulo) → título do formulário → cartão e campos,
   um a um → retrato (se desvela de baixo para cima; a ousadia desta tela). Daqui para baixo, cada seção entra ao
   chegar à tela, o título primeiro (afterTitle) e o resto em seguida. O depoimento usa a leitura guiada. */
const { stagger } = motionTokens;
const FORM_START = afterBanner(motionTokens, EVALUATION_PAGE.title);
const HOW_START = afterTitle(motionTokens, EVALUATION_PAGE.howTitle);
const FACTS_START = HOW_START + 2 * stagger.items + EVALUATION_STEPS.length * stagger.cards;
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

          {/* Por viewport: no desktop espera a cascata do formulário (a foto nunca antes do texto); no celular,
              empilhada abaixo, só se desvela quando chega à tela. */}
          <Reveal as="figure" variant="mask" className={styles.portrait}>
            <Image
              src="/images/about/salete-perfil.jpg"
              alt="Maria Salete Brocca Denoni, de blazer azul-marinho e óculos, em seu escritório diante de uma estante de livros"
              width={900}
              height={1125}
              sizes="(max-width: 1099px) 420px, 40vw"
            />
            <figcaption className={styles.portraitCaption}>
              <span className={styles.portraitName}>{PROFILE_NAME}</span>
              <span className={styles.portraitRole}>{PROFILE_ROLE}</span>
            </figcaption>
          </Reveal>
        </div>
      </section>

      <section id="como-funciona" className={styles.how} aria-labelledby="como-funciona-titulo">
        <div className="container">
          <header className={styles.howHead}>
            <div className={styles.howIntroBlock}>
              <TextReveal as="h2" id="como-funciona-titulo" className={styles.heading} text={EVALUATION_PAGE.howTitle} />
              <Reveal as="p" delay={HOW_START} className={styles.howIntro}>
                {EVALUATION_PAGE.howIntro}
              </Reveal>
            </div>
            <Reveal delay={HOW_START + stagger.items}>
              <MotionButton href="#formulario" variant="primary">
                {EVALUATION_PAGE.backToForm}
              </MotionButton>
            </Reveal>
          </header>

          {EVALUATION_STEPS.length > 0 && (
            <Stagger as="ol" pace="cards" delay={HOW_START + 2 * stagger.items} className={styles.steps}>
              {EVALUATION_STEPS.map((step, index) => (
                <StaggerItem as="li" key={step.title} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          )}

          <Stagger as="dl" pace="cards" delay={FACTS_START} className={styles.facts}>
            {EVALUATION_FACTS.map((fact, index) => {
              const Icon = FACT_ICONS[fact.icon];
              return (
                <StaggerItem key={fact.label} className={`${styles.fact} ${FACT_TONES[index] ?? styles.toneWhite}`}>
                  <dt>
                    <span className={styles.factIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    {fact.label}
                  </dt>
                  <dd>{fact.value ?? <span className="pending">{EVALUATION_PAGE.pendingLabel}</span>}</dd>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {realTestimonial && (
        <section className={styles.testimonial} aria-label="Depoimento">
          <div className="container">
            <Reveal
              as="figure"
              className={`${styles.quoteCard} ${realTestimonial.photo ? "" : styles.quoteCardNoPhoto}`}
              data-surface="dark"
            >
              {/* A foto tem entrada própria, um passo depois do cartão (nunca antes do texto dele). */}
              {realTestimonial.photo && (
                <Reveal variant="scale" delay={motionTokens.duration.base} className={styles.quotePhoto}>
                  <Image src={realTestimonial.photo} alt="" width={128} height={128} />
                </Reveal>
              )}
              <blockquote className={styles.quote}>
                <span className={styles.quoteMark} aria-hidden="true">
                  “
                </span>
                <GuidedReading as="p" className={styles.quoteText} text={realTestimonial.quote} />
              </blockquote>
              <figcaption className={styles.quoteCaption}>
                <span className={styles.quoteAuthor}>{realTestimonial.author}</span>
                <span className={styles.quoteRole}>{realTestimonial.role}</span>
              </figcaption>
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
