"use client";

import { Plus, Send } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/admin/hero/actions";
import type { AdminSupportSnapshot } from "@/lib/admin/support";
import { createSupportTicketAction, replySupportTicketAction, updateTicketStatusAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

const STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Encerrado",
};

const CATEGORY_LABEL: Record<string, string> = {
  acesso: "Acesso",
  pagamento: "Pagamento",
  curso: "Curso",
  tecnico: "Técnico",
  lgpd: "LGPD",
  outro: "Outro",
};

export function SupportClient({ snapshot }: { snapshot: AdminSupportSnapshot }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(snapshot.tickets[0]?.id ?? null);
  const [state, action, pending] = useActionState(createSupportTicketAction, INITIAL_STATE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.subject.toLowerCase().includes(q) ||
        t.requesterEmail.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        String(t.ticketNumber).includes(q) ||
        t.messages.some((m) => m.body.toLowerCase().includes(q))
      );
    });
  }, [snapshot.tickets, query, statusFilter, categoryFilter]);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Suporte — Tickets</h1>
        <p className={styles.subtitle}>
          Atenda chamados de alunos e visitantes com busca por assunto, mensagem, usuário ou ID e filtros por status e
          categoria.
        </p>
      </header>

      <section aria-label="Resumo de tickets" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Todos</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.all}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Abertos</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.open}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Respondidos</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.answered}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Encerrados</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.closed}</p>
        </article>
      </section>

      <section className={styles.panel} aria-label="Lista de tickets">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Tickets de Suporte</h2>
          <button type="button" className={styles.primaryBtn} onClick={() => setShowNew((v) => !v)}>
            <Plus size={16} aria-hidden="true" />
            <span>{showNew ? "Fechar formulário" : "Novo ticket"}</span>
          </button>
        </div>

        {showNew ? (
          <form action={action} className={styles.itemCard}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Nome do solicitante</span>
                <input className={styles.input} name="requesterName" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>E-mail *</span>
                <input className={styles.input} type="email" name="requesterEmail" required />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Assunto *</span>
                <input className={styles.input} name="subject" required />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Categoria</span>
                <select className={styles.select} name="category" defaultValue="acesso">
                  {Object.entries(CATEGORY_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.label}>Mensagem *</span>
                <textarea className={styles.textarea} name="body" required />
              </label>
            </div>
            {state.status !== "idle" ? (
              <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
                {state.message}
              </p>
            ) : null}
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={pending}>
                <span>{pending ? "Criando..." : "Criar ticket"}</span>
              </button>
            </div>
          </form>
        ) : null}

        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por assunto, mensagem, usuário ou ID..."
            aria-label="Buscar ticket por assunto, mensagem, usuário ou ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            aria-label="Filtrar status do ticket"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="open">Abertos</option>
            <option value="answered">Respondidos</option>
            <option value="closed">Encerrados</option>
          </select>
          <select
            className={styles.filterSelect}
            aria-label="Filtrar categoria do ticket"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(CATEGORY_LABEL).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.itemDesc}>
            {snapshot.mode === "demo"
              ? "Conecte o Supabase para receber e responder tickets de suporte."
              : "Nenhum ticket encontrado para os filtros atuais."}
          </p>
        ) : (
          <div className={styles.itemList}>
            {filtered.map((ticket) => (
              <article key={ticket.id} className={styles.itemCard}>
                <div className={styles.panelHead}>
                  <div>
                    <h3 className={styles.itemTitle}>
                      #{ticket.ticketNumber} · {ticket.subject}
                    </h3>
                    <p className={styles.hint}>
                      {ticket.requesterName || "Usuário"} ({ticket.requesterEmail})
                    </p>
                    <div className={styles.badgeRow}>
                      <span className={`${styles.pill} ${ticket.status === "open" ? styles.pillActive : ""}`}>
                        {STATUS_LABEL[ticket.status] ?? ticket.status}
                      </span>
                      <span className={styles.pill}>{CATEGORY_LABEL[ticket.category] ?? ticket.category}</span>
                    </div>
                  </div>
                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className={styles.miniBtn}
                      onClick={() => setActiveId((cur) => (cur === ticket.id ? null : ticket.id))}
                    >
                      {activeId === ticket.id ? "Ocultar conversa" : `Ver conversa (${ticket.messages.length})`}
                    </button>
                    {ticket.status !== "closed" ? (
                      <form action={updateTicketStatusAction}>
                        <input type="hidden" name="ticketId" value={ticket.id} />
                        <input type="hidden" name="status" value="closed" />
                        <button type="submit" className={styles.miniBtn}>
                          Encerrar
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                {activeId === ticket.id ? (
                  <div className={styles.form}>
                    {ticket.messages.map((msg) => (
                      <div key={msg.id} className={styles.itemCard} style={{ background: "var(--white)" }}>
                        <strong>{msg.senderType === "admin" ? "Equipe Salete Brocca" : msg.senderEmail}</strong>
                        <p className={styles.itemDesc}>{msg.body}</p>
                      </div>
                    ))}
                    <form action={replySupportTicketAction} className={styles.field}>
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <label className={styles.label} htmlFor={`reply-${ticket.id}`}>
                        Responder ticket
                      </label>
                      <textarea id={`reply-${ticket.id}`} className={styles.textarea} name="body" required />
                      <div className={styles.formActions}>
                        <button type="submit" className={styles.primaryBtn}>
                          <Send size={15} aria-hidden="true" />
                          <span>Enviar resposta</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
