import type { Metadata } from "next";
import Image from "next/image";
import { Clock, MapPin, Tag, Users, type LucideIcon } from "lucide-react";
import { EvaluationForm } from "@/components/home/EvaluationForm";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Reveal } from "@/motion/Reveal";
import { EVALUATION_FACTS, EVALUATION_PAGE, type EvaluationFactIcon } from "@/lib/content/evaluation";
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

/* Só o que a cliente confirmou: o atendimento do consultório e o da APAE (profile.ts) e o depoimento real da Daniele. */
const clinic = PROFILE_ACTIVITIES.find((activity) => activity.icon === "clinic");
const institution = PROFILE_ACTIVITIES.find((activity) => activity.icon === "institution");
const realTestimonials = getTestimonials().filter((testimonial) => !testimonial.simulated);

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

      <section id="quem-atende" className={styles.who} aria-labelledby="quem-atende-titulo">
        <div className={`container ${styles.whoGrid}`}>
          <div className={styles.portrait}>
            <Image
              src="/images/about/salete-perfil.jpg"
              alt="Maria Salete Brocca Denoni, de blazer azul-marinho e óculos, em seu escritório diante de uma estante de livros"
              width={900}
              height={1125}
              sizes="(max-width: 767px) 80vw, 280px"
            />
          </div>

          <div className={styles.whoText}>
            <h2 id="quem-atende-titulo" className={styles.heading}>
              {EVALUATION_PAGE.whoTitle}
            </h2>
            <p className={styles.name}>{PROFILE_NAME}</p>
            <p className={styles.role}>{PROFILE_ROLE}</p>
            <p className={styles.reading}>{PROFILE_INTRO}</p>
            {clinic && (
              <p className={styles.reading}>
                <strong>{clinic.title}.</strong> {clinic.text}
              </p>
            )}
            {institution && (
              <p className={styles.reading}>
                <strong>{institution.title}.</strong> {institution.text}
              </p>
            )}
            <ul className={styles.formation} aria-label="Formação">
              {PROFILE_FORMATION.map((item) => (
                <li key={item.title}>
                  {item.year && <span className={styles.year}>{item.year}</span>}
                  {item.title}
                </li>
              ))}
            </ul>
            <LinkArrow href={EVALUATION_PAGE.whoLink.href}>{EVALUATION_PAGE.whoLink.label}</LinkArrow>
          </div>
        </div>
      </section>

      <section
        id="formulario"
        className={`${styles.request} ${realTestimonials.length === 0 ? styles.requestSolo : ""}`}
        aria-label="Pedido de avaliação"
      >
        <div className={styles.formColumn}>
          <Reveal className={styles.formInner}>
            <EvaluationForm />
          </Reveal>
        </div>
        {realTestimonials.length > 0 && (
          <div className={styles.testimonialColumn} data-surface="dark">
            <TestimonialSlider items={realTestimonials} />
          </div>
        )}
      </section>

      <section id="como-funciona" className={styles.how} aria-labelledby="como-funciona-titulo">
        <div className={`container ${styles.howGrid}`}>
          <header className={styles.howHead}>
            <h2 id="como-funciona-titulo" className={styles.heading}>
              {EVALUATION_PAGE.howTitle}
            </h2>
            <p className={styles.howIntro}>{EVALUATION_PAGE.howIntro}</p>
            <Button href="#formulario" variant="primary">
              {EVALUATION_PAGE.backToForm}
            </Button>
          </header>

          <dl className={styles.facts}>
            {EVALUATION_FACTS.map((fact) => {
              const Icon = FACT_ICONS[fact.icon];
              return (
                <div key={fact.label} className={styles.fact}>
                  <dt>
                    <Icon aria-hidden="true" />
                    {fact.label}
                  </dt>
                  <dd>{fact.value ?? <span className="pending">{EVALUATION_PAGE.pendingLabel}</span>}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>
    </>
  );
}
