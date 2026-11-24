import { expect, test } from "@playwright/test";

/* Termos de uso: só o aviso de "em preparação", sem nenhuma cláusula, assunto ou prazo inventado, fora dos buscadores. */
test.describe("Termos de uso", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/termos-de-uso");
  });

  test("um h1, o aviso de preparação, uma pendência e link para o contato", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Termos de uso" })).toBeVisible();
    await expect(page.getByRole("note")).toHaveText(/Os termos de uso e de compra estão em preparação\./);
    await expect(page.getByRole("main").locator(".pending")).toHaveCount(1);
    await expect(page.getByRole("main").getByRole("link", { name: "página de contato" })).toHaveAttribute("href", "/contato");
  });

  test("aponta a política de privacidade, sem cláusula nova", async ({ page }) => {
    await expect(page.getByRole("main").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });

  test("fica fora dos buscadores enquanto o texto não existir", async ({ page }) => {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("o rodapé leva à página e não há rolagem horizontal", async ({ page }) => {
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Termos de uso" })).toHaveAttribute(
      "href",
      "/termos-de-uso",
    );
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(viewportWidth).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewportWidth);
  });
});
