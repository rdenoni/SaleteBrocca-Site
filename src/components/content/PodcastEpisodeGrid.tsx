import { Stagger, StaggerItem } from "@/motion/Stagger";
import type { PodcastEpisode } from "@/types/content";
import { PodcastEpisodeCard } from "./PodcastEpisodeCard";
import styles from "./PodcastEpisodeGrid.module.css";

interface PodcastEpisodeGridProps {
  episodes: readonly PodcastEpisode[];
  /** Espera o título e o texto da seção. */
  delay?: number;
}

/* Os episódios sobem em cascata, da esquerda para a direita. */
export function PodcastEpisodeGrid({ episodes, delay = 0 }: PodcastEpisodeGridProps) {
  return (
    <Stagger as="ul" pace="cards" delay={delay} className={styles.grid}>
      {episodes.map((episode) => (
        <StaggerItem as="li" key={episode.slug}>
          <PodcastEpisodeCard episode={episode} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
