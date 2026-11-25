"use client";

import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Coins,
  ExternalLink,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { Spinner } from "@/components/ui/Spinner";
import type {
  CostBillingCycle,
  CostCategory,
  CostCenterOverview,
  CostCurrency,
  CostStatus,
  CostSubscriptionWithProbe,
} from "@/lib/admin/costs";
import { deleteSubscriptionAction, saveExchangeRateAction, saveSubscriptionAction } from "./actions";
import styles from "./custos.module.css";

const INITIAL: AdminActionState = { status: "idle", message: "" };

const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  hospedagem: "Hospedagem & CDN",
  banco: "Banco & Autenticação",
  dominio_email: "Domínio & E-mail",
  video: "Vídeo & Stream",
  pagamentos: "Pagamentos & Vendas",
  ferramentas: "Ferramentas & IA",
};

const STATUS_LABELS: Record<CostStatus, string> = {
  active: "Ativa (paga)",
  free: "Gratuita",
  paused: "Pausada",
  canceled: "Cancelada",
};

const CYCLE_LABELS: Record<CostBillingCycle, string> = {
  mensal: "Mensal",
  anual: "Anual",
  uso: "Por uso",
  gratuito: "Sem mensalidade",
};

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatOriginal(amount: number, currency: CostCurrency, cycle: CostBillingCycle): string {
  if (cycle === "gratuito" || amount <= 0) return cycle === "gratuito" ? "Grátis / % venda" : "Valor não informado";
  const formatted = new Intl.NumberFormat(currency === "USD" ? "en-US" : "pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
  const suffix = cycle === "anual" ? "/ano" : cycle === "uso" ? "/mês (est.)" : "/mês";
  return `${formatted} ${suffix}`;
}

function formatDateBr(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function CostCenterClient({ overview }: { overview: CostCenterOverview }) {
  const [saveState, saveAction, savePending] = useActionState(saveSubscriptionAction, INITIAL);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteSubscriptionAction, INITIAL);
  const [rateState, rateAction, ratePending] = useActionState(saveExchangeRateAction, INITIAL);

  const [categoryFilter, setCategoryFilter] = useState<"all" | CostCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CostStatus>("all");
  const [editing, setEditing] = useState<CostSubscriptionWithProbe | null>(null);

  const filteredSubs = useMemo(() => {
    return overview.subscriptions.filter((sub) => {
      if (categoryFilter !== "all" && sub.category !== categoryFilter) return false;
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;
      return true;
    });
  }, [overview.subscriptions, categoryFilter, statusFilter]);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Centro de Custos &amp; Assinaturas</h1>
            <p className={styles.subtitle}>
              Centralize todos os planos ativos da sua infraestrutura (Netlify, Supabase, GoDaddy Domínio e E-mail, Mux
              Stream, Resend, Kiwify) e acompanhe a verificação em tempo real e a projeção de gastos.
            </p>
          </div>
          <form action={rateAction} className={styles.rateForm}>
            <label className={styles.rateLabel} htmlFor="usd-brl-rate">
              Cotação USD → BRL
            </label>
            <div className={styles.rateInputRow}>
              <input
                id="usd-brl-rate"
                name="usdToBrl"
                type="text"
                inputMode="decimal"
                defaultValue={overview.usdToBrl.toFixed(2).replace(".", ",")}
                className={styles.rateInput}
              />
              <button type="submit" className={styles.miniBtn} disabled={ratePending}>
                {ratePending ? <Spinner size={14} /> : <RefreshCw size={14} aria-hidden="true" />}
                <span>Atualizar</span>
              </button>
            </div>
            {rateState.status !== "idle" ? (
              <p role="status" className={rateState.status === "ok" ? styles.feedbackOkInline : styles.feedbackErrInline}>
                {rateState.message}
              </p>
            ) : null}
          </form>
        </div>
      </header>

      <section className={styles.kpiGrid} aria-label="Indicadores do Centro de Custos">
        <article className={styles.kpiCard}>
          <span className={styles.kpiHead}>
            <Coins size={16} aria-hidden="true" />
            <span>Custo mensal estimado</span>
          </span>
          <strong className={styles.kpiValue}>{formatBrl(overview.monthlyTotalBrl)}</strong>
          <span className={styles.kpiMeta}>Planos anuais diluídos por 12 · USD convertido</span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiHead}>
            <TrendingUp size={16} aria-hidden="true" />
            <span>Projeção anual</span>
          </span>
          <strong className={styles.kpiValue}>{formatBrl(overview.annualTotalBrl)}</strong>
          <span className={styles.kpiMeta}>Estimativa para 12 meses de operação</span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiHead}>
            <Receipt size={16} aria-hidden="true" />
            <span>Assinaturas monitoradas</span>
          </span>
          <strong className={styles.kpiValue}>{overview.subscriptions.length}</strong>
          <span className={styles.kpiMeta}>
            {overview.activePaidCount} pagas · {overview.freeCount} gratuitas · {overview.inactiveCount} inativas
          </span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiHead}>
            <CalendarClock size={16} aria-hidden="true" />
            <span>Próxima renovação</span>
          </span>
          <strong className={styles.kpiValueSmall}>
            {overview.nextRenewal ? formatDateBr(overview.nextRenewal.date) : "Sem data"}
          </strong>
          <span className={styles.kpiMeta}>
            {overview.nextRenewal ? overview.nextRenewal.service : "Preencha as datas de vencimento abaixo"}
          </span>
        </article>
      </section>

      {overview.categories.length > 0 ? (
        <section className={styles.panel} aria-labelledby="distribuicao-custos">
          <div className={styles.panelHead}>
            <h2 id="distribuicao-custos" className={styles.panelTitle}>
              Distribuição por categoria
            </h2>
            <span className={styles.panelMeta}>Base mensal convertida em BRL</span>
          </div>
          <div className={styles.categoryBars}>
            {overview.categories.map((cat) => (
              <div key={cat.category} className={styles.barRow}>
                <div className={styles.barLabels}>
                  <strong>
                    {cat.label} ({cat.count})
                  </strong>
                  <span>
                    {formatBrl(cat.monthlyBrl)}/mês · {cat.percent}%
                  </span>
                </div>
                <div className={styles.barTrack} aria-hidden="true">
                  <div className={styles.barFill} style={{ width: `${Math.max(cat.percent, cat.monthlyBrl > 0 ? 4 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.mainGrid}>
        <section className={styles.panel} aria-labelledby="assinaturas-ativas">
          <div className={styles.panelHead}>
            <div>
              <h2 id="assinaturas-ativas" className={styles.panelTitle}>
                Assinaturas e planos ativos ({filteredSubs.length})
              </h2>
              <p className={styles.panelDesc}>
                Verificação automática das integrações conectadas + acesso direto ao painel de cobrança de cada serviço.
              </p>
            </div>
          </div>

          <div className={styles.filters}>
            <select
              aria-label="Filtrar por categoria"
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as "all" | CostCategory)}
            >
              <option value="all">Todas as categorias</option>
              {(Object.keys(COST_CATEGORY_LABELS) as CostCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {COST_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por status"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | CostStatus)}
            >
              <option value="all">Todos os status</option>
              {(Object.keys(STATUS_LABELS) as CostStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          {deleteState.status !== "idle" ? (
            <p role="status" className={deleteState.status === "ok" ? styles.feedbackOk : styles.feedbackErr}>
              {deleteState.message}
            </p>
          ) : null}

          <div className={styles.subList}>
            {filteredSubs.map((sub) => (
              <article key={sub.id} className={styles.subCard}>
                <div className={styles.subTop}>
                  <div className={styles.subTitleWrap}>
                    <div className={styles.badgeRow}>
                      <span className={styles.catBadge}>{COST_CATEGORY_LABELS[sub.category]}</span>
                      <span className={styles.statusBadge} data-status={sub.status}>
                        {STATUS_LABELS[sub.status]}
                      </span>
                      <span className={styles.liveBadge} data-live={sub.liveStatus}>
                        {sub.liveStatus === "online" ? (
                          <CheckCircle2 size={12} aria-hidden="true" />
                        ) : (
                          <CircleDashed size={12} aria-hidden="true" />
                        )}
                        <span>{sub.liveLabel}</span>
                      </span>
                    </div>
                    <h3 className={styles.subName}>{sub.service}</h3>
                    <p className={styles.subPlan}>
                      {sub.planName} · {CYCLE_LABELS[sub.billingCycle]}
                      {sub.renewalDate ? ` · Renova em ${formatDateBr(sub.renewalDate)}` : ""}
                    </p>
                  </div>

                  <div className={styles.subPriceCol}>
                    <strong className={styles.subPrice}>{formatBrl(sub.monthlyBrl)}/mês</strong>
                    <span className={styles.subOriginal}>{formatOriginal(sub.amount, sub.currency, sub.billingCycle)}</span>
                  </div>
                </div>

                {sub.notes ? <p className={styles.subNotes}>{sub.notes}</p> : null}

                <div className={styles.subActions}>
                  <button type="button" className={styles.miniBtn} onClick={() => setEditing(sub)}>
                    <Pencil size={14} aria-hidden="true" />
                    <span>Editar valor / plano</span>
                  </button>

                  {sub.portalUrl ? (
                    <a
                      href={sub.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkBtn}
                    >
                      <span>Abrir faturamento</span>
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : null}

                  <form action={deleteAction} className={styles.inlineForm}>
                    <input type="hidden" name="id" value={sub.id} />
                    <button type="submit" className={styles.dangerBtn} disabled={deletePending}>
                      <Trash2 size={14} aria-hidden="true" />
                      <span>Remover</span>
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="form-assinatura-titulo">
          <div className={styles.panelHead}>
            <div>
              <h2 id="form-assinatura-titulo" className={styles.panelTitle}>
                {editing ? `Editar: ${editing.service}` : "Adicionar nova assinatura"}
              </h2>
              <p className={styles.panelDesc}>
                {editing
                  ? "Atualize o plano, valor da fatura, moeda ou data de renovação."
                  : "Cadastre qualquer outro serviço (ex.: domínio extra, Canva, Adobe, Google Workspace, APIs de IA)."}
              </p>
            </div>
            {editing ? (
              <button type="button" className={styles.miniBtn} onClick={() => setEditing(null)}>
                <Plus size={14} aria-hidden="true" />
                <span>Nova</span>
              </button>
            ) : null}
          </div>

          <form key={editing?.id ?? "new"} action={saveAction} className={styles.form}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <input type="hidden" name="probeKey" value={editing?.probeKey ?? ""} />

            <label className={styles.field}>
              <span className={styles.label}>Serviço / Fornecedor *</span>
              <input
                className={styles.input}
                name="service"
                defaultValue={editing?.service ?? ""}
                placeholder="Ex.: GoDaddy · Domínio, Netlify, Supabase, Mux"
                required
              />
            </label>

            <div className={styles.twoCols}>
              <label className={styles.field}>
                <span className={styles.label}>Categoria</span>
                <select className={styles.select} name="category" defaultValue={editing?.category ?? "ferramentas"}>
                  {(Object.keys(COST_CATEGORY_LABELS) as CostCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {COST_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select className={styles.select} name="status" defaultValue={editing?.status ?? "active"}>
                  {(Object.keys(STATUS_LABELS) as CostStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Nome do plano</span>
              <input
                className={styles.input}
                name="planName"
                defaultValue={editing?.planName ?? ""}
                placeholder="Ex.: Pro Plan, Registro anual .com, Microsoft 365"
              />
            </label>

            <div className={styles.threeCols}>
              <label className={styles.field}>
                <span className={styles.label}>Ciclo</span>
                <select className={styles.select} name="billingCycle" defaultValue={editing?.billingCycle ?? "mensal"}>
                  {(Object.keys(CYCLE_LABELS) as CostBillingCycle[]).map((cy) => (
                    <option key={cy} value={cy}>
                      {CYCLE_LABELS[cy]}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Moeda</span>
                <select className={styles.select} name="currency" defaultValue={editing?.currency ?? "BRL"}>
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Valor no ciclo</span>
                <input
                  className={styles.input}
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  defaultValue={editing ? String(editing.amount).replace(".", ",") : ""}
                  placeholder="0,00"
                />
              </label>
            </div>

            <div className={styles.twoCols}>
              <label className={styles.field}>
                <span className={styles.label}>Próxima renovação</span>
                <input
                  className={styles.input}
                  name="renewalDate"
                  type="date"
                  defaultValue={editing?.renewalDate ?? ""}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>URL do portal de cobrança</span>
                <input
                  className={styles.input}
                  name="portalUrl"
                  type="url"
                  defaultValue={editing?.portalUrl ?? ""}
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Observações</span>
              <textarea
                className={styles.textarea}
                name="notes"
                defaultValue={editing?.notes ?? ""}
                placeholder="Cartão usado, conta vinculada, detalhes do plano..."
              />
            </label>

            {saveState.status !== "idle" ? (
              <p role="status" className={saveState.status === "ok" ? styles.feedbackOk : styles.feedbackErr}>
                {saveState.message}
              </p>
            ) : null}

            <button type="submit" className={styles.primaryBtn} disabled={savePending}>
              {savePending ? <Spinner size={15} /> : <Plus size={15} aria-hidden="true" />}
              <span>{savePending ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar assinatura"}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
