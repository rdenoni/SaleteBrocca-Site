import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

async function fullPageShot(page: Page, name: string): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  const width = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `tests/screenshots/current/${name}-${width}.png`, fullPage: true });
}

test.describe("Privacidade", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/privacidade");
  });

  test("fatos do site, direitos da LGPD e texto jurídico pendente", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidade" })).toBeVisible();
    await expect(page.getByRole("note").filter({ hasText: "Versão provisória." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Formulário de contato" })).toBeVisible();
    await expect(page.getByText("é enviado, armazenado ou compartilhado", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inscrição e compra" })).toHaveAttribute(
      "href",
      "/cursos/dificuldades-na-aprendizagem/compra",
    );
    await expect(page.getByRole("heading", { level: 2, name: "Seus direitos" })).toBeVisible();
    expect(await page.locator("main .pending").count()).toBeGreaterThanOrEqual(5);
  });

  test("índice leva à seção", async ({ page }) => {
    await page.getByRole("navigation", { name: "Nesta página" }).getByRole("link", { name: "Seus direitos" }).click();
    await expect(page).toHaveURL(/#direitos$/);
    await expect(page.getByRole("heading", { level: 2, name: "Seus direitos" })).toBeInViewport();
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "privacidade");
  });
});

test("links de privacidade do formulário e do rodapé funcionam", async ({ page }) => {
  await page.goto("/contato");
  await page.locator("#formulario").getByRole("link", { name: "política de privacidade" }).click();
  await expect(page).toHaveURL("/privacidade");
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Política de privacidade" }).click();
  await expect(page).toHaveURL("/privacidade");
});

test.describe("404", () => {
  test("endereço inexistente mostra a página de erro com saídas", async ({ page }) => {
    const response = await page.goto("/pagina-que-nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Página não encontrada/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Atalhos" }).getByRole("link")).toHaveCount(3);
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "404");
    await page.getByRole("link", { name: "Voltar para o início" }).click();
    await expect(page).toHaveURL("/");
  });
});
