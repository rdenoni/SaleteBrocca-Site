"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import {
  DEFAULT_SUBSCRIPTIONS,
  type CostBillingCycle,
  type CostCategory,
  type CostCurrency,
  type CostProbeKey,
  type CostStatus,
  type CostSubscription,
} from "@/lib/admin/costs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

const VALID_CATEGORIES: readonly CostCategory[] = [
  "hospedagem",
  "banco",
  "dominio_email",
  "video",
  "pagamentos",
  "ferramentas",
];
const VALID_CYCLES: readonly CostBillingCycle[] = ["mensal", "anual", "uso", "gratuito"];
const VALID_CURRENCIES: readonly CostCurrency[] = ["BRL", "USD"];
const VALID_STATUSES: readonly CostStatus[] = ["active", "free", "paused", "canceled"];
const VALID_PROBES: readonly CostProbeKey[] = ["netlify", "supabase", "domain_dns", "mux", "resend", "kiwify", "hotmart"];

interface StoredCostConfig {
  usdToBrl: number;
  subscriptions: CostSubscription[];
}

async function readCurrentConfig(): Promise<StoredCostConfig> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("site_settings").select("value").eq("key", "cost_center_config").maybeSingle();
  const parsed = (data?.value as Partial<StoredCostConfig> | null) ?? null;
  return {
    usdToBrl: typeof parsed?.usdToBrl === "number" && parsed.usdToBrl > 0 ? parsed.usdToBrl : 5.8,
    subscriptions:
      Array.isArray(parsed?.subscriptions) && parsed.subscriptions.length > 0
        ? parsed.subscriptions
        : [...DEFAULT_SUBSCRIPTIONS],
  };
}

function parseAmount(raw: string): number {
  const normalized = raw.replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export async function saveSubscriptionAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/custos");

  if (session.mode !== "live" || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para salvar assinaturas." };
  }

  const idRaw = String(formData.get("id") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim().slice(0, 80);
  const planName = String(formData.get("planName") ?? "").trim().slice(0, 100);
  const rawCategory = String(formData.get("category") ?? "ferramentas") as CostCategory;
  const rawCycle = String(formData.get("billingCycle") ?? "mensal") as CostBillingCycle;
  const rawCurrency = String(formData.get("currency") ?? "BRL") as CostCurrency;
  const rawStatus = String(formData.get("status") ?? "active") as CostStatus;
  const rawProbe = String(formData.get("probeKey") ?? "").trim() as CostProbeKey;
  const amount = parseAmount(String(formData.get("amount") ?? "0"));
  const renewalDate = String(formData.get("renewalDate") ?? "").trim().slice(0, 10);
  const portalUrl = String(formData.get("portalUrl") ?? "").trim().slice(0, 300);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 300);

  if (!service) {
    return { status: "error", message: "Informe o nome do serviço ou assinatura." };
  }

  const category: CostCategory = VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "ferramentas";
  const billingCycle: CostBillingCycle = VALID_CYCLES.includes(rawCycle) ? rawCycle : "mensal";
  const currency: CostCurrency = VALID_CURRENCIES.includes(rawCurrency) ? rawCurrency : "BRL";
  const status: CostStatus = VALID_STATUSES.includes(rawStatus) ? rawStatus : "active";
  const probeKey = VALID_PROBES.includes(rawProbe) ? rawProbe : undefined;

  const config = await readCurrentConfig();
  const id = idRaw || `sub-${Date.now().toString(36)}`;
  const nextItem: CostSubscription = {
    id,
    service,
    category,
    planName: planName || "Plano padrão",
    billingCycle,
    currency,
    amount,
    status,
    renewalDate: /^\d{4}-\d{2}-\d{2}$/.test(renewalDate) ? renewalDate : "",
    portalUrl: /^https?:\/\//i.test(portalUrl) ? portalUrl : "",
    notes,
    ...(probeKey ? { probeKey } : {}),
  };

  const exists = config.subscriptions.some((item) => item.id === id);
  const subscriptions = exists
    ? config.subscriptions.map((item) => (item.id === id ? nextItem : item))
    : [...config.subscriptions, nextItem];

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "cost_center_config",
      value: { usdToBrl: config.usdToBrl, subscriptions } as unknown as Json,
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: exists ? "cost_center.update_subscription" : "cost_center.create_subscription",
    targetType: "site_settings",
    targetId: id,
    metadata: { service, status, currency, amount },
  });

  revalidatePath("/admin/custos");
  revalidatePath("/admin");
  return { status: "ok", message: exists ? `Assinatura "${service}" atualizada.` : `Assinatura "${service}" adicionada.` };
}

export async function deleteSubscriptionAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/custos");
  const id = String(formData.get("id") ?? "").trim();

  if (!id) return { status: "error", message: "ID da assinatura inválido." };
  if (session.mode !== "live" || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para remover assinaturas." };
  }

  const config = await readCurrentConfig();
  const subscriptions = config.subscriptions.filter((item) => item.id !== id);

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "cost_center_config",
      value: { usdToBrl: config.usdToBrl, subscriptions } as unknown as Json,
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: "cost_center.delete_subscription",
    targetType: "site_settings",
    targetId: id,
  });

  revalidatePath("/admin/custos");
  return { status: "ok", message: "Assinatura removida do Centro de Custos." };
}

export async function saveExchangeRateAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/custos");
  const rate = parseAmount(String(formData.get("usdToBrl") ?? ""));

  if (rate <= 0 || rate > 100) {
    return { status: "error", message: "Informe uma cotação USD → BRL válida (ex.: 5,80)." };
  }

  if (session.mode !== "live" || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para salvar a cotação." };
  }

  const config = await readCurrentConfig();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "cost_center_config",
      value: { usdToBrl: rate, subscriptions: config.subscriptions } as unknown as Json,
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: "cost_center.update_exchange_rate",
    targetType: "site_settings",
    targetId: "usdToBrl",
    metadata: { usdToBrl: rate },
  });

  revalidatePath("/admin/custos");
  return { status: "ok", message: `Cotação atualizada para R$ ${rate.toFixed(2).replace(".", ",")}.` };
}
