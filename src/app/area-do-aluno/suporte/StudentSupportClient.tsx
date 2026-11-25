"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  KeyRound,
  LifeBuoy,
  MessageSquare,
  Plus,
  Search,
  Send,
  Shield,
  ShoppingBag,
  Wrench,
} from "lucide-react";
import { useActionState, useMemo, useOptimistic, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
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

const CATEGORY_OPTIONS: readonly {
  value: SupportTicketCategory;
  label: string;
  Icon: typeof BookOpen;
}[] = [
  { value: "curso", label: "Curso / Aulas", Icon: BookOpen },
  { value: "acesso", label: "Acesso / Login", Icon: KeyRound },
  { value: "pagamento", label: "Pagamento / Pedido", Icon: ShoppingBag },
  { value: "tecnico", label: "Suporte Técnico", Icon: Wrench },
  { value: "lgpd", label: "Privacidade (LGPD)", Icon: Shield },
  { value: "outro", label: "Produto / Outro", Icon: HelpCircle },
];

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

function TicketReplyForm({
  ticketId,
  onOptimisticReply,
}: {
  ticketId: string;
  onOptimisticReply: (ticketId: string, body: string) => void;
}) {
  const [state, action, pending] = useActionState(
    async (prev: StudentSupportActionState, formData: FormData) => {
      const body = String(formData.get("body") ?? "").trim();
      if (body) onOptimisticReply(ticketId, body);
      return replyStudentTicketAction(prev, formData);
    },
    INITIAL,
  );

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
          {pending ? <Spinner size={15} /> : <Send size={15} aria-hidden="true" />}
          <span>{pending ? "Enviando..." : "Enviar resposta"}</span>
        </button>
      </div>
    </form>
  );
}

type OptimisticTicketAction =
  | { type: "create"; ticket: StudentTicketItem }
  | { type: "reply"; ticketId: string; message: StudentTicketMessage };

export function StudentSupportClient({
  tickets,
  demoMode,
}: {
  tickets: readonly StudentTicketItem[];
  demoMode: boolean;
}) {
  const [optimisticTickets, addOptimistic] = useOptimistic(
    tickets,
    (current: readonly StudentTicketItem[], update: OptimisticTicketAction): readonly StudentTicketItem[] => {
      if (update.type === "create") {
        return [update.ticket, ...current];
      }
      return current.map((ticket) =>
        ticket.id === update.ticketId
          ? {
              ...ticket,
              updatedAt: update.message.createdAt,
              messages: [...ticket.messages, update.message],
            }
          : ticket,
      );
    },
  );

  const [selectedCategory, setSelectedCategory] = useState<SupportTicketCategory>("curso");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SupportTicketStatus>("all");
  const [openTicketId, setOpenTicketId] = useState<string | null>(tickets[0]?.id ?? null);

  const [createState, createAction, createPending] = useActionState(
    async (prev: StudentSupportActionState, formData: FormData) => {
      const subject = String(formData.get("subject") ?? "").trim();
      const body = String(formData.get("body") ?? "").trim();
      const category = String(formData.get("category") ?? "curso") as SupportTicketCategory;
      if (subject && body) {
        const now = new Date().toISOString();
        const tempId = `optimistic-${Date.now()}`;
        addOptimistic({
          type: "create",
          ticket: {
            id: tempId,
            ticketNumber: 0,
            subject,
            category,
            status: "open",
            createdAt: now,
            updatedAt: now,
            messages: [{ id: `${tempId}-msg`, senderType: "user", body, createdAt: now }],
          },
        });
        setOpenTicketId(tempId);
      }
      return createStudentTicketAction(prev, formData);
    },
    INITIAL,
  );

  function handleOptimisticReply(ticketId: string, body: string) {
    const now = new Date().toISOString();
    addOptimistic({
      type: "reply",
      ticketId,
      message: {
        id: `optimistic-reply-${Date.now()}`,
        senderType: "user",
        body,
        createdAt: now,
      },
    });
  }

  const counts = useMemo(() => {
    let open = 0;
    let answered = 0;
    let closed = 0;
    for (const t of optimisticTickets) {
      if (t.status === "open") open++;
      else if (t.status === "answered") answered++;
      else if (t.status === "closed") closed++;
    }
    return { all: optimisticTickets.length, open, answered, closed };
  }, [optimisticTickets]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return optimisticTickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      const inSubject = t.subject.toLowerCase().includes(q);
      const inNumber = `#${t.ticketNumber}`.includes(q);
      const inMessages = t.messages.some((m) => m.body.toLowerCase().includes(q));
      return inSubject || inNumber || inMessages;
    });
  }, [optimisticTickets, statusFilter, searchQuery]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsStrip} aria-label="Resumo dos seus chamados">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total de chamados</span>
          <strong className={styles.statValue}>{counts.all}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            <span className={styles.dotOpen} aria-hidden="true" />
            Em atendimento
          </span>
          <strong className={styles.statValue}>{counts.open}</strong>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>
            <span className={styles.dotAnswered} aria-hidden="true" />
            Respondidos
          </span>
          <strong className={styles.statValue}>{counts.answered}</strong>
        </div>
      </div>

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
                Escolha o tema abaixo e descreva sua dúvida sobre o curso, acesso ou pedido da loja.
              </p>
            </div>
          </div>

          <form action={createAction} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="suporte-categoria">
                Categoria
              </label>
              <select
                id="suporte-categoria"
                className={styles.select}
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SupportTicketCategory)}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className={styles.categoryGrid} role="group" aria-label="Seleção rápida de tema">
                {CATEGORY_OPTIONS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={styles.categoryChip}
                    aria-pressed={selectedCategory === value}
                    onClick={() => setSelectedCategory(value)}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

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

            <div className={styles.formFooter}>
              <p className={styles.slaNote}>
                <Clock size={14} aria-hidden="true" />
                <span>O histórico completo fica salvo na sua conta.</span>
              </p>
              <button type="submit" className={styles.primaryBtn} disabled={createPending}>
                {createPending ? <Spinner size={15} /> : <Send size={15} aria-hidden="true" />}
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
                  Meus chamados ({counts.all})
                </h2>
                <p className={styles.panelDesc}>Acompanhe o status e as respostas da equipe Salete Brocca.</p>
              </div>
            </div>
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchWrap}>
              <Search size={16} aria-hidden="true" className={styles.searchIcon} />
              <span className="visually-hidden">Buscar chamados</span>
              <input
                type="search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por assunto, número ou mensagem..."
              />
            </label>

            <div className={styles.filterPills} role="group" aria-label="Filtrar chamados por status">
              {(["all", "open", "answered", "closed"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={styles.filterBtn}
                  aria-pressed={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                >
                  <span>{status === "all" ? "Todos" : STATUS_LABEL[status]}</span>
                  <span className={styles.filterCount}>{counts[status]}</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyBox}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <MessageSquare size={22} />
              </span>
              <p className={styles.emptyTitle}>
                {searchQuery.trim()
                  ? "Nenhum chamado encontrado para esta busca"
                  : demoMode
                    ? "Seus chamados aparecerão aqui"
                    : "Nenhum chamado neste filtro"}
              </p>
              <p className={styles.emptyDesc}>
                {searchQuery.trim()
                  ? "Tente buscar por outro termo ou limpe o filtro acima."
                  : demoMode
                    ? "Quando o login estiver ativo, todos os chamados e respostas da equipe ficarão centralizados nesta lista."
                    : "Precisa de ajuda com alguma aula, material ou pedido? Use o formulário ao lado para falar conosco."}
              </p>
            </div>
          ) : (
            <div className={styles.ticketList}>
              {filtered.map((ticket) => {
                const isOpen = openTicketId === ticket.id;
                const isOptimisticTicket = ticket.id.startsWith("optimistic-");
                return (
                  <article key={ticket.id} className={styles.ticketCard} data-open={isOpen ? "true" : undefined}>
                    <div className={styles.ticketTop}>
                      <div className={styles.ticketInfo}>
                        <div className={styles.badgeRow}>
                          <span className={styles.ticketNumber}>
                            {isOptimisticTicket ? "Novo" : `#${ticket.ticketNumber}`}
                          </span>
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
                        <span>{isOpen ? "Ocultar" : "Ver conversa"}</span>
                        {isOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                      </button>
                    </div>

                    {isOpen ? (
                      <div className={styles.thread}>
                        {ticket.messages.map((msg) => {
                          const isSending = msg.id.startsWith("optimistic-");
                          return (
                            <div
                              key={msg.id}
                              className={styles.messageBubble}
                              data-sender={msg.senderType}
                              data-pending={isSending ? "true" : undefined}
                            >
                              <div className={styles.messageHead}>
                                <span className={styles.senderBadge}>
                                  {msg.senderType === "admin" ? (
                                    <>
                                      <CheckCircle2 size={14} aria-hidden="true" />
                                      <strong>Equipe Salete Brocca</strong>
                                    </>
                                  ) : (
                                    <strong>Você</strong>
                                  )}
                                </span>
                                <span className={styles.timeMeta}>
                                  {isSending ? (
                                    <>
                                      <Spinner size={12} />
                                      <span>Enviando...</span>
                                    </>
                                  ) : (
                                    <time dateTime={msg.createdAt}>{formatDateTime(msg.createdAt)}</time>
                                  )}
                                </span>
                              </div>
                              <p className={styles.messageBody}>{msg.body}</p>
                            </div>
                          );
                        })}

                        {ticket.status !== "closed" ? (
                          <TicketReplyForm ticketId={ticket.id} onOptimisticReply={handleOptimisticReply} />
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
    </div>
  );
}
