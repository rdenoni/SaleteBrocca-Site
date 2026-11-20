import type { Metadata } from "next";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutQuote } from "@/components/about/AboutQuote";
import { ActivityGrid } from "@/components/about/ActivityGrid";
import { FormationTimeline } from "@/components/about/FormationTimeline";
import { FinalCta } from "@/components/home/FinalCta";
import { PageBanner } from "@/components/layout/PageBanner";
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
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { DrawRule } from "@/motion/DrawRule";
import { TextReveal } from "@/motion/TextReveal";
import { afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
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

const HISTORY_TITLE = "Da sala de aula à fonoaudiologia";
const FORMATION_TITLE = "Formação acadêmica";
const ACTIVITIES_TITLE = "Onde atua hoje";

/* Movimento (MOTION-SYSTEM): banner e apresentação entram ao montar; daqui para baixo, cada seção entra ao chegar
   à tela. Uma ousadia por tela: o encaixe das peças no retrato e o traço da linha do tempo. O resto só sobe.
   Ordem por hierarquia em cada seção: o título primeiro, o conteúdo depois (afterTitle). */
export default function AboutPage() {
  return (
    <>
      <PageBanner title={PROFILE_NAME} subtitle={`${PROFILE_ROLE}.`} />

      <AboutIntro bannerTitle={PROFILE_NAME} intro={PROFILE_INTRO} sections={SECTIONS} />

      <section id="historia" className={styles.history} aria-labelledby="historia-titulo">
        <div className={`container ${styles.historyGrid}`}>
          <header>
            <TextReveal
              as="h2"
              id="historia-titulo"
              className={`${styles.heading} ${styles.historyHeading}`}
              text={HISTORY_TITLE}
            />
          </header>
          {/* Leitura: título (esquerda) → filete ciano se desenha → parágrafos (direita), um a um. */}
          <div>
            <DrawRule className={styles.historyRule} delay={afterTitle(motionTokens, HISTORY_TITLE)} />
            <Stagger
              className={styles.historyText}
              delay={afterTitle(motionTokens, HISTORY_TITLE) + motionTokens.duration.base}
            >
              {PROFILE_HISTORY.map((paragraph) => (
                <StaggerItem key={paragraph.slice(0, 32)}>
                  <p>{paragraph}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <section id="formacao" className={styles.formation} aria-labelledby="formacao-titulo">
        <div className="container">
          <TextReveal as="h2" id="formacao-titulo" className={styles.heading} text={FORMATION_TITLE} />
          <FormationTimeline
            items={PROFILE_FORMATION}
            crfa={PROFILE_CRFA}
            delay={afterTitle(motionTokens, FORMATION_TITLE)}
          />
        </div>
      </section>

      <section id="atuacao" className={styles.activities} aria-labelledby="atuacao-titulo">
        <div className="container">
          <TextReveal as="h2" id="atuacao-titulo" className={styles.heading} text={ACTIVITIES_TITLE} />
          <ActivityGrid activities={PROFILE_ACTIVITIES} delay={afterTitle(motionTokens, ACTIVITIES_TITLE)} />
        </div>
      </section>

      <AboutQuote quote={PROFILE_QUOTE} author={PROFILE_NAME} />

      <FinalCta />
    </>
  );
}
