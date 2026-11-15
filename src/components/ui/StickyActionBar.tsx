import type { ReactNode } from "react";
import styles from "./StickyActionBar.module.css";

interface StickyActionBarProps {
  children: ReactNode;
}

/* Mobile e tablet: ação principal sempre ao alcance do polegar. Some a partir de 1100px. */
export function StickyActionBar({ children }: StickyActionBarProps) {
  return <div className={styles.bar}>{children}</div>;
}
