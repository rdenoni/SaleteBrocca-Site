import { LinkArrow } from "@/components/ui/LinkArrow";
import type { Activity } from "@/types/content";
import styles from "./ActivityGrid.module.css";

interface ActivityGridProps {
  activities: readonly Activity[];
}

/* Lista editorial das frentes de atuação: duas colunas separadas por filetes finos,
   com uma única marca ciano no topo de cada item. `pending` (ex.: cidade) fica só nos dados
   como registro da pendência; não é exibido. Quando a cliente confirmar, o dado entra no texto. */
export function ActivityGrid({ activities }: ActivityGridProps) {
  return (
    <ul className={styles.list}>
      {activities.map((activity) => (
        <li key={activity.title} className={styles.item}>
          <h3 className={styles.title}>{activity.title}</h3>
          <p className={styles.text}>{activity.text}</p>
          {activity.href && <LinkArrow href={activity.href}>Ver cursos</LinkArrow>}
        </li>
      ))}
    </ul>
  );
}
