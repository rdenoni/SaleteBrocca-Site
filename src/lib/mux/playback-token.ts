import { createPrivateKey, sign, type KeyObject } from "node:crypto";

/* Token JWT da reprodução assinada da Mux (https://www.mux.com/docs/guides/signing-jwts): RS256 com `node:crypto`,
   sem pacote extra. Funções puras (recebem chave e relógio), para o teste conferir a assinatura. Só servidor. */

/** Para que serve o token: "v" vídeo, "t" miniatura, "s" storyboard (prévia na barra do player). */
export type PlaybackAudience = "v" | "t" | "s";

export interface SigningKey {
  keyId: string;
  privateKey: KeyObject;
}

/** A Mux exige que o token valha além do fim do vídeo: margem para pausas e trechos assistidos de novo. */
export const EXPIRY_MARGIN_SECONDS = 2 * 60 * 60;
/** Validade quando a duração do vídeo ainda não foi gravada no banco. */
export const DEFAULT_VALIDITY_SECONDS = 4 * 60 * 60;

/** Chave de assinatura no formato da Mux (PEM em base64). Erro claro se o texto colado não for uma chave privada. */
export function decodeSigningKey(keyId: string, privateKeyBase64: string): SigningKey {
  const pem = Buffer.from(privateKeyBase64, "base64").toString("utf8");
  try {
    return { keyId, privateKey: createPrivateKey(pem) };
  } catch {
    throw new Error("MUX_SIGNING_PRIVATE_KEY não é uma chave privada válida (esperado: o base64 que a Mux entrega).");
  }
}

/** `exp` do token, em segundos desde 1970. */
export function playbackExpiry(nowSeconds: number, durationSeconds: number | null): number {
  const validity =
    durationSeconds && durationSeconds > 0 ? Math.ceil(durationSeconds) + EXPIRY_MARGIN_SECONDS : DEFAULT_VALIDITY_SECONDS;
  return Math.floor(nowSeconds) + validity;
}

function base64url(text: string): string {
  return Buffer.from(text).toString("base64url");
}

export function signPlaybackToken(
  playbackId: string,
  audience: PlaybackAudience,
  expiresAt: number,
  key: SigningKey,
): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: key.keyId }));
  const payload = base64url(JSON.stringify({ sub: playbackId, aud: audience, exp: expiresAt, kid: key.keyId }));
  const data = `${header}.${payload}`;
  const signature = sign("RSA-SHA256", Buffer.from(data), key.privateKey).toString("base64url");
  return `${data}.${signature}`;
}
