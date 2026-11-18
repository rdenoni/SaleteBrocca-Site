import { expect, test, type Page } from "@playwright/test";
import { getCourse } from "../src/lib/content/courses";

const SLUG = "dificuldades-na-aprendizagem";

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

  test("mostra só fatos confirmados e oculta o que falta", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Dificuldades na Aprendizagem" })).toBeVisible();
    const info = page.getByRole("complementary", { name: "Informações do curso" });
    await expect(info).toContainText("6");
    await expect(info).toContainText("21");
    await expect(info.getByText("A confirmar")).toHaveCount(0);
    /* Valor confirmado (R$ 598,00) aparece; carga horária, certificado e acesso seguem sem confirmação e ocultos. */
    for (const label of ["Carga horária", "Certificado", "Acesso"]) {
      await expect(info.getByText(label, { exact: true })).toHaveCount(0);
    }
    const price = getCourse(SLUG)?.commercial.price ?? "";
    expect(price).toBeTruthy();
    await expect(info.getByText("Investimento", { exact: true })).toBeVisible();
    await expect(info.getByText(price, { exact: true })).toBeVisible();
  });

  test("seis módulos com 21 aulas no acordeão", async ({ page }) => {
    /* Só o acordeão dos módulos: as dúvidas frequentes, mais abaixo, também usam <details>. */
    const moduleSection = page.locator("section[aria-labelledby='conteudo-curso']");
    const modules = moduleSection.locator("details");
    await expect(modules).toHaveCount(6);
    await expect(modules.first()).toHaveAttribute("open", "");
    const lessons = await moduleSection.locator("details ol li").count();
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
  test("etapas, explicação do fluxo e botão para o checkout da Kiwify (sem formulário)", async ({ page }, testInfo) => {
    await page.goto(`/cursos/${SLUG}/compra`);
    await expect(page.getByRole("heading", { level: 1, name: "Inscrição" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Etapas da inscrição" }).getByRole("listitem")).toHaveCount(3);
    const main = page.getByRole("main");
    /* O site não coleta dados do comprador: o pagamento é feito na Kiwify. */
    await expect(main.locator("form")).toHaveCount(0);
    await expect(main.getByText("O pagamento é feito no ambiente seguro da Kiwify.")).toBeVisible();
    await expect(main.getByText("link para criar sua senha da Área do Aluno")).toBeVisible();
    /* Com o produto publicado na Kiwify: botão para o checkout (mesma aba) e o valor confirmado no resumo. */
    const course = getCourse(SLUG);
    expect(course?.kiwify.checkoutUrl).toBeTruthy();
    expect(course?.commercial.price).toBeTruthy();
    await expect(main.getByRole("link", { name: "Ir para o pagamento" })).toHaveAttribute(
      "href",
      course?.kiwify.checkoutUrl ?? "",
    );
    await expect(main.getByText("Pagamento online em preparação.")).toHaveCount(0);
    await expect(
      page.getByRole("complementary", { name: "Resumo do pedido" }).getByText(course?.commercial.price ?? ""),
    ).toBeVisible();
    await expectNoHorizontalScroll(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.screenshot({ path: `tests/screenshots/current/compra-${width}.png`, fullPage: true });
    testInfo.annotations.push({ type: "screenshot", description: `compra-${width}.png` });
  });
});
