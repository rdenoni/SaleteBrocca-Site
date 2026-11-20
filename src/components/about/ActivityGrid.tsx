import { Accessibility, GraduationCap, HandHeart, Puzzle, type LucideIcon } from "lucide-react";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import type { Activity, ActivityIcon } from "@/types/content";
import styles from "./ActivityGrid.module.css";

/* Ícones da biblioteca (docs/biblioteca/icons.json), Lucide traço 2, cor herdada do título. */
const ICONS: Record<ActivityIcon, LucideIcon> = {
  clinic: HandHeart,
  institution: Accessibility,
  courses: GraduationCap,
  games: Puzzle,
};

interface ActivityGridProps {
  activities: readonly Activity[];
}

/* Lista editorial das frentes de atuação: duas colunas separadas por filetes finos,
   com uma única marca ciano no topo de cada item. Os itens sobem em cascata ao entrar na tela.
   `pending` (ex.: cidade) fica só nos dados como registro da pendência; não é exibido.
   Quando a cliente confirmar, o dado entra no texto. */
export function ActivityGrid({ activities }: ActivityGridProps) {
  return (
    <Stagger as="ul" pace="items" className={styles.list}>
      {activities.map((activity) => {
        const Icon = ICONS[activity.icon];
        return (
          <StaggerItem as="li" key={activity.title} className={styles.item}>
            <Icon className={styles.icon} size={32} aria-hidden="true" />
            <h3 className={styles.title}>{activity.title}</h3>
            <p className={styles.text}>{activity.text}</p>
            {activity.href && <LinkArrow href={activity.href}>Ver cursos</LinkArrow>}
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
