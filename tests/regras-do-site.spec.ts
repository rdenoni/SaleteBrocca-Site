import { expect, test } from "@playwright/test";

/* Regras que valem para o site inteiro (revisão geral): contraste e áreas de toque. */

const WHITE = "rgb(255, 255, 255)";
const BLUE_STRONG = "rgb(42, 106, 154)";

/* Eyebrows só sobrevivem onde informam algo (rodada frontend-design): estes banners ainda têm um. */
test("eyebrow do banner é branco (ciano só sobre navy)", async ({ page }) => {
  for (const route of ["/privacidade", "/cursos/dificuldades-na-aprendizagem", "/loja/checkout"]) {
    await page.goto(route);
    // Banners fotográficos usam data-surface="photo" (anel de foco branco sobre a foto).
    const eyebrow = page.locator("section[data-surface='photo'] .eyebrow").first();
    await expect(eyebrow).toHaveCSS("color", WHITE);
  }
});

test("eyebrow em fundo claro usa blue-strong (nunca --blue em texto pequeno)", async ({ page }) => {
  await page.goto("/cursos/dificuldades-na-aprendizagem");
  await expect(page.locator("section[aria-labelledby='aprender'] .eyebrow")).toHaveCSS("color", BLUE_STRONG);
});

test("seções sem eyebrow redundante", async ({ page }) => {
  for (const route of ["/", "/sobre", "/cursos", "/loja", "/contato", "/avaliacao", "/termos-de-uso"]) {
    await page.goto(route);
    await expect(page.locator("main .eyebrow").filter({ visible: true })).toHaveCount(0);
  }
});

test("LinkArrow aceita toque 12px acima e abaixo do texto", async ({ page }) => {
  await page.goto("/sobre");
  const link = page.getByRole("link", { name: "Ver cursos" });
  await link.scrollIntoViewIfNeeded();
  const box = await link.boundingBox();
  if (!box) throw new Error("LinkArrow sem caixa");
  const hits = await page.evaluate(
    ({ x, top, bottom }) =>
      [top - 10, bottom + 10].map((y) => document.elementFromPoint(x, y)?.closest("a")?.textContent ?? ""),
    { x: box.x + box.width / 2, top: box.y, bottom: box.y + box.height },
  );
  for (const text of hits) expect(text.toLowerCase()).toContain("ver cursos");
});

test("logo do header tem 48px de altura de toque", async ({ page }) => {
  await page.goto("/");
  const logo = page.getByRole("banner").getByRole("link", { name: "Salete Brocca, página inicial" });
  const box = await logo.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
});
