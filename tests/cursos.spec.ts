import { expect, test, type Page } from "@playwright/test";

const SLUG = "dificuldades-na-aprendizagem";

async function loadAllImages(page: Page): Promise<void> {
  for (const image of await page.locator("main img").all()) {
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

test.describe("Cursos — catálogo", () => {
  test("lista o curso real e leva à página do curso", async ({ page }) => {
    await page.goto("/cursos");
    await expect(page.getByRole("heading", { level: 1, name: "Cursos" })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    const card = page.getByRole("article").filter({ hasText: "Dificuldades na Aprendizagem" });
    await expect(card).toHaveCount(1);
    await card.getByRole("link", { name: "Ver curso" }).click();
    await expect(page).toHaveURL(`/cursos/${SLUG}`);
    await expectNoHorizontalScroll(page);
  });

  test("menu marca Cursos como página atual", async ({ page }) => {
    await page.goto("/cursos");
    const width = page.viewportSize()?.width ?? 0;
    test.skip(width < 1100, "menu desktop só a partir de 1100px");
    await expect(page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Cursos" }))
      .toHaveAttribute("aria-current", "page");
  });
});

test.describe("Cursos — página do curso", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/cursos/${SLUG}`);
  });

  test("mostra só fatos confirmados e marca o resto como pendente", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Dificuldades na Aprendizagem" })).toBeVisible();
    const info = page.getByRole("complementary", { name: "Informações do curso" });
    await expect(info).toContainText("6");
    await expect(info).toContainText("21");
    await expect(info.getByText("A confirmar")).toHaveCount(4);
    await expect(page.getByText(/R\$/)).toHaveCount(0);
  });

  test("seis módulos com 21 aulas no acordeão", async ({ page }) => {
    const modules = page.locator("details");
    await expect(modules).toHaveCount(6);
    await expect(modules.first()).toHaveAttribute("open", "");
    const lessons = await page.locator("details ol li").count();
    expect(lessons).toBe(21);

    const second = modules.nth(1);
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
    await expect(second.getByText("Transtornos específicos da aprendizagem")).toBeVisible();
  });

  test("inscrição leva à página de compra", async ({ page }) => {
    await page.getByRole("link", { name: "Quero me inscrever" }).first().click();
    await expect(page).toHaveURL(`/cursos/${SLUG}/compra`);
  });

  test("sem rolagem horizontal e imagens carregadas", async ({ page }, testInfo) => {
    await expectNoHorizontalScroll(page);
    await loadAllImages(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.screenshot({ path: `tests/screenshots/current/curso-${width}.png`, fullPage: true });
    testInfo.annotations.push({ type: "screenshot", description: `curso-${width}.png` });
  });
});

test.describe("Cursos — compra (visual)", () => {
  test("etapas, campos rotulados e pagamento desativado", async ({ page }, testInfo) => {
    await page.goto(`/cursos/${SLUG}/compra`);
    await expect(page.getByRole("heading", { level: 1, name: "Inscrição" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Etapas da inscrição" }).getByRole("listitem")).toHaveCount(3);
    for (const label of ["Nome completo", "E-mail", "Telefone"]) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();
    await expect(page.getByRole("complementary", { name: "Resumo do pedido" }).getByText("A confirmar")).toBeVisible();
    await expectNoHorizontalScroll(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.screenshot({ path: `tests/screenshots/current/compra-${width}.png`, fullPage: true });
    testInfo.annotations.push({ type: "screenshot", description: `compra-${width}.png` });
  });
});
