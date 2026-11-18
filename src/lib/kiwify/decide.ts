import type { KiwifyEvent } from "./payload";

export type EnrollmentRevokeStatus = "refunded" | "chargeback";

export type KiwifyAction =
  | { kind: "grant"; courseSlug: string }
  /* courseSlug null = revoga as matrículas daquele pedido, qualquer que seja o curso (o reembolso vale mesmo que o
     produto não venha no payload). */
  | { kind: "revoke"; courseSlug: string | null; status: EnrollmentRevokeStatus }
  /* retryable: compra aprovada que não deu para ligar a um curso/aluno por falta de dado no payload. O evento fica
     marcado com erro (não como processado), então um reenvio da Kiwify é processado de novo. */
  | { kind: "ignore"; reason: string; retryable?: boolean };

/* Eventos que só são registrados: não mexem em matrícula. */
const RECORD_ONLY_EVENTS: ReadonlySet<string> = new Set([
  "billet_created",
  "pix_created",
  "order_rejected",
  "subscription_canceled",
  "subscription_late",
  "subscription_renewed",
  "subscription_trial_started",
  "subscription_trial_canceled",
]);

function revokeStatus(event: KiwifyEvent): EnrollmentRevokeStatus | null {
  if (event.eventType === "chargeback" || event.orderStatus === "chargedback") return "chargeback";
  if (event.eventType === "order_refunded" || event.orderStatus === "refunded") return "refunded";
  return null;
}

/**
 * Decide o que fazer com um evento. Pura: o mapa produto → curso entra por parâmetro.
 * Produtos da Loja não viram matrícula (a própria Kiwify entrega o produto digital): o pedido só é registrado.
 */
export function decideKiwifyAction(
  event: KiwifyEvent,
  resolveCourseSlug: (productId: string) => string | null,
): KiwifyAction {
  if (RECORD_ONLY_EVENTS.has(event.eventType)) return { kind: "ignore", reason: "evento_apenas_registrado" };

  const revoke = revokeStatus(event);
  if (revoke) {
    const courseSlug = event.productId ? resolveCourseSlug(event.productId) : null;
    return { kind: "revoke", courseSlug, status: revoke };
  }

  const approved = event.orderStatus === "paid" || event.eventType === "order_approved";
  if (!approved) return { kind: "ignore", reason: "evento_sem_acao" };

  if (!event.productId) return { kind: "ignore", reason: "sem_produto", retryable: true };
  const courseSlug = resolveCourseSlug(event.productId);
  if (!courseSlug) return { kind: "ignore", reason: "produto_sem_curso" };
  if (!event.email) return { kind: "ignore", reason: "sem_email", retryable: true };
  return { kind: "grant", courseSlug };
}
