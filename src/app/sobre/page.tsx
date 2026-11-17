import type { Metadata } from "next";
import Image from "next/image";
import { ActivityGrid } from "@/components/about/ActivityGrid";
import { FormationTimeline } from "@/components/about/FormationTimeline";
import { FinalCta } from "@/components/home/FinalCta";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import {
  PROFILE_ACTIVITIES,
  PROFILE_CRFA,
  PROFILE_FORMATION,
  PROFILE_HISTORY,
  PROFILE_INTRO,
  PROFILE_NAME,
  PROFILE_QUOTE,
  PROFILE_ROLE,
} from "@/lib/content/profile";
import styles from "./sobre.module.css";

export const metadata: Metadata = {
  title: "Sobre",
  description: `${PROFILE_NAME}: ${PROFILE_ROLE.toLowerCase()}, com especialização em dificuldade de aprendizagem.`,
};

const SECTIONS = [
  { id: "historia", label: "História" },
  { id: "formacao", label: "Formação" },
  { id: "atuacao", label: "Atuação" },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageBanner title={PROFILE_NAME} subtitle={`${PROFILE_ROLE}.`} />

      <section className={styles.intro} aria-label="Apresentação">
        <div className={`container ${styles.introGrid}`}>
          <div className={styles.portrait}>
            <Image
              src="/images/about/salete-perfil.jpg"
              alt="Maria Salete Brocca Denoni, de blazer azul-marinho e óculos, em seu escritório diante de uma estante de livros"
              width={900}
              height={1125}
              priority
              sizes="(max-width: 767px) 80vw, 340px"
            />
          </div>
          <div className={styles.introText}>
            <p className={styles.lead}>{PROFILE_INTRO}</p>
            <nav aria-label="Nesta página" className={styles.toc}>
              <p className={styles.tocLabel}>Nesta página</p>
              <ul>
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <section id="historia" className={`${styles.history}`} aria-labelledby="historia-titulo">
        <div className={`container ${styles.historyGrid}`}>
          <header>
            <h2 id="historia-titulo" className={`${styles.heading} ${styles.historyHeading}`}>
              Da sala de aula à fonoaudiologia
            </h2>
          </header>
          <div className={styles.historyText}>
            {PROFILE_HISTORY.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="formacao" className={`${styles.formation}`} aria-labelledby="formacao-titulo">
        <div className="container">
          <h2 id="formacao-titulo" className={styles.heading}>
            Formação acadêmica
          </h2>
          <FormationTimeline items={PROFILE_FORMATION} crfa={PROFILE_CRFA} />
        </div>
      </section>

      <section id="atuacao" className={`${styles.activities}`} aria-labelledby="atuacao-titulo">
        <div className="container">
          <h2 id="atuacao-titulo" className={styles.heading}>
            Onde atua hoje
          </h2>
          <ActivityGrid activities={PROFILE_ACTIVITIES} />
        </div>
      </section>

      <section className={styles.quote} data-surface="dark" aria-label="Frase de Maria Salete Brocca">
        <div className={`container ${styles.quoteInner}`}>
          <span className={styles.quoteMark} aria-hidden="true">
            “
          </span>
          <figure className={styles.quoteFigure}>
            <blockquote className={styles.quoteText}>
              <p>{PROFILE_QUOTE}</p>
            </blockquote>
            <figcaption className={styles.quoteAuthor}>{PROFILE_NAME}</figcaption>
          </figure>
          <Button href="/cursos" variant="accent">
            Conhecer os cursos
          </Button>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
