import { Play } from "lucide-react";
import styles from "./PodcastPlayer.module.css";

interface PodcastPlayerProps {
  /** URL do áudio; null enquanto o episódio não foi gravado (mostra o espaço reservado desativado). */
  audioUrl: string | null;
  /** Título do episódio, para o nome acessível do player. */
  title: string;
}

export function PodcastPlayer({ audioUrl, title }: PodcastPlayerProps) {
  if (audioUrl) {
    return (
      <div className={styles.player} data-surface="dark">
        <audio className={styles.audio} controls preload="none" src={audioUrl} aria-label={`Áudio: ${title}`}>
          Seu navegador não reproduz áudio. Use o roteiro abaixo.
        </audio>
      </div>
    );
  }

  return (
    <div className={styles.player} data-surface="dark" role="group" aria-label="Player do episódio">
      {/* Botão apenas ilustrativo: aria-disabled mantém o botão anunciável e sem ação. */}
      <button type="button" className={styles.play} aria-disabled="true" aria-describedby="player-status">
        <Play aria-hidden="true" />
        <span className="visually-hidden">Reproduzir</span>
      </button>
      <div className={styles.info}>
        <p id="player-status" className={styles.status}>
          Áudio em produção
        </p>
        <span className={styles.track} aria-hidden="true" />
      </div>
    </div>
  );
}
