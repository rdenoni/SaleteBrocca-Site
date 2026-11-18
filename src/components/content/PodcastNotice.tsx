import { Info } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./PodcastNotice.module.css";

interface PodcastNoticeProps {
  children: ReactNode;
}

/* Aviso discreto (role="note"): mesmo tom do aviso de "Conteúdo de exemplo" da biblioteca. */
export function PodcastNotice({ children }: PodcastNoticeProps) {
  return (
    <p className={styles.note} role="note">
      <Info aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
