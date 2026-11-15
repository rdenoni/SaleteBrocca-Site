import type { ReactElement } from "react";
import { GraduationCap, HeartHandshake, Puzzle, Stethoscope } from "lucide-react";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { Activity, ActivityIcon, ActivityTone } from "@/types/content";
import styles from "./ActivityGrid.module.css";

const ICONS: Record<ActivityIcon, ReactElement> = {
  clinic: <Stethoscope aria-hidden="true" />,
  institution: <HeartHandshake aria-hidden="true" />,
  courses: <GraduationCap aria-hidden="true" />,
  games: <Puzzle aria-hidden="true" />,
};

const DARK_TONES: ReadonlySet<ActivityTone> = new Set(["blue", "navy"]);

interface ActivityGridProps {
  activities: readonly Activity[];
}

/* Blocos de cor da referência (claro, ciano, azul, navy) para as frentes de atuação. */
export function ActivityGrid({ activities }: ActivityGridProps) {
  return (
    <ul className={styles.grid}>
      {activities.map((activity) => {
        const dark = DARK_TONES.has(activity.tone);
        return (
          <li
            key={activity.title}
            className={styles.card}
            data-tone={activity.tone}
            data-surface={dark ? "dark" : undefined}
          >
            <span className={styles.icon}>{ICONS[activity.icon]}</span>
            <h3 className={styles.title}>{activity.title}</h3>
            <p className={styles.text}>{activity.text}</p>
            {activity.pending && <span className={`pending ${styles.pending}`}>{activity.pending}</span>}
            {activity.href && (
              <LinkArrow href={activity.href} tone={dark ? "inverse" : "default"}>
                Ver cursos
              </LinkArrow>
            )}
          </li>
        );
      })}
    </ul>
  );
}
