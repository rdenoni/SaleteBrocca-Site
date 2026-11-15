import { defineConfig } from "@playwright/test";

/* Testa o build de produção (estável, igual ao site publicado) numa porta própria,
   para não disputar com o `npm run dev` na 3000. */
const PORT = 3100;

/* Usa o Microsoft Edge instalado (channel "msedge"): nenhum navegador é baixado. */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "msedge",
    locale: "pt-BR",
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
