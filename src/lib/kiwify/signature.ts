import { createHmac, timingSafeEqual } from "node:crypto";

/* A Kiwify assina o corpo bruto da requisição: HMAC-SHA1, em hexadecimal minúsculo, com o token do webhook como
   chave, e manda o resultado no parâmetro `signature` da URL. O token em si nunca trafega. */
const SIGNATURE_HEX = /^[0-9a-f]{40}$/;

function digest(rawBody: string, token: string): Buffer {
  return createHmac("sha1", token).update(rawBody, "utf8").digest();
}

/**
 * Confere a assinatura contra cada token aceito (o atual e, na troca de token, o anterior).
 * `rawBody` precisa ser o texto exato recebido, antes de qualquer JSON.parse.
 */
export function verifyKiwifySignature(
  rawBody: string,
  signature: string | null | undefined,
  tokens: readonly string[],
): boolean {
  if (!signature) return false;
  const received = signature.trim().toLowerCase();
  if (!SIGNATURE_HEX.test(received)) return false;
  const receivedBytes = Buffer.from(received, "hex");

  let matched = false;
  for (const token of tokens) {
    if (!token) continue;
    // Mesmo tamanho (20 bytes) garantido pela regex: timingSafeEqual não lança.
    if (timingSafeEqual(digest(rawBody, token), receivedBytes)) matched = true;
  }
  return matched;
}
