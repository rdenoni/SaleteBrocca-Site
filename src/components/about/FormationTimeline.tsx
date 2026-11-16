import { BadgeCheck } from "lucide-react";
import type { FormationItem } from "@/types/content";
import styles from "./FormationTimeline.module.css";

interface FormationTimelineProps {
  items: readonly FormationItem[];
  /** Registro profissional; null oculta o registro até a cliente confirmar. */
  crfa: string | null;
}

/* Linha do tempo da formação: horizontal no desktop, vertical no mobile. */
export function FormationTimeline({ items, crfa }: FormationTimelineProps) {
  return (
    <div className={styles.wrap}>
      <ol className={styles.timeline}>
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            {/* Sem ano confirmado o espaço fica reservado, só para os pontos seguirem alinhados. */}
            <span className={styles.year} aria-hidden={item.year ? undefined : true}>
              {item.year}
            </span>
            <span className={styles.dot} aria-hidden="true" />
            <p className={styles.title}>{item.title}</p>
          </li>
        ))}
      </ol>

      {crfa && (
        <p className={styles.register}>
          <BadgeCheck aria-hidden="true" />
          <span>Registro profissional</span>
          <strong>{crfa}</strong>
        </p>
      )}
    </div>
  );
}
