import { NextResponse } from "next/server";
import { getKiwifyWebhookTokens } from "@/lib/kiwify/config";
import { handleKiwifyWebhook, type KiwifyStore } from "@/lib/kiwify/handler";
import { resolveCourseSlugByProductId } from "@/lib/kiwify/product-map";
import { createSupabaseKiwifyStore } from "@/lib/kiwify/supabase-store";

/* Webhook da Kiwify (docs/08-VENDAS-KIWIFY.md). Nunca em cache, sem redirecionamento. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" } as const;

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

function notConfigured() {
  return json(503, { error: "webhook não configurado" });
}

function openStore(): KiwifyStore | null {
  try {
    return createSupabaseKiwifyStore();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const tokens = getKiwifyWebhookTokens();
  if (tokens.length === 0) return notConfigured();
  const store = openStore();
  if (!store) return notConfigured();

  const rawBody = await request.text();
  const signature = new URL(request.url).searchParams.get("signature");

  const result = await handleKiwifyWebhook(rawBody, signature, {
    tokens,
    store,
    resolveCourseSlug: resolveCourseSlugByProductId,
    log: (message, meta) => console.info(message, meta.orderId, meta.eventType),
  });
  return json(result.status, result.body);
}

function methodNotAllowed() {
  return json(405, { error: "método não permitido" }, { Allow: "POST" });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
