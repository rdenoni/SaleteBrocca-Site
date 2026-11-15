import { expect, test, type Page } from "@playwright/test";

const SLUG = "dificuldades-na-aprendizagem";
const TITLE = "Dificuldades na Aprendizagem";

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

async function fullPageShot(page: Page, name: string): Promise<void> {
  for (const image of await page.locator("main img").all()) {
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

test.describe("Loja — catálogo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loja");
  });

  test("só o curso confirmado e as categorias em preparação", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Loja" })).toBeVisible();
    const filters = page.getByRole("navigation", { name: "Categorias da loja" });
    await expect(filters.getByRole("link")).toHaveCount(4);
    await expect(filters.getByRole("link", { name: /Todos/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 3, name: TITLE })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver produto" })).toHaveCount(1);
    await expect(page.getByText("Em preparação")).toHaveCount(2);
  });

  test("filtro de categoria sem produtos mostra estado vazio", async ({ page }) => {
    await page.getByRole("navigation", { name: "Categorias da loja" }).getByRole("link", { name: /Materiais/ }).click();
    await expect(page).toHaveURL(/categoria=materiais$/);
    await expect(page.getByRole("heading", { level: 2, name: "Materiais" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver produto" })).toHaveCount(0);
    await expect(page.getByText("Em preparação")).toBeVisible();
  });

  test("card leva ao produto", async ({ page }) => {
    await page.getByRole("link", { name: "Ver produto" }).click();
    await expect(page).toHaveURL(`/loja/${SLUG}`);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "loja");
  });
});

test.describe("Loja — produto", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/loja/${SLUG}`);
  });

  test("ficha com dados confirmados e pendências", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Trilha de navegação" }).getByRole("link", { name: "Loja" })).toBeVisible();
    await expect(page.getByText("6 módulos · 21 aulas")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "O que inclui" })).toBeVisible();
    await expect(page.getByText("Módulo 5 · Caminho da leitura e encerramento")).toBeVisible();
  });

  test("comprar leva ao checkout do produto", async ({ page }) => {
    await page.getByRole("link", { name: "Comprar" }).filter({ visible: true }).click();
    await expect(page).toHaveURL(`/loja/checkout?produto=${SLUG}`);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "produto");
  });
});

test.describe("Loja — checkout (visual)", () => {
  test("resumo, campos rotulados e pagamento desativado", async ({ page }) => {
    await page.goto(`/loja/checkout?produto=${SLUG}`);
    await expect(page.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Etapas da compra" }).getByRole("listitem")).toHaveCount(3);
    const summary = page.getByRole("complementary", { name: "Resumo do pedido" });
    await expect(summary.getByText(TITLE)).toBeVisible();
    await expect(summary.getByText("A confirmar")).toBeVisible();
    for (const label of ["Nome completo", "E-mail", "Telefone"]) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 3, name: "Forma de pagamento" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "checkout");
  });

  test("sem produto mostra o caminho de volta", async ({ page }) => {
    await page.goto("/loja/checkout");
    await expect(page.getByRole("heading", { level: 2, name: "Nenhum produto selecionado" })).toBeVisible();
    await page.getByRole("link", { name: "Ver a loja" }).click();
    await expect(page).toHaveURL("/loja");
  });
});
