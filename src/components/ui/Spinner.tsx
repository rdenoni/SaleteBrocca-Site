import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/* Throbber leve para botões de ação e modais rápidos (usa currentColor para manter contraste WCAG). */
export function Spinner({ size = 16, strokeWidth = 2, className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.spinner, className ?? ""].filter(Boolean).join(" ")}
      style={{ width: size, height: size, borderWidth: strokeWidth }}
    />
  );
}
