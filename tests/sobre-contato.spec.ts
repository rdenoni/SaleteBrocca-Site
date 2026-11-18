import { expect, test, type Page } from "@playwright/test";

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

async function fullPageShot(page: Page, name: string): Promise<void> {
  const width = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `tests/screenshots/current/${name}-${width}.png`, fullPage: true });
}

test.describe("Sobre", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sobre");
  });

  test("uma h1, seções do rodapé e textos reais", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Maria Salete Brocca Denoni" })).toBeVisible();
    for (const id of ["historia", "formacao", "atuacao"]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    await expect(page.getByText("em 1960, numa escola multisseriada")).toBeVisible();
    await expect(page.getByText("APAE de Cocal do Sul")).toBeVisible();
    await expect(page.getByText("Toda criança, independente da dificuldade")).toBeVisible();
  });

  test("dados ausentes ficam ocultos (nunca inventados nem marcados na página)", async ({ page }) => {
    await expect(page.getByText(/a confirmar/i)).toHaveCount(0);
    await expect(page.getByText(/CRFa/)).toHaveCount(0);
  });

  test("chamada final leva a /avaliacao", async ({ page }) => {
    await expect(
      page.getByRole("region", { name: "Marque uma avaliação" }).getByRole("link", { name: "Marcar avaliação" }),
    ).toHaveAttribute("href", "/avaliacao");
  });

  test("índice leva à seção", async ({ page }) => {
    await page.getByRole("navigation", { name: "Nesta página" }).getByRole("link", { name: "Atuação" }).click();
    await expect(page).toHaveURL(/#atuacao$/);
    await expect(page.getByRole("heading", { level: 2, name: "Onde atua hoje" })).toBeInViewport();
  });

  test("sem rolagem horizontal e imagens carregadas", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await loadAllImages(page);
    await fullPageShot(page, "sobre");
  });
});

test.describe("Contato", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contato");
  });

  test("três canais: WhatsApp, agendamento e formulário", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Contato" })).toBeVisible();
    for (const id of ["whatsapp", "agendamento", "formulario"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("#agendamento é um bloco curto que leva a /avaliacao", async ({ page }) => {
    const block = page.locator("section#agendamento");
    await expect(block).toHaveCount(1);
    await expect(block.getByRole("link", { name: "Pedir avaliação" })).toHaveAttribute("href", "/avaliacao");
    await expect(block.locator("form, input")).toHaveCount(0);
  });

  test("assuntos do formulário: Cursos, Privacidade (LGPD) e Outro assunto (sem Marcar avaliação)", async ({ page }) => {
    const options = await page.locator("#formulario").getByLabel("Assunto").locator("option").allTextContents();
    expect(options).toEqual(["Cursos", "Privacidade e dados pessoais (LGPD)", "Outro assunto"]);
  });

  test("consentimento diz a finalidade, começa desmarcado e o campo de mensagem alerta sobre dados de saúde", async ({
    page,
  }) => {
    const form = page.locator("#formulario");
    await expect(form.getByRole("checkbox")).not.toBeChecked();
    await expect(form.getByText("Concordo com o uso dos meus dados para responder a este contato", { exact: false })).toBeVisible();
    await expect(form.getByText("Não inclua dados de saúde de crianças ou adolescentes.")).toBeVisible();
  });

  test("número e e-mail não confirmados não viram link", async ({ page }) => {
    await expect(page.getByText("Número em confirmação")).toBeVisible();
    await expect(page.getByText("E-mail em confirmação")).toBeVisible();
    await expect(page.locator('a[href^="https://wa.me"], a[href^="mailto:"]')).toHaveCount(0);
  });

  test("WhatsApp vem primeiro no mobile", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    test.skip(width >= 768, "ordem empilhada só no mobile");
    const whatsappTop = await page.locator("#whatsapp").evaluate((el) => el.getBoundingClientRect().top);
    const formTop = await page.locator("#formulario").evaluate((el) => el.getBoundingClientRect().top);
    expect(whatsappTop).toBeLessThan(formTop);
  });

  test("formulário valida e não envia", async ({ page }) => {
    const form = page.locator("#formulario");
    await form.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(form.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(form.getByText("É preciso aceitar a política de privacidade.")).toBeVisible();
    await expect(form.getByLabel("Nome completo")).toBeFocused();

    await form.getByLabel("Nome completo").fill("Maria Teste");
    await form.getByLabel("Telefone").fill("(48) 99999-0000");
    await form.getByLabel("Assunto").selectOption("Cursos");
    await form.getByLabel("Mensagem", { exact: true }).fill("Gostaria de saber mais sobre o curso.");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(form.getByRole("status")).toContainText("O envio online será ativado em breve.");
    await expect(form.locator("[aria-invalid='true']")).toHaveCount(0);
  });

  test("menu marca Contato como página atual", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    test.skip(width < 1100, "menu desktop só a partir de 1100px");
    await expect(page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Contato" }))
      .toHaveAttribute("aria-current", "page");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await loadAllImages(page);
    await fullPageShot(page, "contato");
  });
});
