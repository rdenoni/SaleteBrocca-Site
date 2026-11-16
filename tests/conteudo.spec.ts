import { expect, test, type Page } from "@playwright/test";

const ARTICLE = "/conteudo/disfagia-sintomas-e-tratamento";

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

async function fullPageShot(page: Page, name: string): Promise<void> {
  for (const image of await page.locator("img").all()) {
    if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.offsetParent === null || img.complete),
    undefined,
    { timeout: 15_000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  const width = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `tests/screenshots/current/${name}-${width}.png`, fullPage: true });
}

test.describe("Conteúdo — biblioteca", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/conteudo");
  });

  test("categorias, destaque e demais artigos", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Conteúdo" })).toBeVisible();
    const categories = page.getByRole("navigation", { name: "Categorias de conteúdo" });
    await expect(categories.getByRole("link")).toHaveCount(4);
    await expect(categories.getByRole("link", { name: /Todos/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 2, name: /^PAC:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Disfagia:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Castigo:/ })).toBeVisible();
    await expect(page.getByText("Novos artigos em breve")).toBeVisible();
  });

  test("títulos de exemplo avisados e fora dos buscadores", async ({ page }) => {
    await expect(page.getByRole("note").filter({ hasText: "Conteúdo de exemplo." })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("destaque leva ao artigo", async ({ page }) => {
    await page.getByRole("link", { name: /^PAC:/ }).click();
    await expect(page).toHaveURL("/conteudo/pac-avaliacao-do-processamento-auditivo");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "conteudo");
  });
});

test.describe("Conteúdo — categoria", () => {
  test("filtra pela categoria e volta para todos", async ({ page }) => {
    await page.goto("/conteudo");
    await page.getByRole("navigation", { name: "Categorias de conteúdo" }).getByRole("link", { name: /Deglutição/ }).click();
    await expect(page).toHaveURL("/conteudo/categoria/degluticao");
    await expect(page.getByRole("heading", { level: 1, name: "Deglutição" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Disfagia:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^PAC:/ })).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    await page.getByRole("link", { name: "Todos os conteúdos" }).click();
    await expect(page).toHaveURL("/conteudo");
  });

  test("categoria inexistente responde 404", async ({ page }) => {
    const response = await page.goto("/conteudo/categoria/nao-existe");
    expect(response?.status()).toBe(404);
  });

  test("link Categorias do rodapé chega aos filtros", async ({ page }) => {
    await page.goto("/conteudo#categorias");
    await expect(page.getByRole("navigation", { name: "Categorias de conteúdo" })).toBeInViewport();
  });
});

test.describe("Conteúdo — artigo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ARTICLE);
  });

  test("título, trilha, autoria e texto ainda não publicado", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: /^Disfagia: Quais os sintomas/ })).toBeVisible();
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail.getByRole("link", { name: "Conteúdo" })).toBeVisible();
    await expect(trail.getByRole("link", { name: "Deglutição" })).toBeVisible();
    await expect(page.getByText("Maria Salete Brocca Denoni").first()).toBeVisible();
    await expect(page.getByText("Data a confirmar")).toHaveCount(0);
    await expect(page.getByText("Artigo de exemplo")).toBeVisible();
    await expect(page.getByText("Texto em preparação")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("chamada final e leia também", async ({ page }) => {
    const cta = page.getByRole("complementary", { name: "Quer entender melhor?" });
    await expect(cta.getByRole("link", { name: "Conhecer os cursos" })).toHaveAttribute("href", "/cursos");
    await expect(cta.getByRole("link", { name: "Fale com a Salete" })).toHaveAttribute("href", "/contato");
    const related = page.getByRole("region", { name: "Leia também" });
    await expect(related.getByRole("heading", { level: 3 })).toHaveCount(2);
    await expect(related.getByRole("heading", { level: 3, name: /^Disfagia:/ })).toHaveCount(0);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "artigo");
  });
});

test("card da Home abre o artigo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Castigo:/ }).click();
  await expect(page).toHaveURL("/conteudo/castigo-13-verdades");
  await expect(page.getByRole("heading", { level: 1, name: /^Castigo:/ })).toBeVisible();
});
