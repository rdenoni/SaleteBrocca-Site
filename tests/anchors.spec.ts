import { expect, test, type Locator, type Page } from "@playwright/test";

/* Âncoras com o cabeçalho inteligente: ao saltar para cima, a pílula fixa reaparece e não pode cobrir o alvo
   (na mesma página e vindo de outra). Cobre também o foco após chegar numa #âncora e o tamanho dos alvos dos links
   do rodapé. O rodapé aprovado não tem mais links com #âncora: os saltos são guiados por links que existem no site. */

const banner = (page: Page): Locator => page.getByRole("banner");
/* A pílula branca é o primeiro filho do marco "banner". */
const pill = (page: Page): Locator => banner(page).locator(":scope > div").first();
const footer = (page: Page): Locator => page.getByRole("contentinfo");

const MIN_FOOTER_TARGET = 44;
const FOOTER_COLUMN_COUNT = 3;

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

/* Abre a resposta da dúvida "contato" (acordeão nativo): é de lá que sai o link para o formulário. */
async function openContactFaq(page: Page): Promise<Locator> {
  const item = page.locator("#duvida-contato");
  await item.locator("summary").click();
  await expect(item).toHaveJSProperty("open", true);
  return item.getByRole("link", { name: "Ir para o formulário", exact: true });
}

test.describe("âncoras com o cabeçalho fixo", () => {
  /* Salto para cima na mesma página, por um link real: o índice da privacidade, acionado de baixo da página.
     (click() do elemento, sem rolar: o Playwright rolaria até o índice antes e o salto deixaria de ser de baixo para cima.) */
  test("mesma página: de baixo de /privacidade, o índice leva o título para abaixo da pílula", async ({ page }) => {
    await gotoHydrated(page, "/privacidade");
    await scrollToBottom(page);

    const link = page.getByRole("navigation", { name: "Nesta página" }).getByRole("link", { name: "Dados pedidos" });
    await link.evaluate((anchor) => (anchor as HTMLAnchorElement).click());
    await expect(page).toHaveURL(/\/privacidade#dados$/, { timeout: 15_000 });
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#dados"));
    await expectBelowHeader(page, page.locator("#dados-titulo"));
    await expect(page.locator("#dados-titulo")).toBeInViewport({ ratio: 1 });
  });

  /* Sem link clicável entre as seções de /sobre: o salto é feito pela própria âncora (location.hash), que é o que o
     navegador faz num link comum para a mesma página. */
  test("mesma página: /sobre#formacao, de baixo da página, saltar para #historia respeita a pílula", async ({ page }) => {
    await gotoHydrated(page, "/sobre#formacao");
    await expect(page.locator("#formacao-titulo")).toBeVisible();
    await scrollToBottom(page);

    await page.evaluate(() => {
      window.location.hash = "#historia";
    });
    await expect(page).toHaveURL(/\/sobre#historia$/, { timeout: 15_000 });
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#historia"));
    await expectBelowHeader(page, page.locator("#historia-titulo"));
    await expect(page.locator("#historia-titulo")).toBeInViewport({ ratio: 1 });
  });

  /* Página longa de origem: a rolagem carregada para a página nova pode ser maior que a do alvo, então o salto é para cima. */
  test("/cursos → /contato#formulario: o formulário chega abaixo da pílula", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    const link = await openContactFaq(page);

    await link.click();
    await expect(page).toHaveURL(/\/contato#formulario$/, { timeout: 15_000 });
    await expect(page.locator("#formulario")).toBeVisible();
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#formulario"));
  });

  test("Home → /cursos#duvidas: o título das dúvidas chega abaixo da pílula", async ({ page }) => {
    await gotoHydrated(page, "/");

    await page.getByRole("link", { name: "Ver todas as dúvidas", exact: true }).click();
    await expect(page).toHaveURL(/\/cursos#duvidas$/, { timeout: 15_000 });
    await expect(page.locator("#duvidas-titulo")).toBeVisible();
    await waitForSettled(page);

    await expectBelowHeader(page, page.locator("#duvidas"));
    await expectBelowHeader(page, page.locator("#duvidas-titulo"));
    await expect(page.locator("#duvidas-titulo")).toBeInViewport({ ratio: 1 });
  });
});

test.describe("foco ao chegar numa âncora", () => {
  test("link acionado pelo teclado leva o foco ao alvo, e o Tab segue dali", async ({ page }) => {
    await gotoHydrated(page, "/");
    const link = page.getByRole("link", { name: "Ver todas as dúvidas", exact: true });
    await link.scrollIntoViewIfNeeded();
    /* Uma tecla antes do foco: assim o foco é tratado como de teclado. */
    await page.keyboard.press("Shift");
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/cursos#duvidas$/, { timeout: 15_000 });
    await expect.poll(() => page.evaluate(() => document.activeElement?.id), { timeout: 15_000 }).toBe("duvidas");
    await expect(page.locator("#duvidas")).toHaveAttribute("data-anchor-target", "");

    await page.keyboard.press("Tab");
    const continuesAfterTarget = await page.evaluate(() => {
      const target = document.getElementById("duvidas");
      const active = document.activeElement;
      if (!target || !active || active === target) return false;
      return Boolean(target.compareDocumentPosition(active) & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY));
    });
    expect(continuesAfterTarget).toBe(true);
  });

  test("a resposta da dúvida leva o foco ao formulário de /contato", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    const link = await openContactFaq(page);
    await page.keyboard.press("Shift");
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/contato#formulario$/, { timeout: 15_000 });
    await expect.poll(() => page.evaluate(() => document.activeElement?.id), { timeout: 15_000 }).toBe("formulario");
    await expect(page.locator("#formulario")).toHaveAttribute("data-anchor-target", "");
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
    const columnCount = await columns.count();
    expect(columnCount).toBe(FOOTER_COLUMN_COUNT);
    for (let index = 0; index < columnCount; index += 1) {
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

  test("os links legais da barra inferior têm alvo de 48px", async ({ page }) => {
    await gotoHydrated(page, "/cursos");
    for (const name of ["Política de privacidade", "Termos de uso"]) {
      const link = footer(page).getByRole("link", { name, exact: true });
      await link.scrollIntoViewIfNeeded();
      expect(await link.evaluate((anchor) => (anchor as HTMLElement).offsetHeight)).toBeGreaterThanOrEqual(48);
    }
  });
});
