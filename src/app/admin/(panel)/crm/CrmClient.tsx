"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import type { AdminCrmSnapshot } from "@/lib/admin/crm";
import { createLeadAction, deleteLeadAction, updateLeadStatusAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

const STATUS_LABEL: Record<string, string> = {
  new: "Novo",
  contacted: "Em contato",
  converted: "Convertido",
  lost: "Arquivado",
};

export function CrmClient({ snapshot }: { snapshot: AdminCrmSnapshot }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [state, action, pending] = useActionState(createLeadAction, INITIAL_STATE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.whatsapp.toLowerCase().includes(q) ||
        lead.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [snapshot.leads, query, statusFilter]);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>CRM & Leads</h1>
        <p className={styles.subtitle}>
          Acompanhe todos os leads captados pelo site e pelo checkout, com busca por nome, e-mail, WhatsApp e tags.
        </p>
      </header>

      <section aria-label="Indicadores do CRM" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Total de Leads</span>
          <p className={styles.kpiBoxValue}>{snapshot.totalLeads}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Convertidos</span>
          <p className={styles.kpiBoxValue}>{snapshot.convertedLeads}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Conversão</span>
          <p className={styles.kpiBoxValue}>{snapshot.conversionRate}%</p>
        </article>
      </section>

      <section className={styles.panel} aria-label="Base de leads">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Leads</h2>
          <button type="button" className={styles.primaryBtn} onClick={() => setShowAdd((v) => !v)}>
            <Plus size={16} aria-hidden="true" />
            <span>{showAdd ? "Fechar formulário" : "Novo lead"}</span>
          </button>
        </div>

        {showAdd ? (
          <form action={action} className={styles.itemCard}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Nome *</span>
                <input className={styles.input} name="name" required />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>E-mail</span>
                <input className={styles.input} type="email" name="email" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>WhatsApp</span>
                <input className={styles.input} name="whatsapp" placeholder="(48) 99999-9999" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Tags (separadas por vírgula)</span>
                <input className={styles.input} name="tags" placeholder="avaliacao, curso, quente" />
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.label}>Observações</span>
                <textarea className={styles.textarea} name="notes" />
              </label>
            </div>
            {state.status !== "idle" ? (
              <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
                {state.message}
              </p>
            ) : null}
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={pending}>
                <Save size={16} aria-hidden="true" />
                <span>{pending ? "Salvando..." : "Salvar lead"}</span>
              </button>
            </div>
          </form>
        ) : null}

        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por nome, e-mail, WhatsApp ou tag..."
            aria-label="Buscar lead por nome, e-mail, WhatsApp ou tag"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            aria-label="Filtrar status do lead"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="new">Novo</option>
            <option value="contacted">Em contato</option>
            <option value="converted">Convertido</option>
            <option value="lost">Arquivado</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Origem</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    {snapshot.mode === "demo"
                      ? "Conecte o Supabase para registrar e acompanhar leads reais do site."
                      : "Nenhum lead encontrado para o filtro atual."}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong>{lead.name}</strong>
                    </td>
                    <td>
                      {lead.email || "—"}
                      <br />
                      <small>{lead.whatsapp || "—"}</small>
                    </td>
                    <td>
                      <span className={styles.pill}>{lead.source}</span>
                    </td>
                    <td>
                      <div className={styles.badgeRow}>
                        {lead.tags.map((tag) => (
                          <span key={tag} className={styles.pill}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.pill} ${lead.status === "converted" ? styles.pillActive : ""}`}>
                        {STATUS_LABEL[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        <form action={updateLeadStatusAction}>
                          <input type="hidden" name="id" value={lead.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={lead.status === "converted" ? "contacted" : "converted"}
                          />
                          <button type="submit" className={styles.miniBtn}>
                            {lead.status === "converted" ? "Reabrir" : "Marcar convertido"}
                          </button>
                        </form>
                        <form action={deleteLeadAction}>
                          <input type="hidden" name="id" value={lead.id} />
                          <button type="submit" className={`${styles.miniBtn} ${styles.miniBtnDanger}`}>
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
