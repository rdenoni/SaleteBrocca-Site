import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Json, LeadSource } from "@/types/database";

const VALID_SOURCES: readonly LeadSource[] = ["avaliacao", "contato", "checkout", "manual"];

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
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
    return NextResponse.json({ error: "Informe nome e pelo menos e-mail ou WhatsApp." }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ ok: true, mode: "demo" });
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
    return NextResponse.json({ error: "Não foi possível registrar o lead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
