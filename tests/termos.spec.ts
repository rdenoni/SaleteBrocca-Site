import { expect, test } from "@playwright/test";

/* Termos de uso publicados: identificação com CRFa, política de reembolso (CDC Art. 49), propriedade intelectual e links legais. */
test.describe("Termos de uso", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/termos-de-uso");
  });

  test("um h1, identificação com CRFa, política de reembolso (7 dias CDC) e links legais", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Termos de uso" })).toBeVisible();
    await expect(page.locator("#identificacao")).toContainText("CRFa/RJ 8589");
    await expect(page.locator("#reembolso")).toContainText("7 (sete) dias corridos");
    await expect(page.locator("#reembolso")).toContainText("Art. 49 do CDC");
    await expect(page.getByRole("main").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
    await expect(page.getByRole("main").getByRole("link", { name: "página de contato" }).first()).toHaveAttribute(
      "href",
      "/contato",
    );
  });

  test("indexável pelos buscadores", async ({ page }) => {
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
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
