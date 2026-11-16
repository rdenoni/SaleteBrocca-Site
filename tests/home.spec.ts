import { expect, test, type Page } from "@playwright/test";

const isDesktop = (width: number): boolean => width >= 1100;

/* Rola até cada imagem visível (dispara o lazy-load do next/image) e espera todas carregarem. */
async function loadAllImages(page: Page): Promise<void> {
  for (const image of await page.locator("main img, footer img").all()) {
    if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.offsetParent === null || img.complete),
    undefined,
    { timeout: 15_000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
}

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mostra as seções na ordem do brief", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Conheça nossos cursos" })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    const headings = await page.locator("main h1, main h2").allTextContents();
    const order = [
      "Conheça nossos cursos",
      "Quer marcaruma avaliação?",
      "Conteúdos em destaque",
      "Maria Salete Brocca Denoni",
      "Cursos em destaque",
      "Marque uma avaliação",
    ];
    expect(headings.map((text) => text.replace(/\s+/g, ""))).toEqual(order.map((text) => text.replace(/\s+/g, "")));

    await expect(page.getByRole("link", { name: "Explorar cursos" }).first()).toHaveAttribute("href", "/cursos");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("conteúdo real do curso: 6 módulos e 21 aulas", async ({ page }) => {
    const card = page.getByRole("article").filter({ hasText: "Dificuldades na Aprendizagem" });
    await expect(card).toContainText("6 módulos");
    await expect(card).toContainText("21 aulas");
  });

  test("Área do Aluno sempre acessível no header", async ({ page }) => {
    const student = page.getByRole("banner").getByRole("link", { name: "Área do Aluno" });
    await expect(student).toBeVisible();
    await expect(student).toHaveAttribute("href", "/area-do-aluno");
  });

  test("menu principal no desktop, menu móvel abaixo de 1100px", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    const desktopNav = page.getByRole("navigation", { name: "Principal", exact: true });
    const menuButton = page.getByRole("button", { name: "Abrir menu" });

    if (isDesktop(width)) {
      await expect(desktopNav).toBeVisible();
      await expect(menuButton).toBeHidden();
      for (const label of ["Cursos", "Sobre", "Conteúdo", "Loja", "Contato"]) {
        await expect(desktopNav.getByRole("link", { name: label })).toBeVisible();
      }
      return;
    }

    await expect(desktopNav).toBeHidden();
    await menuButton.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Conteúdo" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("formulário de avaliação valida nome e telefone", async ({ page }) => {
    const form = page.locator("#avaliacao form");
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(form.getByText("Informe um telefone com DDD.")).toBeVisible();
    await expect(form.getByLabel("Nome completo")).toHaveAttribute("aria-invalid", "true");

    await form.getByLabel("Nome completo").fill("Maria da Silva");
    await form.getByLabel("Telefone").fill("(48) 99999-0000");
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByRole("status")).toContainText("Dados conferidos");
    await expect(form.getByText("Informe seu nome completo.")).toHaveCount(0);
  });

  test("formulário de avaliação aponta a política de privacidade", async ({ page }) => {
    await expect(page.locator("#avaliacao form").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });

  test("artigos de exemplo avisam que são exemplo", async ({ page }) => {
    const section = page.getByRole("region", { name: "Conteúdos em destaque" });
    await expect(section.getByRole("note")).toContainText("Conteúdo de exemplo.");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });

  test("todas as imagens carregam", async ({ page }) => {
    await loadAllImages(page);
    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    expect(broken).toEqual([]);
  });

  test("captura de tela da página inteira", async ({ page }, testInfo) => {
    await loadAllImages(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.screenshot({ path: `tests/screenshots/current/home-${width}.png`, fullPage: true });
    testInfo.annotations.push({ type: "screenshot", description: `home-${width}.png` });
  });
});
