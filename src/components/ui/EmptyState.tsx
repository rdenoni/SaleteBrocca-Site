import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  text: string;
  /** Ação opcional (link ou botão). */
  children?: ReactNode;
}

/* Estado vazio honesto: diz o que ainda não existe, sem inventar conteúdo. */
export function EmptyState({ icon, title, text, children }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <p className={styles.title}>{title}</p>
      <p className={styles.text}>{text}</p>
      {children}
    </div>
  );
}
