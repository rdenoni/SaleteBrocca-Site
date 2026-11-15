import { Circle, CircleCheck, CirclePlay, type LucideIcon } from "lucide-react";
import type { LessonStatus } from "@/types/content";
import styles from "./LessonStatusBadge.module.css";

const STATUS: Record<LessonStatus, { label: string; Icon: LucideIcon }> = {
  completed: { label: "Concluída", Icon: CircleCheck },
  "in-progress": { label: "Em andamento", Icon: CirclePlay },
  "not-started": { label: "A assistir", Icon: Circle },
};

interface LessonStatusBadgeProps {
  status: LessonStatus;
  /** Só o ícone na tela; a palavra continua para leitores de tela. */
  compact?: boolean;
}

/* Estado sempre com ícone + palavra (nunca só cor). */
export function LessonStatusBadge({ status, compact = false }: LessonStatusBadgeProps) {
  const { label, Icon } = STATUS[status];
  return (
    <span className={styles.badge} data-status={status}>
      <Icon aria-hidden="true" />
      <span className={compact ? "visually-hidden" : undefined}>{label}</span>
    </span>
  );
}
