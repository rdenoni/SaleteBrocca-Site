import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

async function fullPageShot(page: Page, name: string): Promise<void> {
  for (const image of await page.locator("img").all()) {
    if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.offsetParent === null || img.complete),
    undefined,
    { timeout: 15_000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  const width = page.viewportSize()?.width ?? 0;
  await page.screenshot({ path: `tests/screenshots/current/${name}-${width}.png`, fullPage: true });
}

const COURSE_SLUG = "dificuldades-na-aprendizagem";
const CATEGORIES = [
  { id: "cursos", label: "Cursos", items: 2 },
  { id: "aplicativos", label: "Aplicativos", items: 1 },
  { id: "jogos", label: "Jogos educativos", items: 1 },
  { id: "kits", label: "Kits personalizados", items: 3 },
  { id: "materiais", label: "Materiais em PDF", items: 4 },
] as const;

/* A Loja apresenta cinco categorias: Cursos (vitrine, a compra fica em /cursos/[slug]), Aplicativos,
   Jogos educativos, Kits personalizados e Materiais em PDF. Nenhum preço está confirmado; produtos
   "em breve" aparecem desabilitados. */
test.describe("Loja — catálogo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loja");
  });

  test("filtros seguem a ordem das cinco categorias e o título mostra a visão Todos", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Loja" })).toBeVisible();
    await expect(
      page.getByText("Cursos, aplicativo, jogos educativos, kits personalizados e materiais em PDF de Maria Salete Brocca Denoni."),
    ).toBeVisible();

    const filters = page.getByRole("navigation", { name: "Categorias da loja" });
    await expect(filters.getByRole("link")).toHaveCount(6);
    await expect(filters.getByRole("link", { name: /Todos/ })).toHaveAttribute("aria-current", "page");
    for (const { label } of CATEGORIES) {
      await expect(filters.getByRole("link", { name: new RegExp(label) })).toBeVisible();
    }

    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "Todos os produtos",
      "Procurando os cursos?",
    ]);
  });

  test("Todos: uma grade só com todos os itens, sem repetir o destaque", async ({ page }) => {
    const catalog = page.getByRole("region", { name: "Catálogo da loja" });
    /* 11 itens: 1 em destaque (h3 da seção) + 10 cards na grade. */
    const total = CATEGORIES.reduce((sum, category) => sum + category.items, 0);
    await expect(catalog.getByRole("heading", { level: 3 })).toHaveCount(total);
    await expect(catalog.locator("article")).toHaveCount(total - 1);
    await expect(catalog.locator("article").getByRole("heading", { level: 3, name: "Brinqueletrando Box" })).toHaveCount(0);

    const filters = page.getByRole("navigation", { name: "Categorias da loja" });
    for (const { id, label } of CATEGORIES) {
      await expect(filters.getByRole("link", { name: new RegExp(label) })).toHaveAttribute("href", `/loja?categoria=${id}`);
    }
  });

  test("destaque aparece só em Todos e o Comprar leva ao checkout do produto", async ({ page }) => {
    const featured = page.getByRole("region", { name: "Brinqueletrando Box" });
    await expect(featured.getByText("Destaque", { exact: true })).toBeVisible();
    await expect(featured.getByText("R$ 399,00")).toBeVisible();
    await expect(featured.getByText("Reembolso: a confirmar")).toBeVisible();
    await expect(featured.getByRole("link", { name: "Comprar Brinqueletrando Box" })).toHaveAttribute(
      "href",
      "/loja/checkout?produto=brinqueletrando-box",
    );
    await expect(featured.getByRole("link", { name: "Ver detalhes de Brinqueletrando Box" })).toHaveAttribute(
      "href",
      "/loja/brinqueletrando-box",
    );

    await page.goto("/loja?categoria=jogos");
    await expect(page.getByRole("region", { name: "Brinqueletrando Box" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Comprar/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 3, name: "Brinqueletrando Box" })).toBeVisible();
  });

  test("Cursos: o curso disponível leva a /cursos e o curso em breve não tem link", async ({ page }) => {
    const catalog = page.getByRole("region", { name: "Catálogo da loja" });
    const available = catalog.locator("article", {
      has: page.getByRole("heading", { level: 3, name: "Dificuldades na Aprendizagem" }),
    });
    await expect(available.getByRole("link", { name: "Dificuldades na Aprendizagem" })).toHaveAttribute(
      "href",
      `/cursos/${COURSE_SLUG}`,
    );

    const soon = catalog.locator("article", { has: page.getByRole("heading", { level: 3, name: "Alfabetização" }) });
    await expect(soon.getByText("Em breve", { exact: true })).toBeVisible();
    await expect(soon.getByText("Indisponível no momento")).toBeVisible();
    await expect(soon.getByRole("link")).toHaveCount(0);
    await expect(page.locator("a[href='/cursos/alfabetizacao']")).toHaveCount(0);
  });

  test("Aplicativos: o aplicativo aparece como em breve, indisponível e com link para os detalhes", async ({ page }) => {
    const catalog = page.getByRole("region", { name: "Catálogo da loja" });
    const app = catalog.locator("article", {
      has: page.getByRole("heading", { level: 3, name: "Brinqueletrando", exact: true }),
    });
    await expect(app.getByText("Em breve", { exact: true })).toBeVisible();
    await expect(app.getByText("Indisponível no momento")).toBeVisible();
    await expect(app.getByRole("link", { name: "Brinqueletrando" })).toHaveAttribute("href", "/loja/brinqueletrando-app");
  });

  test("produtos sem foto usam o grafismo da marca, sem imagem de produto inventada", async ({ page }) => {
    await expect(page.locator("img[src*='grafismo-pecas']").first()).toBeAttached();
    await expect(page.locator("main img[src*='products']")).toHaveCount(0);
  });

  test("filtro Aplicativos mostra só a categoria", async ({ page }) => {
    await page.getByRole("navigation", { name: "Categorias da loja" }).getByRole("link", { name: /Aplicativos/ }).click();
    await expect(page).toHaveURL(/categoria=aplicativos$/);
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "Aplicativos",
      "Procurando os cursos?",
    ]);
    await expect(page.getByRole("heading", { level: 3, name: "Brinqueletrando", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Brinqueletrando Box" })).toHaveCount(0);
  });

  test("filtro Cursos não redireciona e mostra os dois cursos", async ({ page }) => {
    await page.getByRole("navigation", { name: "Categorias da loja" }).getByRole("link", { name: /Cursos/ }).click();
    await expect(page).toHaveURL(/\/loja\?categoria=cursos$/);
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "Cursos",
      "Procurando os cursos?",
    ]);
    await expect(page.getByRole("region", { name: "Catálogo da loja" }).getByRole("heading", { level: 3 })).toHaveText([
      "Dificuldades na Aprendizagem",
      "Alfabetização",
    ]);
  });

  test("categoria desconhecida mostra o catálogo inteiro", async ({ page }) => {
    await page.goto("/loja?categoria=nao-existe");
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "Todos os produtos",
      "Procurando os cursos?",
    ]);
    await expect(page.getByRole("region", { name: "Brinqueletrando Box" })).toBeVisible();
  });

  test("faixa Sobre a compra: Kiwify, entrega e contato", async ({ page }) => {
    const trust = page.getByRole("region", { name: "Sobre a compra" });
    await expect(trust.getByText("O pagamento online pela Kiwify está em preparação.")).toBeVisible();
    await expect(
      trust.getByText("Materiais em PDF por e-mail; jogos e kits pelos Correios, com frete grátis para todo o Brasil."),
    ).toBeVisible();
    await expect(trust.getByRole("link", { name: "Fale pela página de contato" })).toHaveAttribute(
      "href",
      "/contato#formulario",
    );
  });

  test("ponte para os cursos mostra o curso disponível e leva a /cursos", async ({ page }) => {
    const main = page.getByRole("main");
    await expect(main.getByText("Dificuldades na Aprendizagem · R$ 598,00")).toBeVisible();
    await main.getByRole("link", { name: "Ver todos os cursos" }).click();
    await expect(page).toHaveURL("/cursos");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "loja");
  });
});

test.describe("Loja — produto disponível (Brinqueletrando Box)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loja/brinqueletrando-box");
  });

  test("página do produto com ficha, preço confirmado e compra", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Brinqueletrando Box" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "O que inclui" })).toBeVisible();
    await expect(page.getByText("R$ 399,00").first()).toBeVisible();
    await expect(page.getByText("Envio pelos Correios", { exact: false }).first()).toBeVisible();
    /* Faixa etária, componentes, dimensões, frete e prazo continuam sem confirmação. */
    await expect(page.getByText("A confirmar").first()).toBeVisible();
    await expect(page.getByText("Indisponível")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Comprar" })).toHaveAttribute(
      "href",
      "/loja/checkout?produto=brinqueletrando-box",
    );
  });

  test("Comprar leva ao resumo do pedido sem link de pagamento inventado", async ({ page }) => {
    await page.getByRole("link", { name: "Comprar" }).click();
    await expect(page).toHaveURL(/\/loja\/checkout\?produto=brinqueletrando-box$/);
    await expect(page.getByRole("heading", { level: 2, name: "Resumo do pedido" })).toBeVisible();
    await expect(page.getByText("Pagamento online em preparação.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ir para o pagamento" })).toHaveCount(0);
    await expect(page.getByText("R$ 399,00").first()).toBeVisible();
    /* Box: enviado pelos Correios com frete grátis; não promete entrega por e-mail. */
    await expect(page.getByText("você recebe o produto pelo e-mail", { exact: false })).toHaveCount(0);
    await expect(page.getByText("enviado pelos Correios, com frete grátis", { exact: false })).toBeVisible();
  });

  test("kit personalizado: preço, frete grátis e prazo com produção", async ({ page }) => {
    await page.goto("/loja/caneca-personalizada");
    await expect(page.getByText("R$ 59,90").first()).toBeVisible();
    await expect(page.getByText("Grátis para todo o Brasil")).toBeVisible();
    await expect(page.getByText("Produção e postagem em até 7 dias úteis", { exact: false })).toBeVisible();
    await page.goto("/loja/checkout?produto=caneca-personalizada");
    await expect(page.getByText("enviado pelos Correios, com frete grátis", { exact: false })).toBeVisible();
  });

  test("material em PDF: o checkout diz que o produto chega pelo e-mail da compra", async ({ page }) => {
    await page.goto("/loja/checkout?produto=ficha-observacao-leitura-escrita");
    await expect(page.getByRole("heading", { level: 2, name: "Resumo do pedido" })).toBeVisible();
    await expect(page.getByText("você recebe o produto pelo e-mail informado na compra", { exact: false })).toBeVisible();
    await expect(page.getByText("R$ 9,90").first()).toBeVisible();
    await expect(page.getByText("Forma e prazo de entrega:", { exact: false })).toHaveCount(0);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "loja-produto");
  });
});

test.describe("Loja — produto em breve (aplicativo Brinqueletrando)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/loja/brinqueletrando-app");
  });

  test("diz que está indisponível e não oferece compra", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Brinqueletrando" })).toBeVisible();
    await expect(page.getByText("Este produto ainda está em desenvolvimento.")).toBeVisible();

    const disabled = page.getByRole("button", { name: "Indisponível" });
    await expect(disabled).toHaveCount(1);
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute("aria-disabled", "true");

    await expect(page.getByRole("link", { name: "Comprar" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Comprar" })).toHaveCount(0);
    await expect(page.locator("a[href*='/loja/checkout']")).toHaveCount(0);
    await expect(page.getByText("Pagamento online em preparação.")).toHaveCount(0);
  });

  test("mostra o preço previsto e a entrega por download", async ({ page }) => {
    await expect(page.getByText("Preço previsto")).toBeVisible();
    await expect(page.getByText("R$ 39,90").first()).toBeVisible();
    await expect(page.getByText("Download direto no site", { exact: false }).first()).toBeVisible();
  });

  test("oferece o contato para ser avisado", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Avise-me pelo contato" })).toHaveAttribute("href", "/contato#formulario");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "loja-produto-em-breve");
  });
});

test.describe("Loja — checkout", () => {
  test("sem produto mostra o caminho de volta", async ({ page }) => {
    await page.goto("/loja/checkout");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Nenhum produto selecionado" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "checkout");

    await page.getByRole("main").getByRole("link", { name: "Ver a loja" }).click();
    await expect(page).toHaveURL("/loja");
  });

  test("produto desconhecido na URL cai no mesmo estado vazio", async ({ page }) => {
    await page.goto("/loja/checkout?produto=nao-existe");
    await expect(page.getByRole("heading", { level: 2, name: "Nenhum produto selecionado" })).toBeVisible();
  });

  test("produto em breve não abre fluxo de compra", async ({ page }) => {
    await page.goto("/loja/checkout?produto=brinqueletrando-app");
    await expect(page.getByRole("heading", { level: 2, name: "Produto indisponível" })).toBeVisible();
    await expect(page.getByText("ainda está em desenvolvimento e não pode ser comprado")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Resumo do pedido" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ir para o pagamento" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "Pagamento" })).toHaveCount(0);
    await expectNoHorizontalScroll(page);

    await page.getByRole("main").getByRole("link", { name: "Ver detalhes do produto" }).click();
    await expect(page).toHaveURL("/loja/brinqueletrando-app");
  });

  test("trilha de navegação: Início › Loja › Finalizar compra", async ({ page }) => {
    await page.goto("/loja/checkout");
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail).toHaveCount(1);
    await expect(trail.getByRole("link")).toHaveText(["Início", "Loja"]);
    await expect(trail.getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
    await expect(trail.getByRole("link", { name: "Loja" })).toHaveAttribute("href", "/loja");
    await expect(trail.locator("[aria-current='page']")).toHaveText("Finalizar compra");

    await trail.getByRole("link", { name: "Loja" }).click();
    await expect(page).toHaveURL("/loja");
  });
});

test.describe("Loja — produto inexistente", () => {
  test("slug sem produto cadastrado responde 404", async ({ page }) => {
    const response = await page.goto("/loja/qualquer-coisa");
    expect(response?.status()).toBe(404);
  });
});
