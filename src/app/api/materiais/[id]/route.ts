import { NextResponse } from "next/server";
import { loginPathWithNext } from "@/lib/auth-paths";
import { getMaterialDownload, type MaterialDownloadDenial } from "@/lib/content/material-download";

/* Download protegido de um material (PDF): confere o acesso e redireciona para uma URL assinada de 60 s. Por aluno e
   por pedido: nunca em cache. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = { "Cache-Control": "private, no-store" } as const;
const MATERIALS_PATH = "/area-do-aluno/materiais";

const DENIAL: Readonly<Record<Exclude<MaterialDownloadDenial, "unauthenticated">, { status: number; text: string }>> = {
  "not-found": { status: 404, text: "Material não encontrado" },
  "not-configured": { status: 503, text: "Download indisponível no momento" },
  "not-enrolled": { status: 403, text: "Sem matrícula ativa neste curso" },
  unavailable: { status: 404, text: "Material ainda não disponível" },
};

interface MaterialRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: MaterialRouteContext) {
  const { id } = await params;
  const result = await getMaterialDownload(id);
  if (result.ok) return NextResponse.redirect(result.url, { status: 302, headers: HEADERS });
  if (result.reason === "unauthenticated") {
    return NextResponse.redirect(new URL(loginPathWithNext(MATERIALS_PATH), request.url), { status: 303, headers: HEADERS });
  }
  const { status, text } = DENIAL[result.reason];
  return new NextResponse(text, { status, headers: { ...HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
}
