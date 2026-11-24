import { expect, test, type Page } from "@playwright/test";

const ARTICLE = "/conteudo/disfagia-sintomas-e-tratamento";

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

test.describe("Conteúdo — biblioteca", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/conteudo");
  });

  test("categorias, destaque e demais artigos", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Conteúdo" })).toBeVisible();
    const categories = page.getByRole("navigation", { name: "Categorias de conteúdo" });
    await expect(categories.getByRole("link")).toHaveCount(6);
    await expect(categories.getByRole("link", { name: /Todos/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 2, name: /^PAC:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Disfagia:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Gagueira:/ })).toBeVisible();
    await expect(page.getByText("Novos artigos em breve")).toBeVisible();
  });

  test("artigos publicados: sem aviso de exemplo e abertos aos buscadores", async ({ page }) => {
    await expect(page.getByRole("note").filter({ hasText: "Conteúdo de exemplo." })).toHaveCount(0);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test("destaque leva ao artigo", async ({ page }) => {
    await page.getByRole("link", { name: /^PAC:/ }).click();
    await expect(page).toHaveURL("/conteudo/pac-avaliacao-do-processamento-auditivo");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "conteudo");
  });
});

test.describe("Conteúdo — categoria", () => {
  test("filtra pela categoria e volta para todos", async ({ page }) => {
    await page.goto("/conteudo");
    await page.getByRole("navigation", { name: "Categorias de conteúdo" }).getByRole("link", { name: /Deglutição/ }).click();
    await expect(page).toHaveURL("/conteudo/categoria/degluticao");
    await expect(page.getByRole("heading", { level: 1, name: "Deglutição" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Disfagia:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^PAC:/ })).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    /* O da página (o rodapé também tem "Todos os conteúdos"). */
    await page.getByRole("main").getByRole("link", { name: "Todos os conteúdos" }).click();
    await expect(page).toHaveURL("/conteudo");
  });

  test("categoria inexistente responde 404", async ({ page }) => {
    const response = await page.goto("/conteudo/categoria/nao-existe");
    expect(response?.status()).toBe(404);
  });

  test("a âncora /conteudo#categorias leva aos filtros", async ({ page }) => {
    await page.goto("/conteudo#categorias");
    await expect(page.getByRole("navigation", { name: "Categorias de conteúdo" })).toBeInViewport();
  });
});

test.describe("Conteúdo — artigo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ARTICLE);
  });

  test("título, trilha, autoria, data e texto publicado", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: /^Disfagia: Quais os sintomas/ })).toBeVisible();
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail.getByRole("link")).toHaveText(["Início", "Conteúdo", "Deglutição"]);
    await expect(trail.locator("[aria-current='page']")).toHaveText("Disfagia");
    await expect(page.getByText("Maria Salete Brocca Denoni").first()).toBeVisible();
    await expect(page.getByText("Data a confirmar")).toHaveCount(0);
    await expect(page.locator("time")).toHaveAttribute("datetime", "2026-11-24");
    await expect(page.getByText("Artigo de exemplo")).toHaveCount(0);
    await expect(page.getByText("Texto em preparação")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "Sinais de alerta" })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test("chamada final e leia também", async ({ page }) => {
    const cta = page.getByRole("complementary", { name: "Quer entender melhor?" });
    await expect(cta.getByRole("link", { name: "Conhecer os cursos" })).toHaveAttribute("href", "/cursos");
    await expect(cta.getByRole("link", { name: "Fale com a Salete" })).toHaveAttribute("href", "/contato");
    const related = page.getByRole("region", { name: "Leia também" });
    await expect(related.getByRole("heading", { level: 3 })).toHaveCount(2);
    await expect(related.getByRole("heading", { level: 3, name: /^Disfagia:/ })).toHaveCount(0);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "artigo");
  });
});

test("card da Home abre o artigo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Gagueira:/ }).click();
  await expect(page).toHaveURL("/conteudo/gagueira-quando-procurar-avaliacao");
  await expect(page.getByRole("heading", { level: 1, name: /^Gagueira:/ })).toBeVisible();
});

const PODCAST_EPISODE = "/conteudo/podcast/dislexia-o-que-e-e-o-que-nao-e";

test.describe("Conteúdo — podcast", () => {
  test("a biblioteca mostra a seção Podcast com 3 episódios de exemplo", async ({ page }) => {
    await page.goto("/conteudo");
    const section = page.getByRole("region", { name: "Podcast" });
    await expect(section.getByRole("heading", { level: 2, name: "Podcast" })).toBeVisible();
    await expect(section.getByText("Podcast simulado")).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(3);
    await expect(section.getByText("Episódio de exemplo")).toHaveCount(3);
    await expect(section.getByRole("link", { name: "Ver todos os episódios" })).toHaveAttribute(
      "href",
      "/conteudo/podcast",
    );
    await expectNoHorizontalScroll(page);
  });

  test("a listagem tem 3 episódios, aviso de simulação e trilha", async ({ page }) => {
    await page.goto("/conteudo/podcast");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Podcast" })).toBeVisible();
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail.getByRole("link")).toHaveText(["Início", "Conteúdo"]);
    await expect(trail.locator("[aria-current='page']")).toHaveText("Podcast");
    await expect(page.getByRole("note").filter({ hasText: "Podcast simulado." })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(3);
    await expect(page.getByRole("heading", { level: 3, name: /^Dificuldade ou transtorno\?/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Dislexia:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Atenção, memória/ })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "podcast");
  });

  test("o card leva ao episódio", async ({ page }) => {
    await page.goto("/conteudo/podcast");
    await page.getByRole("link", { name: /^Dislexia:/ }).click();
    await expect(page).toHaveURL(PODCAST_EPISODE);
  });

  test("o episódio mostra título, player desativado, roteiro e link para o curso", async ({ page }) => {
    await page.goto(PODCAST_EPISODE);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Dislexia: o que é e o que não é" })).toBeVisible();
    await expect(page.getByText("Áudio em produção", { exact: true })).toBeVisible();
    await expect(page.locator("audio")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reproduzir" })).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByRole("heading", { level: 2, name: "Neste episódio" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Roteiro" })).toBeVisible();
    await expect(page.getByText("Salete:", { exact: true }).first()).toBeVisible();
    const course = page.getByRole("complementary", { name: "Do curso" });
    await expect(course.getByText("Dislexia: história e definição atual")).toBeVisible();
    await expect(course.getByRole("link", { name: "Conhecer o curso" })).toHaveAttribute(
      "href",
      "/cursos/dificuldades-na-aprendizagem",
    );
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail.getByRole("link")).toHaveText(["Início", "Conteúdo", "Podcast"]);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("anterior e próximo episódio", async ({ page }) => {
    await page.goto(PODCAST_EPISODE);
    const pager = page.getByRole("navigation", { name: "Outros episódios" });
    await expect(pager.getByRole("link")).toHaveCount(2);
    await pager.getByRole("link", { name: /Próximo episódio/ }).click();
    await expect(page).toHaveURL("/conteudo/podcast/atencao-memoria-funcoes-executivas");
    const last = page.getByRole("navigation", { name: "Outros episódios" });
    await expect(last.getByRole("link")).toHaveCount(1);
    await expect(last.getByRole("link", { name: /Episódio anterior/ })).toBeVisible();
  });

  test("episódio sem rolagem horizontal", async ({ page }) => {
    await page.goto(PODCAST_EPISODE);
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "podcast-episodio");
  });

  test("episódio inexistente responde 404", async ({ page }) => {
    const response = await page.goto("/conteudo/podcast/nao-existe");
    expect(response?.status()).toBe(404);
  });
});
