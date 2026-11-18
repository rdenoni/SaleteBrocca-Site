import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { validatedCheckoutUrl } from "../src/lib/kiwify/checkout-url";
import { decideKiwifyAction } from "../src/lib/kiwify/decide";
import {
  RECLAIM_WINDOW_MS,
  classifyExistingEvent,
  handleKiwifyWebhook,
  type ClaimResult,
  type KiwifyHandlerDeps,
  type KiwifyStore,
  type StoredEventState,
} from "../src/lib/kiwify/handler";
import { parseKiwifyPayload, type KiwifyEvent } from "../src/lib/kiwify/payload";
import { verifyKiwifySignature } from "../src/lib/kiwify/signature";

/* Lógica pura do webhook da Kiwify (sem navegador): roda uma vez, no projeto "desktop".
   Todos os valores são fictícios. */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "lógica pura: basta rodar uma vez");
});

const TOKEN = "token-ficticio-atual";
const PREVIOUS_TOKEN = "token-ficticio-anterior";
const PRODUCT_ID = "fixture-product-curso";
const COURSE_SLUG = "curso-ficticio";

/* Vetor de teste publicado em docs.kiwify.com.br/api-reference/webhooks/receiving. */
const DOCS_TOKEN = "kiwify-token-de-teste";
const DOCS_BODY =
  '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
const DOCS_SIGNATURE = "bf18f352a4f981b91dfa3f6d8742a81080ab8c86";

const FIXTURE = readFileSync(path.join(__dirname, "fixtures", "kiwify-order-approved.json"), "utf8");

function sign(body: string, token = TOKEN): string {
  return createHmac("sha1", token).update(body).digest("hex");
}

function resolveCourseSlug(productId: string): string | null {
  return productId === PRODUCT_ID ? COURSE_SLUG : null;
}

function fixtureWith(changes: Record<string, unknown>): string {
  return JSON.stringify({ ...JSON.parse(FIXTURE), ...changes });
}

test.describe("Kiwify: assinatura", () => {
  test("aceita o vetor de teste da documentação", () => {
    expect(verifyKiwifySignature(DOCS_BODY, DOCS_SIGNATURE, [DOCS_TOKEN])).toBe(true);
    expect(sign(DOCS_BODY, DOCS_TOKEN)).toBe(DOCS_SIGNATURE);
  });

  test("aceita assinatura válida (também em maiúsculas)", () => {
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE), [TOKEN])).toBe(true);
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE).toUpperCase(), [TOKEN])).toBe(true);
  });

  test("recusa assinatura de outro corpo, de outro token, ausente ou de tamanho errado", () => {
    expect(verifyKiwifySignature(`${FIXTURE} `, sign(FIXTURE), [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE, "outro"), [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, null, [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, "", [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE).slice(0, 39), [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, `${sign(FIXTURE)}00`, [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, "z".repeat(40), [TOKEN])).toBe(false);
  });

  test("aceita o token anterior durante a troca e recusa sem tokens", () => {
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE, PREVIOUS_TOKEN), [TOKEN, PREVIOUS_TOKEN])).toBe(true);
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE, PREVIOUS_TOKEN), [TOKEN])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE), [])).toBe(false);
    expect(verifyKiwifySignature(FIXTURE, sign(FIXTURE, ""), [""])).toBe(false);
  });
});

test.describe("Kiwify: leitura do payload", () => {
  test("lê o fixture de compra aprovada", () => {
    expect(parseKiwifyPayload(JSON.parse(FIXTURE))).toEqual({
      orderId: "fixture-order-0001",
      eventType: "order_approved",
      orderStatus: "paid",
      productId: PRODUCT_ID,
      email: "aluna@example.com",
    });
  });

  test("aceita customer em minúsculas e product_id no topo", () => {
    const parsed = parseKiwifyPayload({
      order_id: "o-1",
      order_status: "paid",
      webhook_event_type: "order_approved",
      product_id: "p-topo",
      customer: { email: "Aluna@Example.com" },
    });
    expect(parsed).toMatchObject({ productId: "p-topo", email: "aluna@example.com" });
  });

  test("aceita product.id em minúsculas", () => {
    const parsed = parseKiwifyPayload({ order_id: "o-1", product: { id: "p-minusculo" } });
    expect(parsed?.productId).toBe("p-minusculo");
  });

  test("e-mail inválido vira null; sem order_id ou corpo que não é objeto vira null", () => {
    expect(parseKiwifyPayload({ order_id: "o-1", Customer: { email: "nao-e-email" } })?.email).toBeNull();
    expect(parseKiwifyPayload({ webhook_event_type: "order_approved" })).toBeNull();
    expect(parseKiwifyPayload([])).toBeNull();
    expect(parseKiwifyPayload("texto")).toBeNull();
    expect(parseKiwifyPayload(null)).toBeNull();
  });

  test("carrinho abandonado (sem webhook_event_type) com order_id é registrado como abandoned_cart", () => {
    expect(parseKiwifyPayload({ order_id: "o-9" })?.eventType).toBe("abandoned_cart");
  });
});

test.describe("Kiwify: decisão", () => {
  const base: KiwifyEvent = {
    orderId: "o-1",
    eventType: "order_approved",
    orderStatus: "paid",
    productId: PRODUCT_ID,
    email: "aluna@example.com",
  };

  test("compra aprovada libera o curso", () => {
    expect(decideKiwifyAction(base, resolveCourseSlug)).toEqual({ kind: "grant", courseSlug: COURSE_SLUG });
  });

  test("order_status paid sem tipo de evento também libera", () => {
    const event = { ...base, eventType: "abandoned_cart" };
    expect(decideKiwifyAction(event, resolveCourseSlug)).toEqual({ kind: "grant", courseSlug: COURSE_SLUG });
  });

  test("reembolso e chargeback revogam", () => {
    const refund = { ...base, eventType: "order_refunded", orderStatus: "refunded" };
    expect(decideKiwifyAction(refund, resolveCourseSlug)).toEqual({
      kind: "revoke",
      courseSlug: COURSE_SLUG,
      status: "refunded",
    });
    const chargeback = { ...base, eventType: "chargeback", orderStatus: "chargedback" };
    expect(decideKiwifyAction(chargeback, resolveCourseSlug)).toEqual({
      kind: "revoke",
      courseSlug: COURSE_SLUG,
      status: "chargeback",
    });
  });

  test("reembolso sem produto no payload revoga o pedido inteiro", () => {
    const refund = { ...base, eventType: "order_refunded", orderStatus: "refunded", productId: null };
    expect(decideKiwifyAction(refund, resolveCourseSlug)).toEqual({
      kind: "revoke",
      courseSlug: null,
      status: "refunded",
    });
  });

  test("pix, boleto, recusada e assinatura só são registrados", () => {
    const cases = [
      ["pix_created", "waiting_payment"],
      ["billet_created", "waiting_payment"],
      ["order_rejected", "refused"],
      ["subscription_canceled", "paid"],
    ] as const;
    for (const [eventType, orderStatus] of cases) {
      expect(decideKiwifyAction({ ...base, eventType, orderStatus }, resolveCourseSlug).kind).toBe("ignore");
    }
  });

  test("produto desconhecido, sem produto ou sem e-mail não liberam nada", () => {
    expect(decideKiwifyAction({ ...base, productId: "outro" }, resolveCourseSlug)).toEqual({
      kind: "ignore",
      reason: "produto_sem_curso",
    });
    expect(decideKiwifyAction({ ...base, productId: null }, resolveCourseSlug).kind).toBe("ignore");
    expect(decideKiwifyAction({ ...base, email: null }, resolveCourseSlug).kind).toBe("ignore");
  });
});

/* Loja falsa em memória: reproduz a idempotência por (order_id, event_type) com a MESMA regra de reenvio da loja real
   (classifyExistingEvent) e a regra de matrícula do banco (aprovação nunca desfaz revogação; revogação sempre vence). */
const NOW_MS = Date.parse("2026-11-17T12:00:00.000Z");
const SECOND_MS = 1000;

interface FakeEvent extends StoredEventState {
  payload: unknown;
}

interface FakeEnrollment {
  email: string;
  courseSlug: string;
  status: string;
}

class FakeStore implements KiwifyStore {
  readonly events = new Map<string, FakeEvent>();
  readonly enrollments = new Map<string, FakeEnrollment>();
  readonly grants: { email: string; courseSlug: string; orderId: string }[] = [];
  readonly revokes: { orderId: string; courseSlug: string | null; status: string }[] = [];
  readonly invites: string[] = [];
  failOn: "grant" | "invite" | "claim" | null = null;
  failMarkFailed = false;
  nowMs = NOW_MS;

  seed(key: string, state: Partial<StoredEventState>): void {
    this.events.set(key, {
      processedAt: null,
      error: null,
      receivedAt: new Date(this.nowMs).toISOString(),
      payload: {},
      ...state,
    });
  }

  stateOf(key: string): "processed" | "failed" | "pending" | undefined {
    const event = this.events.get(key);
    if (!event) return undefined;
    if (event.processedAt) return "processed";
    return event.error !== null ? "failed" : "pending";
  }

  async claimEvent(input: { orderId: string; eventType: string; payload: unknown }): Promise<ClaimResult> {
    if (this.failOn === "claim") throw new Error("banco indisponível");
    const key = `${input.orderId}|${input.eventType}`;
    const receivedAt = new Date(this.nowMs).toISOString();
    const existing = this.events.get(key);
    if (!existing) {
      this.events.set(key, { processedAt: null, error: null, receivedAt, payload: input.payload });
      return "new";
    }
    const verdict = classifyExistingEvent(existing, this.nowMs);
    if (verdict === "retry") this.events.set(key, { ...existing, error: null, receivedAt });
    return verdict;
  }

  async grantEnrollment(input: { email: string; courseSlug: string; orderId: string }): Promise<void> {
    if (this.failOn === "grant") throw new Error("falha ao gravar");
    this.grants.push(input);
    const key = `${input.orderId}|${input.courseSlug}`;
    /* ignoreDuplicates: uma matrícula existente (inclusive revogada) não muda. */
    if (!this.enrollments.has(key)) {
      this.enrollments.set(key, { email: input.email, courseSlug: input.courseSlug, status: "active" });
    }
  }

  async revokeEnrollment(input: {
    orderId: string;
    courseSlug: string | null;
    status: string;
    email: string | null;
  }): Promise<number> {
    this.revokes.push(input);
    if (input.courseSlug && input.email) {
      /* upsert que atualiza o status: cria já revogada ou revoga a existente. */
      this.enrollments.set(`${input.orderId}|${input.courseSlug}`, {
        email: input.email,
        courseSlug: input.courseSlug,
        status: input.status,
      });
      return 1;
    }
    let affected = 0;
    for (const [key, enrollment] of this.enrollments) {
      const sameOrder = key.startsWith(`${input.orderId}|`);
      if (sameOrder && (!input.courseSlug || enrollment.courseSlug === input.courseSlug)) {
        this.enrollments.set(key, { ...enrollment, status: input.status });
        affected += 1;
      }
    }
    return affected;
  }

  async inviteStudent(email: string): Promise<void> {
    if (this.failOn === "invite") throw new Error("convite falhou");
    this.invites.push(email);
  }

  async markProcessed(orderId: string, eventType: string): Promise<void> {
    const key = `${orderId}|${eventType}`;
    const event = this.events.get(key);
    if (event) this.events.set(key, { ...event, processedAt: new Date(this.nowMs).toISOString(), error: null });
  }

  async markFailed(orderId: string, eventType: string, message: string): Promise<void> {
    if (this.failMarkFailed) throw new Error("banco indisponível ao marcar falha");
    const key = `${orderId}|${eventType}`;
    const event = this.events.get(key);
    if (event) this.events.set(key, { ...event, error: message });
  }
}

function setup(): { store: FakeStore; logs: string[]; deps: KiwifyHandlerDeps } {
  const store = new FakeStore();
  const logs: string[] = [];
  const deps: KiwifyHandlerDeps = {
    tokens: [TOKEN, PREVIOUS_TOKEN],
    store,
    resolveCourseSlug,
    log: (message, meta) => logs.push(`${message} ${meta.orderId} ${meta.eventType}`),
  };
  return { store, logs, deps };
}

function post(body: string, deps: KiwifyHandlerDeps, signature = sign(body)) {
  return handleKiwifyWebhook(body, signature, deps);
}

test.describe("Kiwify: handler", () => {
  test("compra aprovada cria uma matrícula e um convite", async () => {
    const { store, deps } = setup();
    const result = await post(FIXTURE, deps);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ ok: true, result: "processed", action: "grant" });
    expect(store.grants).toEqual([{ email: "aluna@example.com", courseSlug: COURSE_SLUG, orderId: "fixture-order-0001", productId: PRODUCT_ID }]);
    expect(store.invites).toEqual(["aluna@example.com"]);
  });

  test("o mesmo evento duas vezes não gera segundo convite", async () => {
    const { store, deps } = setup();
    await post(FIXTURE, deps);
    const second = await post(FIXTURE, deps);
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ result: "duplicate" });
    expect(store.grants).toHaveLength(1);
    expect(store.invites).toHaveLength(1);
  });

  test("assinatura inválida: 401, sem tocar no banco; sem token: 503; JSON inválido: 400", async () => {
    const { store, deps } = setup();
    expect((await post(FIXTURE, deps, "0".repeat(40))).status).toBe(401);
    expect((await handleKiwifyWebhook(FIXTURE, null, deps)).status).toBe(401);
    expect(store.events.size).toBe(0);
    expect((await post(FIXTURE, { ...deps, tokens: [] })).status).toBe(503);
    expect((await post("{não é json", deps)).status).toBe(400);
  });

  test("reembolso e chargeback revogam a matrícula", async () => {
    const { store, deps } = setup();
    const refund = fixtureWith({ order_status: "refunded", webhook_event_type: "order_refunded" });
    expect((await post(refund, deps)).body).toMatchObject({ action: "revoke" });
    const chargeback = fixtureWith({ order_status: "chargedback", webhook_event_type: "chargeback" });
    expect((await post(chargeback, deps)).status).toBe(200);
    expect(store.revokes).toEqual([
      { orderId: "fixture-order-0001", courseSlug: COURSE_SLUG, status: "refunded", email: "aluna@example.com", productId: PRODUCT_ID },
      { orderId: "fixture-order-0001", courseSlug: COURSE_SLUG, status: "chargeback", email: "aluna@example.com", productId: PRODUCT_ID },
    ]);
    expect(store.invites).toHaveLength(0);
  });

  test("pix_created só é registrado", async () => {
    const { store, deps } = setup();
    const body = fixtureWith({ order_status: "waiting_payment", webhook_event_type: "pix_created" });
    const result = await post(body, deps);
    expect(result.body).toMatchObject({ ok: true, result: "ignored" });
    expect(store.stateOf("fixture-order-0001|pix_created")).toBe("processed");
    expect(store.grants).toHaveLength(0);
    expect(store.invites).toHaveLength(0);
  });

  test("produto desconhecido é registrado sem matrícula", async () => {
    const { store, deps } = setup();
    const body = fixtureWith({ Product: { product_id: "produto-da-loja" } });
    const result = await post(body, deps);
    expect(result.body).toMatchObject({ result: "ignored", reason: "produto_sem_curso" });
    expect(store.stateOf("fixture-order-0001|order_approved")).toBe("processed");
    expect(store.grants).toHaveLength(0);
    expect(store.invites).toHaveLength(0);
  });

  test("compra aprovada sem e-mail fica com erro e o reenvio é processado de novo", async () => {
    const { store, deps } = setup();
    const semEmail = fixtureWith({ Customer: {} });
    const first = await post(semEmail, deps);
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ result: "ignored", reason: "sem_email" });
    expect(store.stateOf("fixture-order-0001|order_approved")).toBe("failed");
    expect(store.grants).toHaveLength(0);

    const resent = await post(FIXTURE, deps);
    expect(resent.body).toMatchObject({ result: "processed", action: "grant" });
    expect(store.grants).toHaveLength(1);
    expect(store.invites).toHaveLength(1);
  });

  test("o vetor da documentação (sem produto nem cliente) é aceito e registrado", async () => {
    const { store, deps } = setup();
    const result = await handleKiwifyWebhook(DOCS_BODY, DOCS_SIGNATURE, { ...deps, tokens: [DOCS_TOKEN] });
    expect(result.status).toBe(200);
    expect(store.grants).toHaveLength(0);
  });

  test("payload assinado sem order_id: 200 ignorado, nada gravado", async () => {
    const { store, deps } = setup();
    const result = await post('{"checkout_link":"abc"}', deps);
    expect(result.status).toBe(200);
    expect(store.events.size).toBe(0);
  });

  test("falha ao gravar: 500, e o reenvio da Kiwify processa de novo", async () => {
    const { store, deps } = setup();
    store.failOn = "invite";
    expect((await post(FIXTURE, deps)).status).toBe(500);
    expect(store.stateOf("fixture-order-0001|order_approved")).toBe("failed");

    store.failOn = null;
    const retry = await post(FIXTURE, deps);
    expect(retry.status).toBe(200);
    expect(retry.body).toMatchObject({ result: "processed" });
    expect(store.invites).toEqual(["aluna@example.com"]);
  });

  test("falha ao reservar o evento: 500", async () => {
    const { store, deps } = setup();
    store.failOn = "claim";
    expect((await post(FIXTURE, deps)).status).toBe(500);
  });

  test("o log traz só o pedido e o tipo do evento, nunca e-mail", async () => {
    const { logs, deps } = setup();
    await post(FIXTURE, deps);
    expect(logs.length).toBeGreaterThan(0);
    for (const line of logs) {
      expect(line).toContain("fixture-order-0001 order_approved");
      expect(line.toLowerCase()).not.toContain("example.com");
    }
  });
});

const APPROVED_KEY = "fixture-order-0001|order_approved";
const REFUND_BODY = () => fixtureWith({ order_status: "refunded", webhook_event_type: "order_refunded" });
const ENROLLMENT_KEY = `fixture-order-0001|${COURSE_SLUG}`;

test.describe("Kiwify: reenvio de evento (200 só se já processado)", () => {
  test("classifyExistingEvent: processado, falho, em andamento e vencido", () => {
    const at = (ageMs: number) => new Date(NOW_MS - ageMs).toISOString();
    const base = { processedAt: null, error: null, receivedAt: at(0) };
    expect(classifyExistingEvent({ ...base, processedAt: at(0) }, NOW_MS)).toBe("duplicate");
    expect(classifyExistingEvent({ ...base, processedAt: at(0), receivedAt: at(RECLAIM_WINDOW_MS * 10) }, NOW_MS)).toBe(
      "duplicate",
    );
    expect(classifyExistingEvent({ ...base, error: "falha" }, NOW_MS)).toBe("retry");
    expect(classifyExistingEvent({ ...base, receivedAt: at(RECLAIM_WINDOW_MS - 1) }, NOW_MS)).toBe("in_flight");
    expect(classifyExistingEvent({ ...base, receivedAt: at(RECLAIM_WINDOW_MS) }, NOW_MS)).toBe("retry");
    expect(classifyExistingEvent({ ...base, receivedAt: "data inválida" }, NOW_MS)).toBe("retry");
    expect(RECLAIM_WINDOW_MS).toBe(60 * SECOND_MS);
  });

  test("evento já processado: 200 duplicado, sem novo processamento", async () => {
    const { store, deps } = setup();
    store.seed(APPROVED_KEY, { processedAt: new Date(NOW_MS - 10 * 60 * SECOND_MS).toISOString() });
    const result = await post(FIXTURE, deps);
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ ok: true, result: "duplicate" });
    expect(store.grants).toHaveLength(0);
    expect(store.invites).toHaveLength(0);
  });

  test("evento em andamento (reservado há 30 s): 409 para a Kiwify reenviar, sem processar", async () => {
    const { store, deps } = setup();
    store.seed(APPROVED_KEY, { receivedAt: new Date(NOW_MS - 30 * SECOND_MS).toISOString() });
    const result = await post(FIXTURE, deps);
    expect(result.status).toBe(409);
    expect(result.body).toEqual({ error: "evento em processamento" });
    expect(store.grants).toHaveLength(0);
    expect(store.invites).toHaveLength(0);
    expect(store.stateOf(APPROVED_KEY)).toBe("pending");
  });

  test("evento reservado há mais de 60 s sem resultado: reprocessado", async () => {
    const { store, deps } = setup();
    store.seed(APPROVED_KEY, { receivedAt: new Date(NOW_MS - 61 * SECOND_MS).toISOString() });
    const result = await post(FIXTURE, deps);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ result: "processed", action: "grant" });
    expect(store.grants).toHaveLength(1);
    expect(store.invites).toEqual(["aluna@example.com"]);
    expect(store.stateOf(APPROVED_KEY)).toBe("processed");
  });

  test("evento que falhou antes: reprocessado mesmo recente", async () => {
    const { store, deps } = setup();
    store.seed(APPROVED_KEY, { error: "convite falhou" });
    const result = await post(FIXTURE, deps);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ result: "processed" });
    expect(store.invites).toHaveLength(1);
    expect(store.stateOf(APPROVED_KEY)).toBe("processed");
  });

  test("tentativa que travou: 409 enquanto recente, 200 processado vencida a janela, depois duplicado", async () => {
    const { store, deps } = setup();
    store.seed(APPROVED_KEY, {});
    expect((await post(FIXTURE, deps)).status).toBe(409);
    store.nowMs += RECLAIM_WINDOW_MS + SECOND_MS;
    expect((await post(FIXTURE, deps)).status).toBe(200);
    expect(store.grants).toHaveLength(1);
    store.nowMs += SECOND_MS;
    expect((await post(FIXTURE, deps)).body).toEqual({ ok: true, result: "duplicate" });
    expect(store.grants).toHaveLength(1);
  });

  test("markFailed que também falha: 500 e aviso no log só com pedido e tipo", async () => {
    const { store, logs, deps } = setup();
    store.failOn = "invite";
    store.failMarkFailed = true;
    expect((await post(FIXTURE, deps)).status).toBe(500);
    const warning = logs.find((line) => line.includes("não foi possível marcar o evento como falho"));
    expect(warning).toBeDefined();
    expect(warning).toContain("fixture-order-0001 order_approved");
    for (const line of logs) expect(line.toLowerCase()).not.toContain("example.com");

    /* O evento ficou em andamento: o reenvio imediato espera (409); depois da janela é processado. */
    store.failOn = null;
    store.failMarkFailed = false;
    expect((await post(FIXTURE, deps)).status).toBe(409);
    store.nowMs += RECLAIM_WINDOW_MS + SECOND_MS;
    expect((await post(FIXTURE, deps)).status).toBe(200);
  });
});

test.describe("Kiwify: reembolso e corrida com a aprovação", () => {
  test("reembolso antes da aprovação registra a matrícula revogada; a aprovação atrasada não reativa", async () => {
    const { store, deps } = setup();
    expect((await post(REFUND_BODY(), deps)).status).toBe(200);
    expect(store.enrollments.get(ENROLLMENT_KEY)?.status).toBe("refunded");
    expect((await post(FIXTURE, deps)).status).toBe(200);
    expect(store.enrollments.get(ENROLLMENT_KEY)?.status).toBe("refunded");
  });

  test("reembolso depois da aprovação revoga o acesso", async () => {
    const { store, deps } = setup();
    await post(FIXTURE, deps);
    expect(store.enrollments.get(ENROLLMENT_KEY)?.status).toBe("active");
    await post(REFUND_BODY(), deps);
    expect(store.enrollments.get(ENROLLMENT_KEY)?.status).toBe("refunded");
  });

  test("chargeback depois de reembolso troca o status", async () => {
    const { store, deps } = setup();
    await post(FIXTURE, deps);
    await post(REFUND_BODY(), deps);
    await post(fixtureWith({ order_status: "chargedback", webhook_event_type: "chargeback" }), deps);
    expect(store.enrollments.get(ENROLLMENT_KEY)?.status).toBe("chargeback");
  });

  test("reembolso sem produto revoga o pedido inteiro e informa a observação", async () => {
    const { store, deps } = setup();
    await post(FIXTURE, deps);
    const noProduct = JSON.stringify({
      order_id: "fixture-order-0001",
      order_status: "refunded",
      webhook_event_type: "order_refunded",
    });
    const result = await post(noProduct, deps);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ result: "processed", action: "revoke", note: "revogou_pedido_inteiro" });
    expect(store.enrollments.get(ENROLLMENT_KEY)?.status).toBe("refunded");
    expect(store.stateOf("fixture-order-0001|order_refunded")).toBe("processed");
  });

  test("reembolso sem produto e sem matrícula do pedido: processado, com observação", async () => {
    const { store, deps } = setup();
    const noProduct = JSON.stringify({
      order_id: "fixture-order-0002",
      order_status: "refunded",
      webhook_event_type: "order_refunded",
    });
    const result = await post(noProduct, deps);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ result: "processed", note: "sem_matricula_do_pedido" });
    expect(store.enrollments.size).toBe(0);
    expect(store.stateOf("fixture-order-0002|order_refunded")).toBe("processed");
  });
});

test.describe("Kiwify: retenção mínima do payload (LGPD)", () => {
  test("grava só order_id, order_status, webhook_event_type e product_id", async () => {
    const { store, deps } = setup();
    await post(FIXTURE, deps);
    const stored = store.events.get(APPROVED_KEY)?.payload;
    expect(stored).toEqual({
      order_id: "fixture-order-0001",
      order_status: "paid",
      webhook_event_type: "order_approved",
      product_id: PRODUCT_ID,
    });
    const text = JSON.stringify(stored).toLowerCase();
    for (const personal of ["example.com", "aluna", "full_name", "customer", "product_name"]) {
      expect(text).not.toContain(personal);
    }
  });

  test("evento sem produto grava product_id nulo", async () => {
    const { store, deps } = setup();
    await handleKiwifyWebhook(DOCS_BODY, DOCS_SIGNATURE, { ...deps, tokens: [DOCS_TOKEN] });
    expect(store.events.get("9b1c2d3e-0000-4000-8000-000000000001|order_approved")?.payload).toEqual({
      order_id: "9b1c2d3e-0000-4000-8000-000000000001",
      order_status: "paid",
      webhook_event_type: "order_approved",
      product_id: null,
    });
  });
});

test.describe("Kiwify: link de checkout", () => {
  test("aceita https em kiwify.com.br e subdomínios", () => {
    expect(validatedCheckoutUrl("https://pay.kiwify.com.br/AbC123")).toBe("https://pay.kiwify.com.br/AbC123");
    expect(validatedCheckoutUrl("https://kiwify.com.br/x")).toBe("https://kiwify.com.br/x");
  });

  test("recusa http, domínio parecido, credenciais, javascript: e vazio", () => {
    for (const value of [
      "http://pay.kiwify.com.br/x",
      "https://evilkiwify.com.br/x",
      "https://kiwify.com.br.evil.com/x",
      "https://user:senha@pay.kiwify.com.br/x",
      "javascript:alert(1)",
      "pay.kiwify.com.br/x",
      "",
      null,
    ]) {
      expect(validatedCheckoutUrl(value)).toBeNull();
    }
  });
});

test.describe("Kiwify: rota HTTP", () => {
  test("POST sem configuração responde 503", async ({ request }) => {
    const response = await request.post("/api/kiwify/webhook?signature=" + "0".repeat(40), {
      data: FIXTURE,
      headers: { "content-type": "application/json" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(503);
    expect(await response.json()).toEqual({ error: "webhook não configurado" });
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("outros métodos respondem 405 com Allow: POST", async ({ request }) => {
    for (const method of ["get", "put", "delete"] as const) {
      const response = await request[method]("/api/kiwify/webhook", { maxRedirects: 0 });
      expect(response.status()).toBe(405);
      expect(response.headers()["allow"]).toBe("POST");
    }
  });
});
