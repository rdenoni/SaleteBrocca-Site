import { expect, test, type Page } from "@playwright/test";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "../src/lib/consent-constants";

/* LGPD: aviso de cookies e avisos nos pontos de coleta. O playwright.config.ts já entrega a escolha de cookies feita
   (para o aviso não cobrir os outros testes); aqui o estado é zerado para testar o aviso de verdade. */
test.use({ storageState: { cookies: [], origins: [] } });

const banner = (page: Page) => page.getByRole("region", { name: "Aviso de cookies" });

async function readStoredConsent(page: Page): Promise<Record<string, unknown> | null> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

test.describe("aviso de cookies", () => {
  test("aparece na primeira visita, diz que hoje só há cookies necessários e leva à política", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByText("apenas cookies necessários", { exact: false })).toBeVisible();
    await expect(banner(page).getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade#cookies",
    );
    for (const name of ["Aceitar todos", "Recusar opcionais", "Personalizar"]) {
      await expect(banner(page).getByRole("button", { name })).toBeVisible();
    }
    /* Não é diálogo: a página continua acessível e o aviso não prende o foco. */
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("Aceitar todos fecha o aviso e a escolha persiste depois de recarregar", async ({ page }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Aceitar todos" }).click();
    await expect(banner(page)).toHaveCount(0);

    const stored = await readStoredConsent(page);
    expect(stored).toMatchObject({ version: CONSENT_VERSION, necessary: true, analytics: true, marketing: true });
    expect(typeof stored?.timestamp).toBe("string");

    await page.reload();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
  });

  test("Recusar opcionais guarda só os necessários", async ({ page }) => {
    await page.goto("/contato");
    await banner(page).getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(banner(page)).toHaveCount(0);
    expect(await readStoredConsent(page)).toMatchObject({ necessary: true, analytics: false, marketing: false });
  });

  test("Personalizar: necessários sempre ligados, opcionais desligados por padrão, e salva a escolha", async ({ page }) => {
    await page.goto("/");
    const customize = banner(page).getByRole("button", { name: "Personalizar" });
    await expect(customize).toHaveAttribute("aria-expanded", "false");
    await customize.click();
    await expect(customize).toHaveAttribute("aria-expanded", "true");

    const necessary = banner(page).getByRole("checkbox", { name: /Necessários/ });
    const analytics = banner(page).getByRole("checkbox", { name: /Medição de audiência/ });
    const marketing = banner(page).getByRole("checkbox", { name: /Marketing/ });
    await expect(necessary).toBeChecked();
    await expect(necessary).toBeDisabled();
    await expect(analytics).not.toBeChecked();
    await expect(marketing).not.toBeChecked();

    await analytics.check();
    await banner(page).getByRole("button", { name: "Salvar preferências" }).click();
    await expect(banner(page)).toHaveCount(0);
    expect(await readStoredConsent(page)).toMatchObject({ necessary: true, analytics: true, marketing: false });
  });

  test("o botão do rodapé reabre as preferências com a escolha atual e leva o foco ao aviso", async ({ page }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Aceitar todos" }).click();
    await expect(banner(page)).toHaveCount(0);

    const footerButton = page.getByRole("contentinfo").getByRole("button", { name: "Preferências de cookies" });
    await footerButton.scrollIntoViewIfNeeded();
    expect(await footerButton.evaluate((element) => (element as HTMLElement).offsetHeight)).toBeGreaterThanOrEqual(48);
    await footerButton.click();

    await expect(banner(page)).toBeVisible();
    await expect(banner(page)).toBeFocused();
    await expect(banner(page).getByRole("checkbox", { name: /Medição de audiência/ })).toBeChecked();

    await banner(page).getByRole("button", { name: "Fechar sem mudar" }).click();
    await expect(banner(page)).toHaveCount(0);
    /* O foco volta ao botão que reabriu o painel, em vez de cair no <body>. */
    await expect(footerButton).toBeFocused();
    expect(await readStoredConsent(page)).toMatchObject({ analytics: true, marketing: true });
  });

  test("mudar a escolha dispara o evento consentchange", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __consent: unknown[] }).__consent = [];
      window.addEventListener("consentchange", (event) => {
        (window as unknown as { __consent: unknown[] }).__consent.push((event as CustomEvent).detail);
      });
    });
    await banner(page).getByRole("button", { name: "Recusar opcionais" }).click();
    const events = await page.evaluate(() => (window as unknown as { __consent: unknown[] }).__consent);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ analytics: false, marketing: false });
  });

  test("escolha de uma versão antiga do aviso é perguntada de novo", async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({ version: 0, timestamp: "2020-01-01T00:00:00.000Z", necessary: true, analytics: true, marketing: true }),
      );
    }, CONSENT_STORAGE_KEY);
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
  });

  test("a política abre as preferências pelo botão da seção Cookies", async ({ page }) => {
    await page.goto("/privacidade");
    await banner(page).getByRole("button", { name: "Recusar opcionais" }).click();
    await page.locator("#cookies").getByRole("button", { name: "Abrir preferências de cookies" }).click();
    await expect(banner(page)).toBeVisible();
  });

  test("navegável pelo teclado e sem rolagem horizontal", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    await expectNoHorizontalScroll(page);

    await banner(page).getByRole("button", { name: "Personalizar" }).click();
    await expectNoHorizontalScroll(page);
    const box = await banner(page).boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("sem caixa do aviso");
    /* Painel aberto cabe na tela (rola por dentro) e fica colado na base. */
    expect(box.height).toBeLessThanOrEqual(viewport.height * 0.81);
    expect(box.y + box.height).toBeGreaterThanOrEqual(viewport.height - 1);

    for (const name of ["Aceitar todos", "Recusar opcionais", "Personalizar"]) {
      const height = await banner(page).getByRole("button", { name }).evaluate((element) => (element as HTMLElement).offsetHeight);
      expect(height).toBeGreaterThanOrEqual(48);
    }

    await banner(page).getByRole("button", { name: "Aceitar todos" }).focus();
    await expect(banner(page).getByRole("button", { name: "Aceitar todos" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(banner(page).getByRole("button", { name: "Recusar opcionais" })).toBeFocused();
  });

  test("o HTML do servidor não traz o aviso e a hidratação não gera erro", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await page.request.get("/");
    expect(await response.text()).not.toContain("Aviso de cookies");
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([]);
  });
});

test.describe("avisos nos pontos de coleta", () => {
  test("rodapé tem o botão de preferências ao lado dos links legais", async ({ page }) => {
    await page.goto("/sobre");
    await banner(page).getByRole("button", { name: "Recusar opcionais" }).click();
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Política de privacidade" })).toBeVisible();
    await expect(footer.getByRole("button", { name: "Preferências de cookies" })).toBeVisible();
  });

  test("login da Área do Aluno aponta a política de privacidade", async ({ page }) => {
    await page.goto("/area-do-aluno/login");
    await banner(page).getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(page.getByRole("main").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });

  test("a política aponta o formulário de contato com o assunto de privacidade", async ({ page }) => {
    await page.goto("/privacidade");
    await banner(page).getByRole("button", { name: "Recusar opcionais" }).click();
    await expect(page.locator("#encarregado").getByRole("link", { name: "formulário de contato" })).toHaveAttribute(
      "href",
      "/contato#formulario",
    );
  });
});
