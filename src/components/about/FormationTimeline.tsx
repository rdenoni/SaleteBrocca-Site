import { BadgeCheck } from "lucide-react";
import type { FormationItem } from "@/types/content";
import styles from "./FormationTimeline.module.css";

interface FormationTimelineProps {
  items: readonly FormationItem[];
  /** Registro profissional; null mostra "A confirmar". */
  crfa: string | null;
}

/* Linha do tempo da formação: horizontal no desktop, vertical no mobile. */
export function FormationTimeline({ items, crfa }: FormationTimelineProps) {
  return (
    <div className={styles.wrap}>
      <ol className={styles.timeline}>
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.year}>{item.year ?? <span className="pending">Ano a confirmar</span>}</span>
            <span className={styles.dot} aria-hidden="true" />
            <p className={styles.title}>{item.title}</p>
          </li>
        ))}
      </ol>

      <p className={styles.register}>
        <BadgeCheck aria-hidden="true" />
        <span>Registro profissional</span>
        {crfa ? <strong>{crfa}</strong> : <span className="pending">CRFa a confirmar</span>}
      </p>
    </div>
  );
}
