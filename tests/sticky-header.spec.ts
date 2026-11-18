import { expect, test, type Page } from "@playwright/test";

/* Blocos sticky não podem ficar sob o cabeçalho fixo que reaparece ao rolar para cima.
   Só no desktop: abaixo de 1100px os blocos deixam de ser sticky. */
const PAGES = [
  { name: "página do curso", url: "/cursos/dificuldades-na-aprendizagem" },
  { name: "inscrição", url: "/cursos/dificuldades-na-aprendizagem/compra" },
] as const;

async function showHeaderByScrollingUp(page: Page) {
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 6000);
  /* Rolou para baixo: o cabeçalho original saiu da tela (pin continua "rest"); um pouco para cima o fixa.
     Páginas curtas (a inscrição, sem formulário) rolam menos de 500px: o alvo é o fim da página ou 500px. */
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const target = Math.min(500, maxScroll - 2);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(target);
  /* Espera a rolagem para baixo terminar: sob carga ela ainda corre e engoliria o pequeno giro para cima. */
  let previous = -1;
  await expect
    .poll(
      async () => {
        const current = Math.round(await page.evaluate(() => window.scrollY));
        const settled = current === previous;
        previous = current;
        return settled;
      },
      { timeout: 10_000, intervals: [150] },
    )
    .toBe(true);
  await page.mouse.wheel(0, -120);
  await expect(page.locator("html")).toHaveAttribute("data-header-pin", "shown");
}

test.describe("Blocos sticky x cabeçalho fixo", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Blocos só são sticky a partir de 1100px.");
  });

  for (const { name, url } of PAGES) {
    test(`${name}: o bloco sticky fica abaixo do cabeçalho quando ele reaparece`, async ({ page }) => {
      await page.goto(url);
      const banner = page.getByRole("banner");

      const stickyHandle = await page.evaluateHandle(() => {
        const main = document.querySelector("main");
        if (!main) return null;
        return (
          Array.from(main.querySelectorAll<HTMLElement>("*")).find(
            (el) => getComputedStyle(el).position === "sticky",
          ) ?? null
        );
      });
      const sticky = stickyHandle.asElement();
      expect(sticky, "existe um bloco sticky na página").not.toBeNull();

      await showHeaderByScrollingUp(page);

      /* A transição de `top` leva ~320ms: espera assentar. */
      await expect
        .poll(
          async () => {
            const pill = await banner.boundingBox();
            const block = await sticky!.boundingBox();
            if (!pill || !block) return -Infinity;
            return block.y - (pill.y + pill.height);
          },
          { timeout: 5000 },
        )
        .toBeGreaterThanOrEqual(0);
    });
  }
});
