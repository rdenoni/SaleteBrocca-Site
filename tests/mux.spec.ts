import { generateKeyPairSync, verify } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  DEFAULT_VALIDITY_SECONDS,
  EXPIRY_MARGIN_SECONDS,
  decodeSigningKey,
  playbackExpiry,
  signPlaybackToken,
} from "../src/lib/mux/playback-token";

/* Token da reprodução assinada (Mux) e a rota que o entrega. Roda uma vez, no projeto "desktop".
   Chave gerada no próprio teste: nenhum valor real. */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "lógica pura e API: basta rodar uma vez");
});

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const PRIVATE_KEY_BASE64 = Buffer.from(privateKey.export({ type: "pkcs1", format: "pem" })).toString("base64");
const KEY_ID = "kid-ficticio";
const PLAYBACK_ID = "playback-ficticio";

function decodePart(part: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

test("assina um JWT RS256 que a chave pública confere", () => {
  const key = decodeSigningKey(KEY_ID, PRIVATE_KEY_BASE64);
  const token = signPlaybackToken(PLAYBACK_ID, "v", 2_000_000_000, key);
  const [header, payload, signature] = token.split(".");

  expect(decodePart(header)).toEqual({ alg: "RS256", typ: "JWT", kid: KEY_ID });
  expect(decodePart(payload)).toEqual({ sub: PLAYBACK_ID, aud: "v", exp: 2_000_000_000, kid: KEY_ID });
  expect(
    verify("RSA-SHA256", Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, "base64url")),
  ).toBe(true);
});

test("cada uso tem o seu público (vídeo, miniatura, storyboard)", () => {
  const key = decodeSigningKey(KEY_ID, PRIVATE_KEY_BASE64);
  for (const audience of ["v", "t", "s"] as const) {
    const payload = decodePart(signPlaybackToken(PLAYBACK_ID, audience, 2_000_000_000, key).split(".")[1]);
    expect(payload.aud).toBe(audience);
  }
});

test("token alterado não passa na conferência", () => {
  const key = decodeSigningKey(KEY_ID, PRIVATE_KEY_BASE64);
  const [header, , signature] = signPlaybackToken(PLAYBACK_ID, "v", 2_000_000_000, key).split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "outro-video", aud: "v", exp: 2_000_000_000, kid: KEY_ID })).toString(
    "base64url",
  );
  expect(
    verify("RSA-SHA256", Buffer.from(`${header}.${forged}`), publicKey, Buffer.from(signature, "base64url")),
  ).toBe(false);
});

test("validade passa do fim do vídeo; sem duração usa o padrão", () => {
  expect(playbackExpiry(1_000.9, 600)).toBe(1_000 + 600 + EXPIRY_MARGIN_SECONDS);
  expect(playbackExpiry(1_000, 599.2)).toBe(1_000 + 600 + EXPIRY_MARGIN_SECONDS);
  expect(playbackExpiry(1_000, null)).toBe(1_000 + DEFAULT_VALIDITY_SECONDS);
  expect(playbackExpiry(1_000, 0)).toBe(1_000 + DEFAULT_VALIDITY_SECONDS);
});

test("chave colada errada dá erro claro", () => {
  expect(() => decodeSigningKey(KEY_ID, "nao-e-uma-chave")).toThrow("MUX_SIGNING_PRIVATE_KEY");
});

/* Os testes rodam sem Supabase (modo demonstração): a rota nunca entrega token. */
test("rota: aula inexistente responde 404", async ({ request }) => {
  const response = await request.get("/api/aulas/dificuldades-na-aprendizagem/m99-a99/playback");
  expect(response.status()).toBe(404);
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("rota: sem Supabase/chave responde 503 e não entrega token", async ({ request }) => {
  const response = await request.get("/api/aulas/dificuldades-na-aprendizagem/m00-a01/playback");
  expect(response.status()).toBe(503);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ error: "vídeo indisponível no momento" });
});
