/* Leitura defensiva do webhook da Kiwify. Confirmados na documentação: `order_id`, `order_status` e
   `webhook_event_type`. Os nomes do produto e do cliente NÃO estão confirmados: vários caminhos são aceitos até
   que um "Testar webhook" real mostre o formato (ver docs/08-VENDAS-KIWIFY.md). */

export interface KiwifyEvent {
  orderId: string;
  /** `webhook_event_type`; "abandoned_cart" quando o campo não vem (carrinho abandonado). */
  eventType: string;
  orderStatus: string | null;
  productId: string | null;
  /** Minúsculo e sem espaços nas pontas; null se ausente ou inválido. */
  email: string | null;
}

const MAX_FIELD_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ABANDONED_CART_EVENT = "abandoned_cart";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : null;
}

function asText(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text !== "" && text.length <= MAX_FIELD_LENGTH ? text : null;
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    const text = asText(value);
    if (text) return text;
  }
  return null;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_SHAPE.test(email) ? email : null;
}

/** null quando o corpo não é um objeto ou não traz `order_id` (nada a registrar). */
export function parseKiwifyPayload(body: unknown): KiwifyEvent | null {
  const root = asObject(body);
  if (!root) return null;

  const orderId = asText(root.order_id);
  if (!orderId) return null;

  const productUpper = asObject(root.Product);
  const productLower = asObject(root.product);
  const customerUpper = asObject(root.Customer);
  const customerLower = asObject(root.customer);

  return {
    orderId,
    eventType: asText(root.webhook_event_type) ?? ABANDONED_CART_EVENT,
    orderStatus: asText(root.order_status),
    // Product.product_id → product_id → product.id (e product.product_id, caso o nome venha em minúsculo).
    productId: firstText(productUpper?.product_id, root.product_id, productLower?.id, productLower?.product_id),
    // Customer.email → customer.email.
    email: normalizeEmail(customerUpper?.email) ?? normalizeEmail(customerLower?.email),
  };
}
