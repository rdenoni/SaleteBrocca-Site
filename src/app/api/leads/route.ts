import { NextResponse } from "next/server";
import { getRuntimeSecrets } from "@/lib/admin/secrets";
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

  /* Também registra uma mensagem na caixa de entrada do Painel Admin (/admin/emails) para pedidos de avaliação e contato. */
  if (source === "avaliacao" || source === "contato") {
    try {
      const runtime = await getRuntimeSecrets(["ADMIN_FROM_EMAIL", "RESEND_API_KEY"]);
      const toEmail = runtime.ADMIN_FROM_EMAIL || "contato@saletebrocca.com";
      const fromEmail = email || `${name} (${whatsapp})`;
      const subject =
        source === "avaliacao"
          ? `Novo pedido de avaliação — ${name}`
          : `Nova mensagem de contato — ${name}`;
      const bodyLines = [
        source === "avaliacao" ? "Novo pedido de avaliação recebido pelo site." : "Nova mensagem enviada pelo formulário de contato.",
        "",
        `Nome: ${name}`,
        whatsapp ? `Telefone / WhatsApp: ${whatsapp}` : null,
        email ? `E-mail: ${email}` : null,
        `Origem: ${tags.join(", ") || source}`,
        notes ? `\nDetalhes:\n${notes}` : null,
      ].filter((line): line is string => line !== null);
      const bodyText = bodyLines.join("\n").slice(0, 20000);
      const threadId = `lead:${source}:${(email || whatsapp || name).toLowerCase()}`.slice(0, 180);

      await admin.from("admin_emails").insert({
        thread_id: threadId,
        direction: "inbound",
        from_email: fromEmail.slice(0, 200),
        to_email: toEmail,
        subject: subject.slice(0, 200),
        body_text: bodyText,
        status: "unread",
        external_id: null,
      });

      /* Se a API da Resend estiver configurada, dispara também o alerta por e-mail sem bloquear a resposta. */
      if (runtime.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${runtime.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Site Salete Brocca <${toEmail}>`,
            to: [toEmail],
            reply_to: email || undefined,
            subject: subject.slice(0, 200),
            text: bodyText,
          }),
        }).catch(() => null);
      }
    } catch {
      /* Não falha o envio do usuário caso o registro secundário de e-mail oscile. */
    }
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
