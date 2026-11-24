"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { MotionPace, STUDENT_PACE } from "@/motion/MotionPace";

const STORAGE_KEY = "salete-brocca:lesson-entrance-seen";
/* Tempo suficiente para a primeira entrada da aula concluir em ritmo STUDENT_PACE (0,4). */
const COMPLETE_MS = 900;
/* Ignora a desmontagem imediata do Strict Mode em desenvolvimento (< 100 ms). */
const MIN_REAL_MOUNT_MS = 100;

function emptySubscribe(): () => void {
  return () => {};
}

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSeen(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* Navegação privada ou armazenamento bloqueado: ignora sem falhar. */
  }
}

function serverSnapshot(): boolean {
  return false;
}

interface LessonEntranceOnceProps {
  pace?: number;
  children: ReactNode;
}

/* Executa a animação de entrada na área de aulas em vídeo uma única vez por usuário (persistida em localStorage).
   Nas trocas de aula seguintes ou ao recarregar o site, pace=0 pula apenas as entradas (Reveal, Stagger, TextReveal,
   DrawRule), mantendo todas as micro-animações de botões, abas e interações intactas. */
export function LessonEntranceOnce({ pace = STUDENT_PACE, children }: LessonEntranceOnceProps) {
  const alreadySeen = useSyncExternalStore(emptySubscribe, readSeen, serverSnapshot);

  useEffect(() => {
    if (alreadySeen) return;
    const mountedAt = Date.now();
    const timer = window.setTimeout(writeSeen, COMPLETE_MS);
    return () => {
      window.clearTimeout(timer);
      if (Date.now() - mountedAt >= MIN_REAL_MOUNT_MS) {
        writeSeen();
      }
    };
  }, [alreadySeen]);

  return <MotionPace pace={alreadySeen ? 0 : pace}>{children}</MotionPace>;
}
