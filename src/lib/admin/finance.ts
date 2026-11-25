import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Json, TransactionPlatform, TransactionStatus } from "@/types/database";

export interface FinanceTransactionRow {
  id: string;
  platform: TransactionPlatform;
  orderId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  grossCents: number;
  feeCents: number;
  netCents: number;
  status: TransactionStatus;
  refundReason: string | null;
  occurredAt: string;
}

export interface FinanceWebhookLog {
  id: string;
  platform: "kiwify" | "hotmart";
  orderId: string;
  eventType: string;
  orderStatus: string | null;
  receivedAt: string;
  error: string | null;
  payload: Json;
}

export interface AdminFinanceSnapshot {
  mode: "live" | "demo";
  kiwifyConfigured: boolean;
  hotmartConfigured: boolean;
  kpis: {
    grossRevenueCents: number;
    netRevenueCents: number;
    activeLicenses: number;
    pendingCount: number;
    expiredCount: number;
    refundCount: number;
    chargebackCount: number;
  };
  transactions: readonly FinanceTransactionRow[];
  refundAudit: readonly FinanceTransactionRow[];
  webhookLogs: readonly FinanceWebhookLog[];
}

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getAdminFinanceSnapshot(): Promise<AdminFinanceSnapshot> {
  const kiwifyConfigured = Boolean(process.env.KIWIFY_WEBHOOK_TOKEN?.trim());
  const hotmartConfigured = Boolean(process.env.HOTMART_WEBHOOK_TOKEN?.trim());

  if (!hasServerDb()) {
    return {
      mode: "demo",
      kiwifyConfigured,
      hotmartConfigured,
      kpis: {
        grossRevenueCents: 0,
        netRevenueCents: 0,
        activeLicenses: 0,
        pendingCount: 0,
        expiredCount: 0,
        refundCount: 0,
        chargebackCount: 0,
      },
      transactions: [],
      refundAudit: [],
      webhookLogs: [],
    };
  }

  const admin = createSupabaseAdminClient();
  const [txRes, enrollRes, kiwifyRes, hotmartRes] = await Promise.all([
    admin.from("transactions").select("*").order("occurred_at", { ascending: false }).limit(200),
    admin.from("enrollments").select("status, expires_at"),
    admin.from("kiwify_events").select("*").order("received_at", { ascending: false }).limit(40),
    admin.from("hotmart_events").select("*").order("received_at", { ascending: false }).limit(40),
  ]);

  const transactions: FinanceTransactionRow[] = (txRes.data ?? []).map((row) => ({
    id: row.id,
    platform: row.platform,
    orderId: row.order_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    productName: row.product_name,
    grossCents: row.gross_amount_cents,
    feeCents: row.fee_amount_cents,
    netCents: row.net_amount_cents,
    status: row.status,
    refundReason: row.refund_reason,
    occurredAt: row.occurred_at,
  }));

  const paid = transactions.filter((t) => t.status === "paid");
  const grossRevenueCents = paid.reduce((sum, t) => sum + t.grossCents, 0);
  const netRevenueCents = paid.reduce((sum, t) => sum + t.netCents, 0);
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const refundAudit = transactions.filter((t) => t.status === "refunded" || t.status === "chargeback");
  const refundCount = transactions.filter((t) => t.status === "refunded").length;
  const chargebackCount = transactions.filter((t) => t.status === "chargeback").length;

  const now = Date.now();
  const enrollments = enrollRes.data ?? [];
  const activeLicenses = enrollments.filter(
    (e) => e.status === "active" && (!e.expires_at || new Date(e.expires_at).getTime() >= now),
  ).length;
  const expiredCount = enrollments.filter(
    (e) => e.status === "active" && e.expires_at && new Date(e.expires_at).getTime() < now,
  ).length;

  const webhookLogs: FinanceWebhookLog[] = [
    ...(kiwifyRes.data ?? []).map((row) => ({
      id: `kiwify-${row.id}`,
      platform: "kiwify" as const,
      orderId: row.order_id,
      eventType: row.event_type,
      orderStatus: row.order_status,
      receivedAt: row.received_at,
      error: row.error,
      payload: row.payload,
    })),
    ...(hotmartRes.data ?? []).map((row) => ({
      id: `hotmart-${row.id}`,
      platform: "hotmart" as const,
      orderId: row.transaction_id,
      eventType: row.event_type,
      orderStatus: row.order_status,
      receivedAt: row.received_at,
      error: row.error,
      payload: row.payload,
    })),
  ].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  return {
    mode: "live",
    kiwifyConfigured,
    hotmartConfigured,
    kpis: {
      grossRevenueCents,
      netRevenueCents,
      activeLicenses,
      pendingCount,
      expiredCount,
      refundCount,
      chargebackCount,
    },
    transactions,
    refundAudit,
    webhookLogs,
  };
}
