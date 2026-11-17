import { expect, test, type Page } from "@playwright/test";

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

/* A Loja guarda só produtos avulsos (Materiais, Jogos e softwares), e nenhum foi confirmado ainda.
   Os cursos vivem em /cursos; os endereços antigos redirecionam (ver tests/redirects.spec.ts). */
test.describe("Loja — catálogo sem produtos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loja");
  });

  test("sem produto: categorias em preparação, sem curso", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Loja" })).toBeVisible();
    await expect(page.getByText("Materiais de apoio, jogos e softwares de Maria Salete Brocca Denoni.")).toBeVisible();

    const filters = page.getByRole("navigation", { name: "Categorias da loja" });
    await expect(filters.getByRole("link")).toHaveCount(3);
    await expect(filters.getByRole("link", { name: /Todos/ })).toHaveAttribute("aria-current", "page");
    await expect(filters.getByRole("link", { name: /Materiais/ })).toBeVisible();
    await expect(filters.getByRole("link", { name: /Jogos e softwares/ })).toBeVisible();
    await expect(filters.getByRole("link", { name: /Cursos/ })).toHaveCount(0);

    await expect(page.getByRole("heading", { level: 2, name: "Todos os produtos" })).toBeVisible();
    await expect(page.getByText("Nenhum produto disponível ainda")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver produto" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 3, name: "Dificuldades na Aprendizagem" })).toHaveCount(0);
    await expect(page.getByText("Em preparação")).toHaveCount(2);
    await expect(page.getByRole("heading", { level: 3, name: "Materiais" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Jogos e softwares" })).toBeVisible();
  });

  test("filtro Materiais continua funcionando e mostra o estado vazio", async ({ page }) => {
    await page.getByRole("navigation", { name: "Categorias da loja" }).getByRole("link", { name: /Materiais/ }).click();
    await expect(page).toHaveURL(/categoria=materiais$/);
    await expect(page.getByRole("heading", { level: 2, name: "Materiais" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver produto" })).toHaveCount(0);
    await expect(page.getByText("Em preparação")).toBeVisible();
  });

  test("aponta para o catálogo de cursos", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByText("Procurando os cursos?")).toBeVisible();
    await main.getByRole("link", { name: "Ver o catálogo de cursos" }).click();
    await expect(page).toHaveURL("/cursos");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "loja");
  });
});

test.describe("Loja — checkout", () => {
  test("sem produto mostra o caminho de volta", async ({ page }) => {
    await page.goto("/loja/checkout");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Nenhum produto selecionado" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "checkout");

    await page.getByRole("main").getByRole("link", { name: "Ver a loja" }).click();
    await expect(page).toHaveURL("/loja");
  });

  test("produto desconhecido na URL cai no mesmo estado vazio", async ({ page }) => {
    await page.goto("/loja/checkout?produto=nao-existe");
    await expect(page.getByRole("heading", { level: 2, name: "Nenhum produto selecionado" })).toBeVisible();
  });

  test("trilha de navegação: Início › Loja › Finalizar compra", async ({ page }) => {
    await page.goto("/loja/checkout");
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail).toHaveCount(1);
    await expect(trail.getByRole("link")).toHaveText(["Início", "Loja"]);
    await expect(trail.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    await expect(trail.getByRole("link", { name: "Loja" })).toHaveAttribute("href", "/loja");
    await expect(trail.locator("[aria-current='page']")).toHaveText("Finalizar compra");

    await trail.getByRole("link", { name: "Loja" }).click();
    await expect(page).toHaveURL("/loja");
  });
});

test.describe("Loja — produto avulso inexistente", () => {
  test("slug sem produto cadastrado responde 404", async ({ page }) => {
    const response = await page.goto("/loja/qualquer-coisa");
    expect(response?.status()).toBe(404);
  });
});
