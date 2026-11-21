import { expect, test, type Page } from "@playwright/test";

async function loadAllImages(page: Page): Promise<void> {
  for (const image of await page.locator("img").all()) {
    if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.offsetParent === null || img.complete),
    undefined,
    { timeout: 15_000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

async function fullPageShot(page: Page, name: string): Promise<void> {
  const width = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `tests/screenshots/current/${name}-${width}.png`, fullPage: true });
}

test.describe("Avaliação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/avaliacao");
  });

  test("uma h1, título da aba e seções", async ({ page }) => {
    await expect(page).toHaveTitle(/Avaliação/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Avaliação" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Quem atende" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Como funciona a avaliação" })).toBeVisible();
    await expect(page.locator("section#formulario")).toHaveCount(1);
  });

  test("retrato: nome e função na legenda da foto (só texto confirmado)", async ({ page }) => {
    const caption = page.locator("#formulario figure figcaption");
    await expect(caption.getByText("Maria Salete Brocca Denoni", { exact: true })).toBeVisible();
    await expect(caption.getByText("Professora e fonoaudióloga clínica", { exact: true })).toBeVisible();
  });

  test("quem atende: especialização, formação e link para /sobre (só texto confirmado)", async ({ page }) => {
    const who = page.locator("#quem-atende");
    await expect(who.getByText("Sou fonoaudióloga clínica e tenho especialização em dificuldade de aprendizagem.")).toBeVisible();
    await expect(who.getByText("mais especificamente dislexia")).toBeVisible();
    await expect(who.getByRole("list", { name: "Formação" }).getByRole("listitem")).toHaveCount(3);
    await expect(who.getByRole("link", { name: "Conheça a trajetória" })).toHaveAttribute("href", "/sobre");
  });

  test("formulário da página: título numa linha, rótulos visíveis e sem '?' decorativo", async ({ page }) => {
    const form = page.locator("#formulario form");
    await expect(page.locator("#formulario").getByRole("heading", { level: 2, name: "Quer marcar uma avaliação?" })).toBeVisible();
    await expect(form.getByText("Nome completo", { exact: true })).toBeVisible();
    await expect(form.getByText("Telefone com DDD", { exact: true })).toBeVisible();
    await expect(form.locator('[aria-hidden="true"]', { hasText: /^\?$/ })).toHaveCount(0);
  });

  test("formulário valida nome e telefone e não envia", async ({ page }) => {
    const form = page.locator("#formulario form");
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(form.getByText("Informe um telefone com DDD.")).toBeVisible();
    await expect(form.getByLabel("Nome completo")).toHaveAttribute("aria-invalid", "true");

    await expect(form.getByText("É preciso aceitar a política de privacidade.")).toBeVisible();

    await form.getByLabel("Nome completo").fill("Maria da Silva");
    await form.getByLabel("Telefone").fill("(48) 99999-0000");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByRole("status")).toContainText("Dados conferidos");
    await expect(form.getByText("Informe seu nome completo.")).toHaveCount(0);
    await expect(form.getByText("É preciso aceitar a política de privacidade.")).toHaveCount(0);
  });

  test("consentimento: caixa desmarcada, um só link para a política e aviso sobre dados de saúde", async ({ page }) => {
    const form = page.locator("#formulario form");
    await expect(form.getByRole("checkbox")).not.toBeChecked();
    await expect(form.getByRole("link", { name: "política de privacidade" })).toHaveCount(1);
    await expect(form.getByText("Não inclua dados de saúde da criança.")).toBeVisible();

    await form.getByLabel("Nome completo").fill("Maria da Silva");
    await form.getByLabel("Telefone").fill("(48) 99999-0000");
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByRole("checkbox")).toBeFocused();
    await expect(form.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    await expect(form.getByRole("status")).not.toContainText("Dados conferidos");
  });

  test("formulário aponta a política de privacidade", async ({ page }) => {
    await expect(page.locator("#formulario form").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });

  test("detalhes não confirmados mostram 'A confirmar'", async ({ page }) => {
    const facts = page.locator("#como-funciona dl");
    await expect(facts.locator("> div")).toHaveCount(4);
    for (const label of ["Local / modalidade", "Horários", "Faixa etária", "Valor"]) {
      const tile = facts.locator("div").filter({ has: page.getByText(label, { exact: true }) });
      await expect(tile.locator(".pending")).toHaveText("A confirmar");
    }
    await expect(facts.locator(".pending")).toHaveCount(4);
  });

  test("como funciona: botão leva ao formulário e não há etapas inventadas", async ({ page }) => {
    const how = page.locator("#como-funciona");
    await expect(how.getByRole("link", { name: "Pedir avaliação" })).toHaveAttribute("href", "#formulario");
    await expect(how.locator("ol")).toHaveCount(0);
  });

  test("só o depoimento real da Daniele, sem simulados nem carrossel", async ({ page }) => {
    const section = page.getByRole("region", { name: "Depoimento" });
    await expect(section.getByText("Daniele Schlichting Fusinato")).toBeVisible();
    await expect(section.locator("blockquote")).toHaveCount(1);
    await expect(page.locator("blockquote")).toHaveCount(1);
    await expect(page.getByText(/simulad/i)).toHaveCount(0);
  });

  test("sem rolagem horizontal e imagens carregadas", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await loadAllImages(page);
    await fullPageShot(page, "avaliacao");
  });
});
