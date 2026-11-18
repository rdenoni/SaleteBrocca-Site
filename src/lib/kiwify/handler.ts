import { decideKiwifyAction, type EnrollmentRevokeStatus, type KiwifyAction } from "./decide";
import { parseKiwifyPayload, type KiwifyEvent } from "./payload";
import { verifyKiwifySignature } from "./signature";

/* Resultado da reserva do evento (order_id + event_type):
   - "new": primeira vez, processar;
   - "retry": já existia, mas a tentativa anterior falhou (ou travou há mais que RECLAIM_WINDOW_MS): processar de novo;
   - "duplicate": já processado (processed_at preenchido): não fazer nada, responder 200;
   - "in_flight": outra tentativa ainda está em andamento (ou acabou de reassumir o evento): responder 409 para a
     Kiwify reenviar. Responder 200 aqui perderia a venda se aquela tentativa morrer sem registrar a falha. */
export type ClaimResult = "new" | "retry" | "duplicate" | "in_flight";

/* Evento reservado há mais que isto, sem processed_at nem error, é de uma tentativa que morreu no meio. Um pouco acima
   do limite de execução das funções síncronas da Netlify, que é menor que 60 s (confirmar o valor do plano). */
export const RECLAIM_WINDOW_MS = 60 * 1000;

export interface StoredEventState {
  processedAt: string | null;
  error: string | null;
  /** Instante (ISO) da última reserva do evento. */
  receivedAt: string;
}

/** Regra única de reenvio de um evento já reservado: usada pela loja real e pela loja falsa dos testes. */
export function classifyExistingEvent(state: StoredEventState, nowMs: number): "duplicate" | "retry" | "in_flight" {
  if (state.processedAt) return "duplicate";
  if (state.error !== null) return "retry";
  const ageMs = nowMs - Date.parse(state.receivedAt);
  /* Data ilegível conta como vencida: melhor reprocessar (idempotente) que perder a venda. */
  return ageMs < RECLAIM_WINDOW_MS ? "in_flight" : "retry";
}

export interface KiwifyStore {
  /** `payload` é o objeto mínimo de `minimalEventPayload`: nunca o corpo bruto da Kiwify. */
  claimEvent(input: {
    orderId: string;
    eventType: string;
    orderStatus: string | null;
    payload: Record<string, string | null>;
  }): Promise<ClaimResult>;
  /** Cria a matrícula ativa; se o pedido já tem matrícula (inclusive reembolsada), não altera nada. */
  grantEnrollment(input: { email: string; courseSlug: string; orderId: string; productId: string | null }): Promise<void>;
  /** Revoga e devolve quantas matrículas ficaram com o novo status. Com curso e e-mail, a revogação sempre vence uma
      aprovação concorrente ou atrasada (upsert que atualiza o status). */
  revokeEnrollment(input: {
    orderId: string;
    courseSlug: string | null;
    status: EnrollmentRevokeStatus;
    email: string | null;
    productId: string | null;
  }): Promise<number>;
  /** Convida o aluno a criar a senha; conta já existente não é erro. */
  inviteStudent(email: string): Promise<void>;
  markProcessed(orderId: string, eventType: string): Promise<void>;
  markFailed(orderId: string, eventType: string, message: string): Promise<void>;
}

export interface KiwifyLogMeta {
  orderId: string;
  eventType: string;
}

export interface KiwifyHandlerDeps {
  /** Token atual e, na troca de token, o anterior. */
  tokens: readonly string[];
  store: KiwifyStore;
  resolveCourseSlug: (productId: string) => string | null;
  /** Só order_id e tipo do evento: nunca o payload nem o e-mail. */
  log?: (message: string, meta: KiwifyLogMeta) => void;
}

export interface KiwifyHandlerResult {
  status: number;
  body: Record<string, unknown>;
}

const MAX_BODY_LENGTH = 512 * 1024;
const MAX_ERROR_LENGTH = 300;

function respond(status: number, body: Record<string, unknown>): KiwifyHandlerResult {
  return { status, body };
}

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "erro desconhecido";
  return message.slice(0, MAX_ERROR_LENGTH);
}

/** Só o necessário para auditoria e idempotência: sem nome, telefone, CPF nem e-mail (o e-mail fica em `enrollments`). */
export function minimalEventPayload(event: KiwifyEvent): Record<string, string | null> {
  return {
    order_id: event.orderId,
    order_status: event.orderStatus,
    webhook_event_type: event.eventType,
    product_id: event.productId,
  };
}

/* Observações devolvidas no corpo do 200 e no log de uma revogação sem curso identificado. */
const NOTE_WHOLE_ORDER = "revogou_pedido_inteiro";
const NOTE_NO_ENROLLMENT = "sem_matricula_do_pedido";

/** Aplica a ação; devolve uma observação quando a revogação não pôde mirar um curso específico. */
async function applyAction(
  action: KiwifyAction,
  event: KiwifyEvent,
  deps: KiwifyHandlerDeps,
): Promise<string | undefined> {
  if (action.kind === "grant" && event.email) {
    await deps.store.grantEnrollment({
      email: event.email,
      courseSlug: action.courseSlug,
      orderId: event.orderId,
      productId: event.productId,
    });
    await deps.store.inviteStudent(event.email);
    return undefined;
  }
  if (action.kind !== "revoke") return undefined;

  const affected = await deps.store.revokeEnrollment({
    orderId: event.orderId,
    courseSlug: action.courseSlug,
    status: action.status,
    email: event.email,
    productId: event.productId,
  });
  if (action.courseSlug) return undefined;
  /* Sem produto/curso no payload não dá para registrar uma matrícula já revogada: uma aprovação que chegar depois
     ainda liberaria o acesso. O evento fica como processado, com esta observação. */
  return affected > 0 ? NOTE_WHOLE_ORDER : NOTE_NO_ENROLLMENT;
}

/**
 * Processa um webhook da Kiwify. Status devolvidos:
 * 503 sem token configurado · 413 corpo grande demais · 401 assinatura ausente/inválida · 400 JSON inválido ·
 * 200 processado, duplicado (já processado) ou ignorado · 409 evento ainda em processamento por outra tentativa
 * (a Kiwify reenvia) · 500 falha ao gravar (a Kiwify reenvia).
 * Payload assinado mas sem `order_id` é aceito e ignorado (200): um 500 faria a Kiwify reenviar para sempre.
 */
export async function handleKiwifyWebhook(
  rawBody: string,
  signature: string | null,
  deps: KiwifyHandlerDeps,
): Promise<KiwifyHandlerResult> {
  if (deps.tokens.length === 0) return respond(503, { error: "webhook não configurado" });
  if (rawBody.length > MAX_BODY_LENGTH) return respond(413, { error: "corpo grande demais" });
  if (!verifyKiwifySignature(rawBody, signature, deps.tokens)) return respond(401, { error: "assinatura inválida" });

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return respond(400, { error: "JSON inválido" });
  }

  const event = parseKiwifyPayload(json);
  if (!event) return respond(200, { ok: true, result: "ignored", reason: "sem_pedido" });

  const meta: KiwifyLogMeta = { orderId: event.orderId, eventType: event.eventType };
  const action = decideKiwifyAction(event, deps.resolveCourseSlug);

  let note: string | undefined;
  try {
    const claim = await deps.store.claimEvent({
      orderId: event.orderId,
      eventType: event.eventType,
      orderStatus: event.orderStatus,
      payload: minimalEventPayload(event),
    });
    if (claim === "duplicate") {
      deps.log?.("kiwify: evento duplicado", meta);
      return respond(200, { ok: true, result: "duplicate" });
    }
    if (claim === "in_flight") {
      deps.log?.("kiwify: evento em processamento, aguardando reenvio", meta);
      return respond(409, { error: "evento em processamento" });
    }

    try {
      note = await applyAction(action, event, deps);
      if (action.kind === "ignore" && action.retryable) {
        await deps.store.markFailed(event.orderId, event.eventType, action.reason);
      } else {
        await deps.store.markProcessed(event.orderId, event.eventType);
      }
    } catch (error) {
      /* Se nem a falha for gravada, o evento fica "em andamento" até vencer a janela: avisar no log (só pedido e tipo). */
      await deps.store
        .markFailed(event.orderId, event.eventType, errorMessage(error))
        .catch(() => deps.log?.("kiwify: não foi possível marcar o evento como falho", meta));
      throw error;
    }
  } catch (error) {
    deps.log?.(`kiwify: falha ao processar (${error instanceof Error ? error.name : "erro"})`, meta);
    return respond(500, { error: "falha ao processar" });
  }

  deps.log?.(`kiwify: evento ${action.kind === "ignore" ? "registrado" : action.kind}${note ? ` (${note})` : ""}`, meta);
  return respond(200, {
    ok: true,
    result: action.kind === "ignore" ? "ignored" : "processed",
    action: action.kind,
    ...(action.kind === "ignore" ? { reason: action.reason } : {}),
    ...(note ? { note } : {}),
  });
}
