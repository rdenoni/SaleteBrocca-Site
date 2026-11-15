import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  percent: number;
  /** Nome acessível (ex.: "Progresso no curso"). */
  label: string;
  /** "dark" sobre fundos navy. */
  tone?: "light" | "dark";
  /** Sobre painel azul-claro: a trilha fica branca (cinza-claro some nesse fundo). */
  onTint?: boolean;
}

export function ProgressBar({ percent, label, tone = "light", onTint = false }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div
      className={styles.track}
      data-tone={tone}
      data-on-tint={onTint ? "" : undefined}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span className={styles.fill} style={{ width: `${value}%` }} />
    </div>
  );
}
