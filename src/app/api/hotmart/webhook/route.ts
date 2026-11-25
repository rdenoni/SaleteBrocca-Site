import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getRuntimeSecret } from "@/lib/admin/secrets";
import { checkRateLimit, extractClientIp } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { EnrollmentStatus, Json, TransactionStatus } from "@/types/database";

const MAX_BODY_BYTES = 256 * 1024;
const NO_STORE = { "Cache-Control": "no-store" } as const;

function safeTokenMatch(received: string, expected: string): boolean {
  const a = Buffer.from(received, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function mapHotmartEvent(event: string): { txStatus: TransactionStatus; enrollStatus?: EnrollmentStatus } {
  switch (event) {
    case "PURCHASE_APPROVED":
    case "PURCHASE_COMPLETE":
      return { txStatus: "paid", enrollStatus: "active" };
    case "PURCHASE_REFUNDED":
      return { txStatus: "refunded", enrollStatus: "refunded" };
    case "PURCHASE_CHARGEBACK":
      return { txStatus: "chargeback", enrollStatus: "chargeback" };
    case "PURCHASE_CANCELED":
    case "SUBSCRIPTION_CANCELLATION":
      return { txStatus: "canceled", enrollStatus: "canceled" };
    default:
      return { txStatus: "pending" };
  }
}

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);
  const rl = checkRateLimit(`webhook-hotmart:${ip}`, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const expectedToken = await getRuntimeSecret("HOTMART_WEBHOOK_TOKEN");
  if (!expectedToken) {
    return NextResponse.json({ error: "Serviço indisponível." }, { status: 503, headers: NO_STORE });
  }

  const receivedToken = request.headers.get("x-hotmart-hottok")?.trim() ?? "";
  if (!receivedToken || !safeTokenMatch(receivedToken, expectedToken)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers: NO_STORE });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload excede o limite de 256 KB." }, { status: 413 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload excede o limite de 256 KB." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ error: "Supabase não configurado no servidor." }, { status: 503 });
  }

  const eventType = String(body.event ?? "UNKNOWN").toUpperCase();
  const data = (body.data ?? {}) as Record<string, unknown>;
  const purchase = (data.purchase ?? {}) as Record<string, unknown>;
  const buyer = (data.buyer ?? {}) as Record<string, unknown>;
  const product = (data.product ?? {}) as Record<string, unknown>;
  const price = (purchase.price ?? {}) as Record<string, unknown>;
  const commissions = Array.isArray(data.commissions) ? (data.commissions as Record<string, unknown>[]) : [];

  const transactionId = String(purchase.transaction ?? body.id ?? `hm-${Date.now()}`).trim();
  const customerEmail = String(buyer.email ?? "").trim().toLowerCase();
  const customerName = String(buyer.name ?? "").trim();
  const productName = String(product.name ?? "Curso Hotmart").trim();
  const orderStatus = String(purchase.status ?? eventType).toLowerCase();

  const grossValue = Number(price.value ?? 0) || 0;
  const grossCents = Math.round(grossValue * 100);
  const producerCommission = commissions.find((c) => String(c.source ?? "").toUpperCase() === "PRODUCER");
  const netValue = Number(producerCommission?.value ?? grossValue) || grossValue;
  const netCents = Math.round(netValue * 100);
  const feeCents = Math.max(0, grossCents - netCents);

  const admin = createSupabaseAdminClient();

  await admin.from("hotmart_events").upsert(
    {
      transaction_id: transactionId,
      event_type: eventType,
      order_status: orderStatus,
      payload: body as Json,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "transaction_id,event_type" },
  );

  const { txStatus, enrollStatus } = mapHotmartEvent(eventType);

  if (customerEmail) {
    await admin.from("transactions").upsert(
      {
        platform: "hotmart",
        order_id: transactionId,
        customer_name: customerName,
        customer_email: customerEmail,
        product_name: productName,
        course_slug: "dificuldades-na-aprendizagem",
        gross_amount_cents: grossCents,
        fee_amount_cents: feeCents,
        net_amount_cents: netCents,
        currency: String(price.currency_value ?? "BRL"),
        status: txStatus,
        refund_reason: txStatus === "refunded" || txStatus === "chargeback" ? eventType : null,
        occurred_at: new Date().toISOString(),
      },
      { onConflict: "platform,order_id" },
    );

    if (enrollStatus) {
      await admin.from("enrollments").upsert(
        {
          email: customerEmail,
          course_slug: "dificuldades-na-aprendizagem",
          status: enrollStatus,
          source: "hotmart",
          order_id: transactionId,
          product_id: product.id ? String(product.id) : null,
        },
        { onConflict: "source,order_id,course_slug" },
      );
    }
  }

  return NextResponse.json({ ok: true, transactionId, eventType });
}
