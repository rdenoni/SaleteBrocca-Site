import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function safeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const expectedToken = process.env.ADMIN_EMAIL_INBOUND_TOKEN?.trim();
  if (expectedToken) {
    const token = request.headers.get("x-inbound-token")?.trim() ?? "";
    if (!token || !safeMatch(token, expectedToken)) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const fromEmail = String(body.from ?? body.from_email ?? "").trim();
  const toEmail = String(body.to ?? body.to_email ?? process.env.ADMIN_FROM_EMAIL ?? "contato@saletebrocca.com").trim();
  const subject = String(body.subject ?? "(sem assunto)").trim().slice(0, 200);
  const bodyText = String(body.text ?? body.body_text ?? "").trim().slice(0, 20000);
  const threadId = String(body.thread_id ?? `${fromEmail.toLowerCase()}::${subject.toLowerCase()}`).slice(0, 180);

  if (!fromEmail || !bodyText) {
    return NextResponse.json({ error: "Remetente e corpo são obrigatórios." }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("admin_emails").insert({
    thread_id: threadId,
    direction: "inbound",
    from_email: fromEmail,
    to_email: toEmail,
    subject,
    body_text: bodyText,
    status: "unread",
    external_id: body.id ? String(body.id) : null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
