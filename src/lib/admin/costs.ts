import "server-only";
import { getRuntimeSecret } from "@/lib/admin/secrets";
import { getKiwifyWebhookTokens } from "@/lib/kiwify/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type CostCategory = "hospedagem" | "banco" | "dominio_email" | "video" | "pagamentos" | "ferramentas";
export type CostBillingCycle = "mensal" | "anual" | "uso" | "gratuito";
export type CostCurrency = "BRL" | "USD";
export type CostStatus = "active" | "free" | "paused" | "canceled";
export type CostProbeKey = "netlify" | "supabase" | "domain_dns" | "mux" | "resend" | "kiwify" | "hotmart";

export interface CostSubscription {
  id: string;
  service: string;
  category: CostCategory;
  planName: string;
  billingCycle: CostBillingCycle;
  currency: CostCurrency;
  amount: number;
  status: CostStatus;
  renewalDate: string;
  portalUrl: string;
  notes: string;
  probeKey?: CostProbeKey;
}

export interface CostSubscriptionWithProbe extends CostSubscription {
  monthlyBrl: number;
  liveStatus: "online" | "configured" | "manual" | "pending";
  liveLabel: string;
}

export interface CostCategorySummary {
  category: CostCategory;
  label: string;
  monthlyBrl: number;
  percent: number;
  count: number;
}

export interface CostCenterOverview {
  mode: "live" | "demo";
  usdToBrl: number;
  monthlyTotalBrl: number;
  annualTotalBrl: number;
  activePaidCount: number;
  freeCount: number;
  inactiveCount: number;
  nextRenewal: { service: string; date: string } | null;
  categories: CostCategorySummary[];
  subscriptions: CostSubscriptionWithProbe[];
}

const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  hospedagem: "Hospedagem & CDN",
  banco: "Banco & Autenticação",
  dominio_email: "Domínio & E-mail",
  video: "Vídeo & Stream",
  pagamentos: "Pagamentos & Vendas",
  ferramentas: "Ferramentas & IA",
};

const DEFAULT_USD_TO_BRL = 5.8;

/* Catálogo inicial fiel aos serviços reais do projeto. Nenhum preço é inventado: os valores começam em 0
   para a titular preencher o valor exato da fatura ou do plano contratado em cada fornecedor. */
export const DEFAULT_SUBSCRIPTIONS: readonly CostSubscription[] = [
  {
    id: "netlify",
    service: "Netlify",
    category: "hospedagem",
    planName: "Plano atual (verificar faturamento)",
    billingCycle: "mensal",
    currency: "USD",
    amount: 0,
    status: "free",
    renewalDate: "",
    portalUrl: "https://app.netlify.com/teams/overview",
    notes: "Hospedagem Next.js, Edge/Functions e CDN de saletebrocca.com.",
    probeKey: "netlify",
  },
  {
    id: "supabase",
    service: "Supabase",
    category: "banco",
    planName: "Plano atual (Free / Pro)",
    billingCycle: "mensal",
    currency: "USD",
    amount: 0,
    status: "free",
    renewalDate: "",
    portalUrl: "https://supabase.com/dashboard/project/dhshqcrcusuuiqlvikha/settings/billing/subscription",
    notes: "Banco PostgreSQL (sa-east-1), Auth da Área do Aluno, RLS e Storage.",
    probeKey: "supabase",
  },
  {
    id: "godaddy-dominio",
    service: "GoDaddy · Domínio saletebrocca.com",
    category: "dominio_email",
    planName: "Registro anual .com",
    billingCycle: "anual",
    currency: "BRL",
    amount: 0,
    status: "active",
    renewalDate: "",
    portalUrl: "https://account.godaddy.com/subscriptions",
    notes: "Renovação anual do domínio principal saletebrocca.com e DNS.",
    probeKey: "domain_dns",
  },
  {
    id: "godaddy-email",
    service: "GoDaddy · E-mail Profissional",
    category: "dominio_email",
    planName: "Caixa de e-mail @saletebrocca.com",
    billingCycle: "anual",
    currency: "BRL",
    amount: 0,
    status: "active",
    renewalDate: "",
    portalUrl: "https://account.godaddy.com/subscriptions",
    notes: "E-mail profissional da titular (Microsoft 365 / Workspace GoDaddy).",
  },
  {
    id: "mux-stream",
    service: "Mux Video / Stream",
    category: "video",
    planName: "Pay-as-you-go (codificação + entrega)",
    billingCycle: "uso",
    currency: "USD",
    amount: 0,
    status: "active",
    renewalDate: "",
    portalUrl: "https://dashboard.mux.com/settings/billing",
    notes: "Streaming protegido das videoaulas da Área do Aluno com tokens assinados.",
    probeKey: "mux",
  },
  {
    id: "kiwify",
    service: "Kiwify",
    category: "pagamentos",
    planName: "Taxa por venda aprovada (sem mensalidade)",
    billingCycle: "gratuito",
    currency: "BRL",
    amount: 0,
    status: "free",
    renewalDate: "",
    portalUrl: "https://dashboard.kiwify.com.br",
    notes: "Checkout de cursos e produtos da Loja com webhook automático.",
    probeKey: "kiwify",
  },
  {
    id: "resend",
    service: "Resend",
    category: "dominio_email",
    planName: "E-mails transacionais / ADM",
    billingCycle: "mensal",
    currency: "USD",
    amount: 0,
    status: "free",
    renewalDate: "",
    portalUrl: "https://resend.com/settings/billing",
    notes: "Envio e recebimento de e-mails no módulo ADM E-mails.",
    probeKey: "resend",
  },
];

function computeMonthlyBrl(sub: CostSubscription, usdToBrl: number): number {
  if (sub.status === "paused" || sub.status === "canceled" || sub.status === "free" || sub.billingCycle === "gratuito") {
    return 0;
  }
  const safeAmount = Number.isFinite(sub.amount) && sub.amount > 0 ? sub.amount : 0;
  const brlAmount = sub.currency === "USD" ? safeAmount * usdToBrl : safeAmount;
  if (sub.billingCycle === "anual") return brlAmount / 12;
  return brlAmount;
}

async function resolveLiveProbes(): Promise<Record<CostProbeKey, { status: "online" | "configured" | "pending"; label: string }>> {
  const [muxTokenId, muxSecret, resendKey, hotmartToken] = await Promise.all([
    getRuntimeSecret("MUX_TOKEN_ID"),
    getRuntimeSecret("MUX_TOKEN_SECRET"),
    getRuntimeSecret("RESEND_API_KEY"),
    getRuntimeSecret("HOTMART_WEBHOOK_TOKEN"),
  ]);

  const supabaseActive = isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const netlifyLive = Boolean(process.env.NETLIFY === "true" || process.env.SITE_ID || process.env.NEXT_PUBLIC_SITE_URL);
  const muxSigningActive = Boolean(process.env.MUX_SIGNING_KEY_ID?.trim() && process.env.MUX_SIGNING_PRIVATE_KEY?.trim());
  const muxApiActive = Boolean(muxTokenId && muxSecret);
  const kiwifyActive = getKiwifyWebhookTokens().length > 0;

  return {
    netlify: netlifyLive
      ? { status: "online", label: "Ativo em produção (Netlify CDN)" }
      : { status: "configured", label: "Ambiente local (deploy pronto)" },
    supabase: supabaseActive
      ? { status: "online", label: "Conectado (PostgreSQL + Auth ativos)" }
      : { status: "pending", label: "Modo demonstração (sem chave)" },
    domain_dns: process.env.NEXT_PUBLIC_SITE_URL?.includes("saletebrocca.com")
      ? { status: "online", label: "Domínio saletebrocca.com ativo (HTTPS)" }
      : { status: "configured", label: "Verificação manual na GoDaddy" },
    mux: muxApiActive
      ? { status: "online", label: "API Mux ativa (métricas + player)" }
      : muxSigningActive
        ? { status: "configured", label: "Player assinado ativo (API opcional)" }
        : { status: "pending", label: "Credenciais Mux pendentes" },
    resend: resendKey
      ? { status: "online", label: "API Resend configurada" }
      : { status: "pending", label: "Opcional · não configurado" },
    kiwify: kiwifyActive
      ? { status: "online", label: "Webhook Kiwify ativo" }
      : { status: "pending", label: "Webhook Kiwify pendente" },
    hotmart: hotmartToken
      ? { status: "online", label: "Webhook Hotmart ativo" }
      : { status: "pending", label: "Opcional · não configurado" },
  };
}

interface StoredCostConfig {
  usdToBrl?: number;
  subscriptions?: CostSubscription[];
}

export async function getCostCenterOverview(): Promise<CostCenterOverview> {
  const liveDb = isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  let usdToBrl = DEFAULT_USD_TO_BRL;
  let storedSubs: CostSubscription[] | null = null;

  if (liveDb) {
    try {
      const admin = createSupabaseAdminClient();
      const { data } = await admin.from("site_settings").select("value").eq("key", "cost_center_config").maybeSingle();
      const parsed = (data?.value as StoredCostConfig | null) ?? null;
      if (parsed && typeof parsed.usdToBrl === "number" && parsed.usdToBrl > 0) {
        usdToBrl = parsed.usdToBrl;
      }
      if (parsed && Array.isArray(parsed.subscriptions) && parsed.subscriptions.length > 0) {
        storedSubs = parsed.subscriptions;
      }
    } catch {
      // fallback para catálogo padrão
    }
  }

  const probes = await resolveLiveProbes();
  const baseList = storedSubs ?? [...DEFAULT_SUBSCRIPTIONS];

  const subscriptions: CostSubscriptionWithProbe[] = baseList.map((sub) => {
    const monthlyBrl = computeMonthlyBrl(sub, usdToBrl);
    const probe = sub.probeKey ? probes[sub.probeKey] : undefined;
    return {
      ...sub,
      monthlyBrl,
      liveStatus: probe ? probe.status : "manual",
      liveLabel: probe ? probe.label : "Controle manual (fatura / portal)",
    };
  });

  const monthlyTotalBrl = subscriptions.reduce((sum, s) => sum + s.monthlyBrl, 0);
  const annualTotalBrl = monthlyTotalBrl * 12;

  let activePaidCount = 0;
  let freeCount = 0;
  let inactiveCount = 0;
  for (const s of subscriptions) {
    if (s.status === "active") activePaidCount++;
    else if (s.status === "free") freeCount++;
    else inactiveCount++;
  }

  const upcoming = subscriptions
    .filter((s) => (s.status === "active" || s.status === "free") && /^\d{4}-\d{2}-\d{2}$/.test(s.renewalDate))
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
  const nextRenewal = upcoming[0] ? { service: upcoming[0].service, date: upcoming[0].renewalDate } : null;

  const categoryMap = new Map<CostCategory, { monthlyBrl: number; count: number }>();
  for (const s of subscriptions) {
    const cur = categoryMap.get(s.category) ?? { monthlyBrl: 0, count: 0 };
    cur.monthlyBrl += s.monthlyBrl;
    cur.count += 1;
    categoryMap.set(s.category, cur);
  }

  const categories: CostCategorySummary[] = (Object.keys(COST_CATEGORY_LABELS) as CostCategory[])
    .map((category) => {
      const entry = categoryMap.get(category) ?? { monthlyBrl: 0, count: 0 };
      const percent = monthlyTotalBrl > 0 ? Math.round((entry.monthlyBrl / monthlyTotalBrl) * 100) : 0;
      return {
        category,
        label: COST_CATEGORY_LABELS[category],
        monthlyBrl: entry.monthlyBrl,
        percent,
        count: entry.count,
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.monthlyBrl - a.monthlyBrl);

  return {
    mode: liveDb ? "live" : "demo",
    usdToBrl,
    monthlyTotalBrl,
    annualTotalBrl,
    activePaidCount,
    freeCount,
    inactiveCount,
    nextRenewal,
    categories,
    subscriptions,
  };
}
