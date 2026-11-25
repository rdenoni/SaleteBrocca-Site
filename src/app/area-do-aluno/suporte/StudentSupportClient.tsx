"use client";

import { LifeBuoy, MessageSquare, Plus, Send } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { SupportTicketCategory, SupportTicketStatus } from "@/types/database";
import {
  createStudentTicketAction,
  replyStudentTicketAction,
  type StudentSupportActionState,
} from "./actions";
import styles from "./suporte.module.css";

export interface StudentTicketMessage {
  id: string;
  senderType: "user" | "admin";
  body: string;
  createdAt: string;
}

export interface StudentTicketItem {
  id: string;
  ticketNumber: number;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: StudentTicketMessage[];
}

const INITIAL: StudentSupportActionState = { status: "idle", message: "" };

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Aberto",
  answered: "Respondido",
  closed: "Encerrado",
};

const CATEGORY_LABEL: Record<SupportTicketCategory, string> = {
  curso: "Curso / Aulas",
  acesso: "Acesso / Login",
  pagamento: "Pagamento / Pedido",
  tecnico: "Suporte Técnico",
  lgpd: "Privacidade (LGPD)",
  outro: "Produto / Outro",
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(replyStudentTicketAction, INITIAL);

  return (
    <form action={action} className={styles.replyForm}>
      <input type="hidden" name="ticketId" value={ticketId} />
      <label className={styles.label} htmlFor={`student-reply-${ticketId}`}>
        Enviar nova mensagem neste chamado
      </label>
      <textarea
        id={`student-reply-${ticketId}`}
        name="body"
        className={styles.textarea}
        placeholder="Escreva sua resposta ou complemento..."
        required
      />
      {state.status !== "idle" ? (
        <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
          {state.message}
        </p>
      ) : null}
      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryBtn} disabled={pending}>
          <Send size={15} aria-hidden="true" />
          <span>{pending ? "Enviando..." : "Enviar resposta"}</span>
        </button>
      </div>
    </form>
  );
}

export function StudentSupportClient({
  tickets,
  demoMode,
}: {
  tickets: readonly StudentTicketItem[];
  demoMode: boolean;
}) {
  const [createState, createAction, createPending] = useActionState(createStudentTicketAction, INITIAL);
  const [statusFilter, setStatusFilter] = useState<"all" | SupportTicketStatus>("all");
  const [openTicketId, setOpenTicketId] = useState<string | null>(tickets[0]?.id ?? null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  return (
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="abrir-chamado-titulo">
        <div className={styles.panelHead}>
          <span className={styles.iconBadge} aria-hidden="true">
            <Plus size={18} />
          </span>
          <div>
            <h2 id="abrir-chamado-titulo" className={styles.panelTitle}>
              Abrir novo chamado
            </h2>
            <p className={styles.panelDesc}>
              Dúvidas sobre o curso, acesso às aulas, materiais ou pedidos da loja? Envie por aqui.
            </p>
          </div>
        </div>

        <form action={createAction} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Categoria</span>
            <select className={styles.select} name="category" defaultValue="curso">
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Assunto *</span>
            <input
              className={styles.input}
              name="subject"
              placeholder="Ex.: Dúvida sobre aula do módulo 2 ou entrega do produto"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Mensagem *</span>
            <textarea
              className={styles.textarea}
              name="body"
              placeholder="Conte com detalhes como podemos ajudar..."
              required
            />
          </label>

          {createState.status !== "idle" ? (
            <p
              role="status"
              className={`${styles.feedback} ${createState.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}
            >
              {createState.message}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={createPending}>
              <Send size={15} aria-hidden="true" />
              <span>{createPending ? "Enviando..." : "Abrir chamado"}</span>
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="meus-chamados-titulo">
        <div className={styles.panelHeadRow}>
          <div className={styles.panelHead}>
            <span className={styles.iconBadge} aria-hidden="true">
              <LifeBuoy size={18} />
            </span>
            <div>
              <h2 id="meus-chamados-titulo" className={styles.panelTitle}>
                Meus chamados ({tickets.length})
              </h2>
              <p className={styles.panelDesc}>Acompanhe o status e as respostas da equipe Salete Brocca.</p>
            </div>
          </div>

          <div className={styles.filterPills} role="group" aria-label="Filtrar chamados por status">
            {(["all", "open", "answered", "closed"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={styles.filterBtn}
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "Todos" : STATUS_LABEL[status]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.emptyBox}>
            <MessageSquare size={22} aria-hidden="true" />
            <p>
              {demoMode
                ? "Seus chamados de suporte e as respostas da equipe aparecerão aqui quando o login estiver ativo."
                : "Você ainda não tem chamados neste filtro. Use o formulário ao lado se precisar de ajuda."}
            </p>
          </div>
        ) : (
          <div className={styles.ticketList}>
            {filtered.map((ticket) => {
              const isOpen = openTicketId === ticket.id;
              return (
                <article key={ticket.id} className={styles.ticketCard}>
                  <div className={styles.ticketTop}>
                    <div className={styles.ticketInfo}>
                      <div className={styles.badgeRow}>
                        <span className={styles.ticketNumber}>#{ticket.ticketNumber}</span>
                        <span className={styles.statusPill} data-status={ticket.status}>
                          {STATUS_LABEL[ticket.status]}
                        </span>
                        <span className={styles.categoryPill}>{CATEGORY_LABEL[ticket.category]}</span>
                      </div>
                      <h3 className={styles.ticketTitle}>{ticket.subject}</h3>
                      <p className={styles.ticketMeta}>
                        Atualizado em {formatDateTime(ticket.updatedAt)} · {ticket.messages.length}{" "}
                        {ticket.messages.length === 1 ? "mensagem" : "mensagens"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      aria-expanded={isOpen}
                      onClick={() => setOpenTicketId((cur) => (cur === ticket.id ? null : ticket.id))}
                    >
                      {isOpen ? "Ocultar" : "Ver respostas"}
                    </button>
                  </div>

                  {isOpen ? (
                    <div className={styles.thread}>
                      {ticket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={styles.messageBubble}
                          data-sender={msg.senderType}
                        >
                          <div className={styles.messageHead}>
                            <strong>{msg.senderType === "admin" ? "Equipe Salete Brocca" : "Você"}</strong>
                            <time dateTime={msg.createdAt}>{formatDateTime(msg.createdAt)}</time>
                          </div>
                          <p className={styles.messageBody}>{msg.body}</p>
                        </div>
                      ))}

                      {ticket.status !== "closed" ? (
                        <TicketReplyForm ticketId={ticket.id} />
                      ) : (
                        <p className={styles.closedNote}>
                          Este chamado foi encerrado. Caso precise de algo novo, abra um novo chamado.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
