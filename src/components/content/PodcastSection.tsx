import { LinkArrow } from "@/components/ui/LinkArrow";
import {
  PODCAST_NAME,
  PODCASTS_ARE_SIMULATED,
  getPodcastEpisodes,
} from "@/lib/content/podcasts";
import { Reveal } from "@/motion/Reveal";
import { TextReveal } from "@/motion/TextReveal";
import { afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import { PodcastEpisodeGrid } from "./PodcastEpisodeGrid";
import styles from "./PodcastSection.module.css";

const TITLE = "Podcast";
const AFTER_TITLE = afterTitle(motionTokens, TITLE);
const { duration } = motionTokens;

/* Seção "Podcast" da biblioteca de conteúdo: os episódios e o caminho para a página própria.
   Entrada (ordem de leitura): título → etiqueta e texto → episódios em cascata → "Ver todos". */
export function PodcastSection() {
  return (
    <section id="podcast" className={styles.section} aria-labelledby="podcast-titulo">
      <div className={styles.head}>
        <div className={styles.headText}>
          <TextReveal as="h2" id="podcast-titulo" className={styles.heading} text={TITLE} />
          {PODCASTS_ARE_SIMULATED && (
            <Reveal variant="fade" delay={AFTER_TITLE}>
              <span className="pending">Podcast simulado</span>
            </Reveal>
          )}
        </div>
        <Reveal as="p" delay={AFTER_TITLE} className={styles.intro}>
          {PODCAST_NAME}: conversas sobre temas do curso Dificuldades na Aprendizagem.
          {PODCASTS_ARE_SIMULATED && " Os episódios abaixo são exemplos de pauta; o áudio ainda não foi gravado."}
        </Reveal>
      </div>

      <PodcastEpisodeGrid episodes={getPodcastEpisodes()} delay={AFTER_TITLE + duration.base} />

      <Reveal delay={AFTER_TITLE + duration.base * 2} className={styles.all}>
        <LinkArrow href="/conteudo/podcast">Ver todos os episódios</LinkArrow>
      </Reveal>
    </section>
  );
}
