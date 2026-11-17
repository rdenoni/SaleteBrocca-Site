import { expect, test, type Locator, type Page } from "@playwright/test";

/* Âncoras do rodapé com o cabeçalho inteligente: ao saltar para cima, a pílula fixa reaparece e não pode cobrir
   o alvo. Cobre também o foco após chegar de outra página numa #âncora e o tamanho dos alvos dos links do rodapé. */

const banner = (page: Page): Locator => page.getByRole("banner");
/* A pílula branca é o primeiro filho do marco "banner". */
const pill = (page: Page): Locator => banner(page).locator(":scope > div").first();
const footer = (page: Page): Locator => page.getByRole("contentinfo");

const MIN_FOOTER_TARGET = 44;

/* Abre a página e espera a hidratação: o SmartHeader só publica data-header-pin num efeito do cliente.
   Sem isso, sob carga o clique pode cair antes do React ligar os links e se perder. */
async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator("html[data-header-pin]")).toHaveCount(1, { timeout: 15_000 });
}

async function scrollToBottom(page: Page): Promise<void> {
  /* O html tem rolagem suave para âncoras: "instant" evita a animação e o cabeçalho registra a rolagem. */
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(200);
  await page.waitForTimeout(150);
}

/* Espera a rolagem e a animação da pílula pararem: duas leituras iguais seguidas. */
async function waitForSettled(page: Page): Promise<void> {
  let previous = "";
  await expect
    .poll(
      async () => {
        const box = await pill(page).boundingBox();
        const current = `${Math.round(await page.evaluate(() => window.scrollY))}|${Math.round(box?.y ?? -999)}`;
        const stable = current === previous;
        previous = current;
        return stable;
      },
      { timeout: 15_000, intervals: [150] },
    )
    .toBe(true);
}

/* O alvo termina abaixo da pílula (ou a pílula está recolhida, com a base acima da tela). */
async function expectBelowHeader(page: Page, target: Locator): Promise<void> {
  const pillBox = await pill(page).boundingBox();
  const targetTop = await target.evaluate((el) => el.getBoundingClientRect().top);
  const pillBottom = pillBox ? pillBox.y + pillBox.height : 0;
  expect(targetTop).toBeGreaterThanOrEqual(pillBottom);
  expect(targetTop).toBeLessThan((page.viewportSize()?.height ?? 0) / 2);
}

test.describe("âncoras do rodapé com o cabeçalho fixo", () => {
  test("/sobre: de baixo da página, História leva o título para abaixo da pílula", async ({ page }) => {
    await gotoHydrated(page, "/sobre");
    await scrollToBottom(page);

    await footer(page).getByRole("link", { name: "História", exact: true }).click();
    await expect(page).toHaveURL(/\/sobre#historia$/, { timeout: 15_000 });
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#historia"));
    await expectBelowHeader(page, page.locator("#historia-titulo"));
    await expect(page.locator("#historia-titulo")).toBeInViewport({ ratio: 1 });
  });

  test("/cursos → /sobre#formacao: o título chega abaixo da pílula", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    await scrollToBottom(page);

    await footer(page).getByRole("link", { name: "Formação", exact: true }).click();
    await expect(page).toHaveURL(/\/sobre#formacao$/, { timeout: 15_000 });
    await expect(page.locator("#formacao-titulo")).toBeVisible();
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#formacao"));
    await expectBelowHeader(page, page.locator("#formacao-titulo"));
    await expect(page.locator("#formacao-titulo")).toBeInViewport({ ratio: 1 });
  });

  /* Página longa de origem: a rolagem carregada para a página nova é maior que a do alvo, então o salto é para cima. */
  test("/sobre → /contato#formulario: o formulário chega abaixo da pílula", async ({ page }) => {
    await gotoHydrated(page, "/sobre");
    await scrollToBottom(page);

    await footer(page).getByRole("link", { name: "Formulário", exact: true }).click();
    await expect(page).toHaveURL(/\/contato#formulario$/, { timeout: 15_000 });
    await expect(page.locator("#formulario")).toBeVisible();
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#formulario"));
  });
});

test.describe("foco ao chegar numa âncora", () => {
  test("link do rodapé acionado pelo teclado leva o foco ao alvo, e o Tab segue dali", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    const link = footer(page).getByRole("link", { name: "Formação", exact: true });
    await link.scrollIntoViewIfNeeded();
    /* Uma tecla antes do foco: assim o foco é tratado como de teclado. */
    await page.keyboard.press("Shift");
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/sobre#formacao$/, { timeout: 15_000 });
    await expect.poll(() => page.evaluate(() => document.activeElement?.id), { timeout: 15_000 }).toBe("formacao");
    await expect(page.locator("#formacao")).toHaveAttribute("data-anchor-target", "");

    await page.keyboard.press("Tab");
    const continuesAfterTarget = await page.evaluate(() => {
      const target = document.getElementById("formacao");
      const active = document.activeElement;
      if (!target || !active || active === target) return false;
      return Boolean(target.compareDocumentPosition(active) & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY));
    });
    expect(continuesAfterTarget).toBe(true);
  });

  test("sem #âncora, o foco continua no conteúdo principal", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    await footer(page).getByRole("link", { name: "Política de privacidade" }).click();
    await expect(page).toHaveURL(/\/privacidade$/, { timeout: 15_000 });
    await expect.poll(() => page.evaluate(() => document.activeElement?.id), { timeout: 15_000 }).toBe("conteudo");
  });
});

test.describe("links do rodapé", () => {
  test("cada link de coluna tem alvo de pelo menos 44px e os alvos não se sobrepõem", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    await footer(page).scrollIntoViewIfNeeded();

    const columns = footer(page).getByRole("navigation");
    expect(await columns.count()).toBe(4);
    for (let index = 0; index < 4; index += 1) {
      const links = columns.nth(index).getByRole("link");
      const boxes = await links.evaluateAll((anchors) =>
        anchors.map((anchor) => {
          /* offsetHeight é a altura do layout: a entrada animada do rodapé (transform) não a encolhe. */
          const { top } = anchor.getBoundingClientRect();
          return { top, height: (anchor as HTMLElement).offsetHeight };
        }),
      );
      expect(boxes.length).toBeGreaterThan(0);
      boxes.forEach((box, position) => {
        expect(box.height).toBeGreaterThanOrEqual(MIN_FOOTER_TARGET);
        const next = boxes[position + 1];
        if (next) expect(next.top).toBeGreaterThanOrEqual(box.top + box.height - 0.5);
      });
    }
  });
});
