"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleAlert } from "lucide-react";
import { saveLessonNote } from "@/app/area-do-aluno/lesson-actions";
import { TextAreaField } from "@/components/ui/Field";
import { NOTE_MAX_LENGTH } from "@/lib/lesson-notes";
import styles from "./LessonNotes.module.css";

interface LessonNotesProps {
  courseSlug: string;
  /** Código da aula no roteiro oficial (ex.: "M01_A02"). */
  lessonCode: string;
  initialBody: string;
  /** Com login real, salva no banco; na demonstração o texto fica só nesta tela. */
  persist: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/* Pausa na digitação antes de salvar sozinho. Sair do campo salva na hora. */
const SAVE_DELAY_MS = 800;
const SAVE_ERROR = "Não foi possível salvar a anotação. Tente novamente.";

/* Anotação da aula com salvamento automático. Um salvamento por vez: se o texto mudou enquanto o servidor respondia,
   salva de novo em seguida, então uma resposta antiga nunca passa por cima de um texto mais novo. Use com key={aula}
   para cada aula começar do próprio texto. */
export function LessonNotes({ courseSlug, lessonCode, initialBody, persist }: LessonNotesProps) {
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState(SAVE_ERROR);
  const latest = useRef(initialBody);
  const saved = useRef(initialBody);
  const saving = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (!persist || saving.current) return;
    saving.current = true;
    try {
      while (latest.current !== saved.current) {
        const sending = latest.current;
        setStatus("saving");
        const result = await saveLessonNote(courseSlug, lessonCode, sending).catch(() => ({
          ok: false,
          error: SAVE_ERROR,
        }));
        if (!result.ok) {
          setError(result.error ?? SAVE_ERROR);
          setStatus("error");
          return;
        }
        saved.current = sending;
      }
      setStatus((current) => (current === "saving" ? "saved" : current));
    } finally {
      saving.current = false;
    }
  }, [courseSlug, lessonCode, persist]);

  /* Saiu da aula pelo menu (navegação sem recarregar): salva o que faltou. */
  useEffect(() => () => void flush(), [flush]);

  /* Fechar ou recarregar a aba com texto ainda não salvo: o navegador pede confirmação. */
  useEffect(() => {
    if (!persist) return;
    function warn(event: BeforeUnloadEvent) {
      if (latest.current !== saved.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [persist]);

  function handleChange(value: string) {
    setBody(value);
    latest.current = value;
    if (!persist) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), SAVE_DELAY_MS);
  }

  const message = !persist
    ? "Na demonstração, as anotações não são salvas."
    : status === "saving"
      ? "Salvando…"
      : status === "saved"
        ? "Anotação salva."
        : status === "error"
          ? error
          : "Suas anotações desta aula são salvas automaticamente.";

  return (
    <div className={styles.notes}>
      <TextAreaField
        id={`anotacao-${lessonCode}`}
        label="Suas anotações"
        rows={8}
        maxLength={NOTE_MAX_LENGTH}
        value={body}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => void flush()}
      />
      <p className={styles.status} role="status" data-error={status === "error" ? "" : undefined}>
        {status === "error" && <CircleAlert aria-hidden="true" />}
        {message}
      </p>
    </div>
  );
}
