"use client";

import { useState, useTransition } from "react";
import { Circle, CircleAlert, CircleCheck } from "lucide-react";
import { setLessonCompleted } from "@/app/area-do-aluno/lesson-actions";
import { Spinner } from "@/components/ui/Spinner";
import { AnimatedCheck } from "@/motion/icons";
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
  /* O traço do check só desenha depois de um clique: ao abrir a aula já concluída o ícone vem parado
     (o AnimatedCheck anima ao montar, sem esperar a entrada da página). */
  const [touched, setTouched] = useState(false);
  const [pending, startTransition] = useTransition();
  const icon = !completed ? <Circle aria-hidden="true" /> : touched ? <AnimatedCheck size={18} /> : <CircleCheck aria-hidden="true" />;

  function toggle() {
    const next = !completed;
    setTouched(true);
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
        {icon}
        <span>Marcar como concluída</span>
        {pending ? <Spinner size={14} /> : null}
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
