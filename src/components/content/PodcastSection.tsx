import { LinkArrow } from "@/components/ui/LinkArrow";
import {
  PODCAST_NAME,
  PODCASTS_ARE_SIMULATED,
  getPodcastEpisodes,
} from "@/lib/content/podcasts";
import { PodcastEpisodeGrid } from "./PodcastEpisodeGrid";
import styles from "./PodcastSection.module.css";

/* Seção "Podcast" da biblioteca de conteúdo: os episódios e o caminho para a página própria. */
export function PodcastSection() {
  return (
    <section id="podcast" className={styles.section} aria-labelledby="podcast-titulo">
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 id="podcast-titulo" className={styles.heading}>
            Podcast
          </h2>
          {PODCASTS_ARE_SIMULATED && <span className="pending">Podcast simulado</span>}
        </div>
        <p className={styles.intro}>
          {PODCAST_NAME}: conversas sobre temas do curso Dificuldades na Aprendizagem.
          {PODCASTS_ARE_SIMULATED && " Os episódios abaixo são exemplos de pauta; o áudio ainda não foi gravado."}
        </p>
      </div>

      <PodcastEpisodeGrid episodes={getPodcastEpisodes()} />

      <LinkArrow href="/conteudo/podcast" className={styles.all}>
        Ver todos os episódios
      </LinkArrow>
    </section>
  );
}
