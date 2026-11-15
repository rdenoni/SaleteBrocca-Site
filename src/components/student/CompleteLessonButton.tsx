"use client";

import { useState } from "react";
import { Circle, CircleCheck } from "lucide-react";
import styles from "./CompleteLessonButton.module.css";

interface CompleteLessonButtonProps {
  initialCompleted: boolean;
}

/* Alterna o estado só nesta tela: o progresso será salvo quando a Área do Aluno tiver banco de dados.
   Rótulo fixo + aria-pressed (o leitor de tela anuncia "pressionado"). */
export function CompleteLessonButton({ initialCompleted }: CompleteLessonButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const Icon = completed ? CircleCheck : Circle;

  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={completed}
      onClick={() => setCompleted((value) => !value)}
    >
      <Icon aria-hidden="true" />
      Marcar como concluída
    </button>
  );
}
