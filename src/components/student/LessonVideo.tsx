"use client";

/* Versão "lazy": o código do player (pesado) carrega à parte, sem atrasar a página nem as entradas. */
import MuxPlayer from "@mux/mux-player-react/lazy";
import type { LessonPlayback } from "@/lib/mux/lesson-playback";

interface LessonVideoProps {
  playback: LessonPlayback;
  title: string;
  className?: string;
}

/* Vídeo da aula na Mux (reprodução assinada): os tokens chegam prontos do servidor, que já conferiu a matrícula. */
export function LessonVideo({ playback, title, className }: LessonVideoProps) {
  return (
    <MuxPlayer
      className={className}
      playbackId={playback.playbackId}
      tokens={playback.tokens}
      streamType="on-demand"
      metadata={{ video_title: title }}
      videoTitle={title}
    />
  );
}
