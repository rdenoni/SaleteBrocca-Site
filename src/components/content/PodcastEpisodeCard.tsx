import Link from "next/link";
import { Headphones, Mic } from "lucide-react";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { podcastEpisodeHref } from "@/lib/content/podcasts";
import type { PodcastEpisode } from "@/types/content";
import styles from "./PodcastEpisodeCard.module.css";

interface PodcastEpisodeCardProps {
  episode: PodcastEpisode;
}

/* Bloco do episódio no estilo dos cards de artigo: fundo claro, numeral gigante translúcido e bloco inteiro clicável. */
export function PodcastEpisodeCard({ episode }: PodcastEpisodeCardProps) {
  const href = podcastEpisodeHref(episode);
  const hasAudio = Boolean(episode.audioUrl);

  return (
    <article className={styles.card}>
      <span className={styles.numeral} aria-hidden="true">
        {episode.number}
      </span>
      <p className={styles.eyebrow}>
        <Mic aria-hidden="true" />
        Episódio {episode.number}
      </p>
      <h3 className={styles.title}>
        <Link href={href} className={styles.link}>
          {episode.title}
        </Link>
      </h3>
      <p className={styles.summary}>{episode.summary}</p>
      <div className={styles.footer}>
        {hasAudio ? (
          <span className={styles.audioBadge}>
            <Headphones aria-hidden="true" size={15} />
            Áudio disponível
          </span>
        ) : episode.simulated ? (
          <span className="pending">Episódio de exemplo</span>
        ) : null}
        <LinkArrow href={href} decorative className={styles.more}>
          {hasAudio ? "Ouvir episódio" : "Ver roteiro"}
        </LinkArrow>
      </div>
    </article>
  );
}
