import type { Metadata } from "next";
import Image from "next/image";
import { Clock, MapPin, Tag, Users, type LucideIcon } from "lucide-react";
import { EvaluationForm } from "@/components/home/EvaluationForm";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/motion/Reveal";
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
          <Reveal>
            <EvaluationForm variant="page" />
          </Reveal>

          <figure className={styles.portrait}>
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
          </figure>
        </div>
      </section>

      <section id="como-funciona" className={styles.how} aria-labelledby="como-funciona-titulo">
        <div className="container">
          <header className={styles.howHead}>
            <div className={styles.howIntroBlock}>
              <h2 id="como-funciona-titulo" className={styles.heading}>
                {EVALUATION_PAGE.howTitle}
              </h2>
              <p className={styles.howIntro}>{EVALUATION_PAGE.howIntro}</p>
            </div>
            <Button href="#formulario" variant="primary">
              {EVALUATION_PAGE.backToForm}
            </Button>
          </header>

          {EVALUATION_STEPS.length > 0 && (
            <ol className={styles.steps}>
              {EVALUATION_STEPS.map((step, index) => (
                <li key={step.title} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </li>
              ))}
            </ol>
          )}

          <dl className={styles.facts}>
            {EVALUATION_FACTS.map((fact, index) => {
              const Icon = FACT_ICONS[fact.icon];
              return (
                <div key={fact.label} className={`${styles.fact} ${FACT_TONES[index] ?? styles.toneWhite}`}>
                  <dt>
                    <span className={styles.factIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    {fact.label}
                  </dt>
                  <dd>{fact.value ?? <span className="pending">{EVALUATION_PAGE.pendingLabel}</span>}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {realTestimonial && (
        <section className={styles.testimonial} aria-label="Depoimento">
          <div className="container">
            <figure
              className={`${styles.quoteCard} ${realTestimonial.photo ? "" : styles.quoteCardNoPhoto}`}
              data-surface="dark"
            >
              {realTestimonial.photo && (
                <Image
                  className={styles.quotePhoto}
                  src={realTestimonial.photo}
                  alt=""
                  width={128}
                  height={128}
                />
              )}
              <blockquote className={styles.quote}>
                <span className={styles.quoteMark} aria-hidden="true">
                  “
                </span>
                {realTestimonial.quote}
              </blockquote>
              <figcaption className={styles.quoteCaption}>
                <span className={styles.quoteAuthor}>{realTestimonial.author}</span>
                <span className={styles.quoteRole}>{realTestimonial.role}</span>
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      <section id="quem-atende" className={styles.who} aria-labelledby="quem-atende-titulo">
        <div className={`container ${styles.whoGrid}`}>
          <div className={styles.whoText}>
            <h2 id="quem-atende-titulo" className={styles.heading}>
              {EVALUATION_PAGE.whoTitle}
            </h2>
            <p className={styles.reading}>{PROFILE_INTRO}</p>
            {clinic && (
              <p className={styles.activity}>
                <strong>{clinic.title}.</strong> {clinic.text}
              </p>
            )}
            {institution && (
              <p className={styles.activity}>
                <strong>{institution.title}.</strong> {institution.text}
              </p>
            )}
          </div>

          <div className={styles.whoSide}>
            <ul className={styles.formation} aria-label="Formação">
              {PROFILE_FORMATION.map((item) => (
                <li key={item.title}>
                  {item.year && (
                    <>
                      <strong>{item.year}</strong>
                      {" · "}
                    </>
                  )}
                  {item.title}
                </li>
              ))}
            </ul>
            <Button href={EVALUATION_PAGE.whoLink.href} variant="outline">
              {EVALUATION_PAGE.whoLink.label}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
