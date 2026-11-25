import { expect, test } from "@playwright/test";

test.describe("Loja — fotos reais e galeria multi-ângulo", () => {
  test("vitrine da loja carrega todas as fotos dos produtos sem rolagem horizontal", async ({ page }) => {
    await page.goto("/loja");
    const photos = page.locator('img[data-product-photo="true"]');
    const count = await photos.count();
    expect(count).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < count; i++) {
      const photo = photos.nth(i);
      await photo.scrollIntoViewIfNeeded();
      await expect
        .poll(() => photo.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0), {
          timeout: 10_000,
        })
        .toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);

    const width = page.viewportSize()?.width ?? 0;
    if (width === 1440 || width === 375) {
      await page.screenshot({ path: `tests/screenshots/current/loja-fotos-${width}.png`, fullPage: true });
    }
  });

  test("página de produto alterna ângulos na galeria interativa", async ({ page }) => {
    await page.goto("/loja/kit-educador");
    const thumbs = page.getByRole("group", { name: "Fotos de Kit Educador" }).getByRole("button");
    await expect(thumbs).toHaveCount(4);
    await expect(thumbs.nth(0)).toHaveAttribute("aria-pressed", "true");

    await thumbs.nth(1).click();
    await expect(thumbs.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(thumbs.nth(0)).toHaveAttribute("aria-pressed", "false");

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);

    if ((page.viewportSize()?.width ?? 0) === 1440) {
      await page.screenshot({ path: "tests/screenshots/current/produto-kit-1440.png" });
    }
  });
});
