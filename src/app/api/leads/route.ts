import { NextResponse } from "next/server";
import { checkRateLimit, extractClientIp, isIpBlocked } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Json, LeadSource } from "@/types/database";

const VALID_SOURCES: readonly LeadSource[] = ["avaliacao", "contato", "checkout", "manual"];
const MAX_BODY_BYTES = 16 * 1024;
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);
  if (await isIpBlocked(ip)) {
    return NextResponse.json({ error: "Acesso bloqueado." }, { status: 403, headers: NO_STORE });
  }

  const rl = checkRateLimit(`leads:${ip}`, 10, 5 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload excede o limite permitido." }, { status: 413, headers: NO_STORE });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload excede o limite permitido." }, { status: 413, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400, headers: NO_STORE });
  }

  /* Honeypot silencioso contra bots automatizados. */
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
  const whatsapp = String(body.whatsapp ?? "").trim().slice(0, 40);
  const notes = String(body.notes ?? "").trim().slice(0, 1000);
  const rawSource = String(body.source ?? "contato").trim() as LeadSource;
  const source: LeadSource = VALID_SOURCES.includes(rawSource) ? rawSource : "contato";
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 10)
    : [source];
  const utm = body.utm && typeof body.utm === "object" ? (body.utm as Json) : {};

  if (!name || (!email && !whatsapp)) {
    return NextResponse.json(
      { error: "Informe nome e pelo menos e-mail ou WhatsApp." },
      { status: 400, headers: NO_STORE },
    );
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ ok: true, mode: "demo" }, { headers: NO_STORE });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("leads").insert({
    name,
    email,
    whatsapp,
    source,
    status: "new",
    tags,
    utm,
    notes,
  });

  if (error) {
    return NextResponse.json({ error: "Não foi possível registrar o lead." }, { status: 500, headers: NO_STORE });
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
