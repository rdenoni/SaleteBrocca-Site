"use client";

import { useState, useTransition } from "react";
import { Circle, CircleAlert, CircleCheck } from "lucide-react";
import { setLessonCompleted } from "@/app/area-do-aluno/lesson-actions";
import styles from "./CompleteLessonButton.module.css";

interface CompleteLessonButtonProps {
  courseSlug: string;
  /** Código da aula no roteiro oficial (ex.: "M01_A02"). */
  lessonCode: string;
  initialCompleted: boolean;
  /** Com login real, salva no banco; na demonstração só alterna nesta tela. */
  persist: boolean;
}

/* Marca a aula como concluída. Otimista: o estado muda na hora e volta atrás, com aviso, se o servidor recusar.
   Rótulo fixo + aria-pressed (o leitor de tela anuncia "pressionado"). */
export function CompleteLessonButton({ courseSlug, lessonCode, initialCompleted, persist }: CompleteLessonButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const Icon = completed ? CircleCheck : Circle;

  function toggle() {
    const next = !completed;
    setCompleted(next);
    setError(undefined);
    if (!persist) return;
    startTransition(async () => {
      try {
        const result = await setLessonCompleted(courseSlug, lessonCode, next);
        if (!result.ok) {
          setCompleted(!next);
          setError(result.error);
        }
      } catch {
        setCompleted(!next);
        setError("Não foi possível salvar o progresso. Tente novamente.");
      }
    });
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} aria-pressed={completed} disabled={pending} onClick={toggle}>
        <Icon aria-hidden="true" />
        Marcar como concluída
      </button>
      <p className={styles.error} role="alert">
        {error && (
          <>
            <CircleAlert aria-hidden="true" />
            {error}
          </>
        )}
      </p>
    </div>
  );
}
