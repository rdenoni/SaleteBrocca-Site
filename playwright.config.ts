import { defineConfig } from "@playwright/test";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "./src/lib/consent-constants";

/* Testa o build de produção (estável, igual ao site publicado) numa porta própria,
   para não disputar com o `npm run dev` na 3000. */
const PORT = 3100;

/* Escolha de cookies já feita (LGPD): sem isso o aviso de cookies cobriria a base da tela em todos os testes.
   Chave e versão vêm do próprio site (src/lib/consent-constants.ts), então não divergem. tests/lgpd.spec.ts
   zera este estado para testar o aviso de verdade. */
const ACCEPTED_CONSENT = JSON.stringify({
  version: CONSENT_VERSION,
  timestamp: "2026-01-01T00:00:00.000Z",
  necessary: true,
  analytics: false,
  marketing: false,
});

/* Usa o Microsoft Edge instalado (channel "msedge"): nenhum navegador é baixado. */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  /* Fixo em 6: com o padrão (metade dos núcleos = 12 aqui) o Edge deixa de pintar quadros sob carga e os testes de
     animação e navegação travam (cliques sem efeito, timeouts de 30s). Com 6 a suíte é estável. */
  workers: 6,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "msedge",
    locale: "pt-BR",
    storageState: {
      cookies: [],
      origins: [
        { origin: `http://localhost:${PORT}`, localStorage: [{ name: CONSENT_STORAGE_KEY, value: ACCEPTED_CONSENT }] },
      ],
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "mobile", use: { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
