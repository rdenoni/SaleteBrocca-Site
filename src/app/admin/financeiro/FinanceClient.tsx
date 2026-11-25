"use client";

import { Download, FileSpreadsheet, Receipt, RotateCcw, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminFinanceSnapshot } from "@/lib/admin/finance";
import styles from "../cms.module.css";

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function FinanceClient({ snapshot }: { snapshot: AdminFinanceSnapshot }) {
  const [tab, setTab] = useState<"extrato" | "estornos" | "logs">("extrato");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  const filteredTx = useMemo(() => {
    return snapshot.transactions.filter((tx) => {
      if (platformFilter !== "all" && tx.platform !== platformFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      return true;
    });
  }, [snapshot.transactions, platformFilter, statusFilter]);

  function downloadCsv() {
    const header = ["Data", "Plataforma", "Pedido", "Cliente", "Email", "Produto", "Bruto", "Liquido", "Status"];
    const rows = filteredTx.map((tx) => [
      tx.occurredAt,
      tx.platform,
      tx.orderId,
      tx.customerName,
      tx.customerEmail,
      tx.productName,
      (tx.grossCents / 100).toFixed(2),
      (tx.netCents / 100).toFixed(2),
      tx.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extrato-financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Financeiro (Kiwify & Hotmart)</h1>
        <p className={styles.subtitle}>
          Acompanhe receita bruta e líquida, licenças ativas/pendentes/expiradas, auditoria de reembolsos e
          chargebacks, extrato exportável e logs brutos de webhooks.
        </p>
        <div className={styles.badgeRow}>
          <span className={`${styles.pill} ${snapshot.kiwifyConfigured ? styles.pillActive : ""}`}>
            Kiwify: {snapshot.kiwifyConfigured ? "Webhook ativo (/api/kiwify/webhook)" : "Token pendente"}
          </span>
          <span className={`${styles.pill} ${snapshot.hotmartConfigured ? styles.pillActive : ""}`}>
            Hotmart: {snapshot.hotmartConfigured ? "Webhook ativo (/api/hotmart/webhook)" : "HOTMART_WEBHOOK_TOKEN pendente"}
          </span>
        </div>
      </header>

      <section aria-label="Indicadores financeiros" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Receita Líquida</span>
          <p className={styles.kpiBoxValue}>{formatMoney(snapshot.kpis.netRevenueCents)}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Receita Bruta</span>
          <p className={styles.kpiBoxValue}>{formatMoney(snapshot.kpis.grossRevenueCents)}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Licenças Ativas</span>
          <p className={styles.kpiBoxValue}>{snapshot.kpis.activeLicenses}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Pendentes</span>
          <p className={styles.kpiBoxValue}>{snapshot.kpis.pendingCount}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Expiradas</span>
          <p className={styles.kpiBoxValue}>{snapshot.kpis.expiredCount}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Reembolsos</span>
          <p className={styles.kpiBoxValue}>{snapshot.kpis.refundCount}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Chargebacks</span>
          <p className={styles.kpiBoxValue}>{snapshot.kpis.chargebackCount}</p>
        </article>
      </section>

      <div className={styles.tabs} role="tablist" aria-label="Visões financeiras">
        <button
          type="button"
          role="tab"
          className={styles.tabBtn}
          aria-selected={tab === "extrato"}
          onClick={() => setTab("extrato")}
        >
          <Receipt size={16} aria-hidden="true" />
          <span>Extrato ({snapshot.transactions.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          className={styles.tabBtn}
          aria-selected={tab === "estornos"}
          onClick={() => setTab("estornos")}
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Auditoria de Estornos ({snapshot.refundAudit.length})</span>
        </button>
        <button
          type="button"
          role="tab"
          className={styles.tabBtn}
          aria-selected={tab === "logs"}
          onClick={() => setTab("logs")}
        >
          <Terminal size={16} aria-hidden="true" />
          <span>Logs de Webhooks ({snapshot.webhookLogs.length})</span>
        </button>
      </div>

      {tab === "extrato" ? (
        <section className={styles.panel} aria-label="Extrato financeiro">
          <div className={styles.toolbar}>
            <select
              className={styles.filterSelect}
              aria-label="Filtrar plataforma"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">Todas as plataformas</option>
              <option value="kiwify">Kiwify</option>
              <option value="hotmart">Hotmart</option>
              <option value="manual">Manual</option>
            </select>
            <select
              className={styles.filterSelect}
              aria-label="Filtrar status da transação"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
              <option value="refunded">Reembolsado</option>
              <option value="chargeback">Chargeback</option>
              <option value="canceled">Cancelado</option>
            </select>
            <button type="button" className={styles.secondaryBtn} onClick={downloadCsv}>
              <Download size={16} aria-hidden="true" />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Plataforma</th>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Bruto</th>
                  <th>Líquido</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      {snapshot.mode === "demo"
                        ? "Conecte o Supabase e os webhooks Kiwify/Hotmart para exibir o extrato em tempo real."
                        : "Nenhuma transação registrada para o filtro atual."}
                    </td>
                  </tr>
                ) : (
                  filteredTx.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDateTime(tx.occurredAt)}</td>
                      <td>
                        <span className={styles.pill}>{tx.platform}</span>
                      </td>
                      <td>
                        <code>{tx.orderId}</code>
                      </td>
                      <td>
                        <strong>{tx.customerName || "—"}</strong>
                        <br />
                        <small>{tx.customerEmail}</small>
                      </td>
                      <td>{formatMoney(tx.grossCents)}</td>
                      <td>{formatMoney(tx.netCents)}</td>
                      <td>
                        <span className={`${styles.pill} ${tx.status === "paid" ? styles.pillActive : ""}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "estornos" ? (
        <section className={styles.panel} aria-label="Auditoria de estornos">
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Auditoria de Reembolsos e Chargebacks</h2>
            <FileSpreadsheet size={18} aria-hidden="true" />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Plataforma</th>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Motivo / Evento</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.refundAudit.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Nenhum reembolso ou chargeback registrado.</td>
                  </tr>
                ) : (
                  snapshot.refundAudit.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDateTime(tx.occurredAt)}</td>
                      <td>
                        <span className={styles.pill}>{tx.platform}</span>
                      </td>
                      <td>
                        <code>{tx.orderId}</code>
                      </td>
                      <td>{tx.customerEmail}</td>
                      <td>
                        <span className={styles.pill}>{tx.status}</span>
                      </td>
                      <td>{formatMoney(tx.grossCents)}</td>
                      <td>{tx.refundReason || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "logs" ? (
        <section className={styles.panel} aria-label="Logs de webhooks">
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Logs de Webhooks (Kiwify & Hotmart)</h2>
          </div>
          {snapshot.webhookLogs.length === 0 ? (
            <p className={styles.itemDesc}>Nenhum evento de webhook recebido ainda.</p>
          ) : (
            <div className={styles.itemList}>
              {snapshot.webhookLogs.map((log) => (
                <article key={log.id} className={styles.itemCard}>
                  <div className={styles.panelHead}>
                    <div>
                      <strong>
                        [{log.platform.toUpperCase()}] {log.eventType}
                      </strong>{" "}
                      · <code>{log.orderId}</code>
                      <p className={styles.hint}>
                        Recebido em {formatDateTime(log.receivedAt)} · Status: {log.orderStatus ?? "—"}
                        {log.error ? ` · Erro: ${log.error}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.miniBtn}
                      onClick={() => setOpenLogId((cur) => (cur === log.id ? null : log.id))}
                    >
                      {openLogId === log.id ? "Ocultar JSON" : "Ver payload"}
                    </button>
                  </div>
                  {openLogId === log.id ? (
                    <pre className={styles.codeBox}>{JSON.stringify(log.payload, null, 2)}</pre>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
