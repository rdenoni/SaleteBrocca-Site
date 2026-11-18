import "server-only";

/** Token atual e, durante a troca, o anterior (KIWIFY_WEBHOOK_TOKEN_PREVIOUS). Vazio = webhook não configurado. */
export function getKiwifyWebhookTokens(): string[] {
  return [process.env.KIWIFY_WEBHOOK_TOKEN, process.env.KIWIFY_WEBHOOK_TOKEN_PREVIOUS]
    .map((token) => token?.trim() ?? "")
    .filter((token) => token !== "");
}
