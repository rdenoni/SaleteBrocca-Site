import { expect, test } from "@playwright/test";

test.describe("Biblioteca da Marca", () => {
  test("renderiza hero, 5 guias, paleta clicável e sem rolagem horizontal", async ({ page }) => {
    await page.goto("/biblioteca");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Biblioteca Salete Brocca" })).toBeVisible();

    const links = page.locator("main ul li a");
    await expect(links).toHaveCount(5);

    const swatch = page.getByRole("button", { name: /Navy/ });
    await swatch.click();
    await expect(page.getByRole("status")).toContainText("#0F2438");

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);

    const width = page.viewportSize()?.width ?? 0;
    await page.screenshot({ path: `tests/screenshots/current/biblioteca-${width}.png`, fullPage: true });
  });

  test("todas as subpáginas da biblioteca têm botão Voltar para a Biblioteca", async ({ page }) => {
    for (const path of [
      "/biblioteca/manual-da-marca.html",
      "/biblioteca/design-system.html",
      "/biblioteca/componentes.html",
      "/biblioteca/icones.html",
    ]) {
      await page.goto(path);
      const back = page.getByRole("link", { name: "Voltar para a Biblioteca" });
      await expect(back).toBeVisible();
      await expect(back).toHaveAttribute("href", "/biblioteca");
    }
  });

  test("iconografia exibe os 25 ícones personalizados do Manual da Marca (2021)", async ({ page }) => {
    await page.goto("/biblioteca/icones.html");
    const opts = page.locator("#opts-box");
    if ((await opts.getAttribute("open")) === null) {
      await opts.locator("summary").click();
    }
    const chip = page.locator('#chips button[data-cat="Manual da Marca (2021)"]');
    await expect(chip).toBeVisible();
    await chip.click();
    const cards = page.locator("#grid li.cell:not([hidden])");
    await expect(cards).toHaveCount(25);
    if ((page.viewportSize()?.width ?? 0) === 1440) {
      await page.locator("#grid").scrollIntoViewIfNeeded();
      await page.screenshot({ path: "tests/screenshots/current/icones-manual-1440.png" });
    }
  });
});
