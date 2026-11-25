import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

async function fullPageShot(page: Page, name: string): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  const width = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `tests/screenshots/current/${name}-${width}.png`, fullPage: true });
}

test.describe("Privacidade", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/privacidade");
  });

  test("fluxos reais de dados, direitos da LGPD e texto jurídico pendente", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidade" })).toBeVisible();
    await expect(page.getByRole("note").filter({ hasText: "Versão provisória." })).toBeVisible();

    const dados = page.locator("#dados");
    await expect(dados.getByRole("link", { name: "Pedido de avaliação" })).toHaveAttribute("href", "/avaliacao#formulario");
    await expect(dados.getByRole("link", { name: "Formulário de contato" })).toHaveAttribute("href", "/contato#formulario");
    await expect(dados.getByRole("link", { name: "Área do Aluno", exact: true })).toHaveAttribute("href", "/area-do-aluno/login");
    await expect(dados.getByRole("link", { name: "Suporte da Área do Aluno", exact: true })).toHaveAttribute(
      "href",
      "/area-do-aluno/suporte",
    );
    await expect(page.locator("#quem")).toContainText("CRFa/RJ 8589");
    /* O site não coleta dados na compra: quem coleta é a Kiwify. */
    await expect(dados.getByText("O site não coleta nome, telefone, endereço nem dados de cartão.", { exact: false })).toBeVisible();
    await expect(dados.getByText("só confere os campos no seu navegador", { exact: false }).first()).toBeVisible();

    for (const title of [
      "Quem somos",
      "Encarregado pelo tratamento de dados e canal de contato",
      "Finalidades e bases legais",
      "Crianças e adolescentes",
      "Com quem compartilhamos",
      "Transferência internacional de dados",
      "Por quanto tempo guardamos os dados",
      "Segurança",
      "Cookies",
      "Seus direitos",
      "Como fazer um pedido sobre seus dados",
      "Alterações desta política",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toBeVisible();
    }

    const sharing = page.locator("#compartilhamento");
    for (const operator of ["Kiwify", "Supabase", "Netlify"]) {
      await expect(sharing.getByText(operator, { exact: true }).first()).toBeVisible();
    }
    await expect(page.locator("#pedidos").getByRole("link", { name: "www.gov.br/anpd" })).toHaveAttribute(
      "href",
      "https://www.gov.br/anpd",
    );
    await expect(page.locator("#pedidos").getByRole("link", { name: "formulário de contato" })).toHaveAttribute(
      "href",
      "/contato#formulario",
    );
    /* CPF/CNPJ, endereço, encarregado, e-mail, transferência e prazos ainda não foram definidos pela cliente. */
    expect(await page.locator("main .pending").count()).toBeGreaterThanOrEqual(8);
  });

  test("cookies: só necessários hoje e botão que reabre as preferências", async ({ page }) => {
    const cookies = page.locator("#cookies");
    await expect(cookies.getByText("Não usamos nenhuma ferramenta de medição de audiência.")).toBeVisible();
    await expect(cookies.getByText("Não usamos cookies de marketing nem de publicidade.")).toBeVisible();
    await cookies.getByRole("button", { name: "Abrir preferências de cookies" }).click();
    await expect(page.getByRole("region", { name: "Aviso de cookies" })).toBeVisible();
  });

  test("índice leva à seção", async ({ page }) => {
    await page.getByRole("navigation", { name: "Nesta página" }).getByRole("link", { name: "Seus direitos" }).click();
    await expect(page).toHaveURL(/#direitos$/);
    await expect(page.getByRole("heading", { level: 2, name: "Seus direitos" })).toBeInViewport();
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "privacidade");
  });
});

test("links de privacidade do formulário e do rodapé funcionam", async ({ page }) => {
  await page.goto("/contato");
  await page.locator("#formulario").getByRole("link", { name: "política de privacidade" }).click();
  await expect(page).toHaveURL("/privacidade");
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Política de privacidade" }).click();
  await expect(page).toHaveURL("/privacidade");
});

test.describe("404", () => {
  test("endereço inexistente mostra a página de erro com saídas", async ({ page }) => {
    const response = await page.goto("/pagina-que-nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Página não encontrada/);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Página não encontrada" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Atalhos" }).getByRole("link")).toHaveCount(3);
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "404");
    await page.getByRole("link", { name: "Voltar para o início" }).click();
    await expect(page).toHaveURL("/");
  });
});
