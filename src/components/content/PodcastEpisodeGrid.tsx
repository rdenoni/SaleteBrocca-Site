import type { PodcastEpisode } from "@/types/content";
import { PodcastEpisodeCard } from "./PodcastEpisodeCard";
import styles from "./PodcastEpisodeGrid.module.css";

interface PodcastEpisodeGridProps {
  episodes: readonly PodcastEpisode[];
}

export function PodcastEpisodeGrid({ episodes }: PodcastEpisodeGridProps) {
  return (
    <ul className={styles.grid}>
      {episodes.map((episode) => (
        <li key={episode.slug}>
          <PodcastEpisodeCard episode={episode} />
        </li>
      ))}
    </ul>
  );
}
