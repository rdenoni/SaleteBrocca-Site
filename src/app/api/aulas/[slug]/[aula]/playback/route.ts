import { NextResponse } from "next/server";
import { getLessonPlayback, type LessonPlaybackDenial } from "@/lib/mux/lesson-playback";

/* Tokens de reprodução da aula (docs/10-GUIA-MUX.md, passo 6). Por aluno e por pedido: nunca em cache. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = { "Cache-Control": "private, no-store" } as const;

const DENIAL: Readonly<Record<LessonPlaybackDenial, { status: number; error: string }>> = {
  "not-found": { status: 404, error: "aula não encontrada" },
  "not-configured": { status: 503, error: "vídeo indisponível no momento" },
  unauthenticated: { status: 401, error: "faça login para assistir" },
  "not-enrolled": { status: 403, error: "sem matrícula ativa neste curso" },
  "no-video": { status: 404, error: "vídeo desta aula ainda não publicado" },
};

interface PlaybackRouteContext {
  params: Promise<{ slug: string; aula: string }>;
}

export async function GET(_request: Request, { params }: PlaybackRouteContext) {
  const { slug, aula } = await params;
  const result = await getLessonPlayback(slug, aula);
  if (!result.ok) {
    const { status, error } = DENIAL[result.reason];
    return NextResponse.json({ error }, { status, headers: HEADERS });
  }
  return NextResponse.json(result.playback, { headers: HEADERS });
}
