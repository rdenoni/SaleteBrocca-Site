"use client";

import { Archive, Mail, Send } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/admin/hero/actions";
import { archiveAdminEmailAction, sendAdminEmailReplyAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

export interface AdminEmailRow {
  id: string;
  threadId: string;
  direction: "inbound" | "outbound";
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
}

export function EmailsClient({
  emails,
  resendConfigured,
  fromEmail,
}: {
  emails: readonly AdminEmailRow[];
  resendConfigured: boolean;
  fromEmail: string;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminEmailRow | null>(emails[0] ?? null);
  const [state, action, pending] = useActionState(sendAdminEmailReplyAction, INITIAL_STATE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emails.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (!q) return true;
      return (
        e.subject.toLowerCase().includes(q) ||
        e.fromEmail.toLowerCase().includes(q) ||
        e.bodyText.toLowerCase().includes(q)
      );
    });
  }, [emails, statusFilter, query]);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>ADM — Verificar e Responder E-mails</h1>
        <p className={styles.subtitle}>
          Central de entrada e resposta de e-mails administrativos ({fromEmail}). Recebimento via{" "}
          <code>/api/admin/emails/inbound</code> e envio via Resend API.
        </p>
        <div className={styles.badgeRow}>
          <span className={`${styles.pill} ${resendConfigured ? styles.pillActive : ""}`}>
            Resend API: {resendConfigured ? "Ativa" : "RESEND_API_KEY pendente"}
          </span>
        </div>
      </header>

      <section className={styles.panel} aria-label="Caixa de entrada ADM">
        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por remetente, assunto ou mensagem..."
            aria-label="Buscar e-mails"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            aria-label="Filtrar status do e-mail"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="unread">Não lidos</option>
            <option value="replied">Respondidos</option>
            <option value="archived">Arquivados</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.itemDesc}>Nenhum e-mail na caixa de entrada para o filtro selecionado.</p>
        ) : (
          <div className={styles.itemList}>
            {filtered.map((email) => (
              <article key={email.id} className={styles.itemCard}>
                <div className={styles.panelHead}>
                  <div>
                    <h2 className={styles.itemTitle}>{email.subject}</h2>
                    <p className={styles.hint}>
                      De: {email.fromEmail} · Para: {email.toEmail}
                    </p>
                  </div>
                  <div className={styles.actionRow}>
                    <span className={`${styles.pill} ${email.status === "unread" ? styles.pillActive : ""}`}>
                      {email.status}
                    </span>
                    <button type="button" className={styles.miniBtn} onClick={() => setSelected(email)}>
                      <Mail size={13} aria-hidden="true" />
                      <span>Responder</span>
                    </button>
                    <form action={archiveAdminEmailAction}>
                      <input type="hidden" name="id" value={email.id} />
                      <button type="submit" className={styles.miniBtn}>
                        <Archive size={13} aria-hidden="true" />
                        <span>Arquivar</span>
                      </button>
                    </form>
                  </div>
                </div>
                <p className={styles.itemDesc}>{email.bodyText}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="enviar-resposta-email">
        <h2 id="enviar-resposta-email" className={styles.panelTitle}>
          {selected ? `Responder: ${selected.subject}` : "Compor / Responder E-mail"}
        </h2>
        <form action={action} className={styles.form}>
          {selected ? <input type="hidden" name="originalId" value={selected.id} /> : null}
          {selected ? <input type="hidden" name="threadId" value={selected.threadId} /> : null}
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Para (e-mail) *</span>
              <input
                className={styles.input}
                type="email"
                name="toEmail"
                required
                key={selected?.id ?? "new-to"}
                defaultValue={selected?.fromEmail ?? ""}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Assunto *</span>
              <input
                className={styles.input}
                name="subject"
                required
                key={selected?.id ? `subj-${selected.id}` : "new-subj"}
                defaultValue={selected ? `Re: ${selected.subject}` : ""}
              />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Mensagem *</span>
              <textarea className={styles.textarea} name="bodyText" required />
            </label>
          </div>
          {state.status !== "idle" ? (
            <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
              {state.message}
            </p>
          ) : null}
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={pending}>
              <Send size={15} aria-hidden="true" />
              <span>{pending ? "Enviando..." : "Enviar e-mail"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
