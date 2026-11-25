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
  });

  test("artigos publicados: sem aviso de exemplo e abertos aos buscadores", async ({ page }) => {
    await expect(page.getByRole("note").filter({ hasText: "Conteúdo de exemplo." })).toHaveCount(0);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test("destaque leva ao artigo", async ({ page }) => {
    await page.getByRole("link", { name: /^PAC:/ }).click();
    await expect(page).toHaveURL("/conteudo/pac-avaliacao-do-processamento-auditivo");
  });

  test("mais conteúdos: uma linha só, em carrossel com setas e pontos", async ({ page }) => {
    const carousel = page.getByRole("region", { name: "Artigos", exact: true });
    await carousel.scrollIntoViewIfNeeded();
    const prev = carousel.getByRole("button", { name: "Artigos anteriores" });
    const next = carousel.getByRole("button", { name: "Próximos artigos" });
    const dots = carousel.getByRole("button", { name: /^Ir para a página/ });
    await expect(page.getByText("Novos artigos em breve")).toHaveCount(0);
    await expect(prev).toBeDisabled();
    await expect(dots.first()).toHaveAttribute("aria-current", "true");
    await next.click();
    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await expect(prev).toBeEnabled();
    await dots.last().click();
    await expect(next).toBeDisabled();
    await expectNoHorizontalScroll(page);
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

const PODCAST_EPISODE = "/conteudo/podcast/lentes-coloridas-na-sindrome-de-irlen";

test.describe("Conteúdo — podcast", () => {
  test("a biblioteca mostra a seção Podcast com os 4 episódios publicados", async ({ page }) => {
    await page.goto("/conteudo");
    const section = page.getByRole("region", { name: "Podcast" });
    await expect(section.getByRole("heading", { level: 2, name: "Podcast" })).toBeVisible();
    await expect(section.getByText("Podcast simulado")).toHaveCount(0);
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(section.getByText("Áudio disponível")).toHaveCount(4);
    await expect(section.getByRole("link", { name: "Ver todos os episódios" })).toHaveAttribute(
      "href",
      "/conteudo/podcast",
    );
    await expectNoHorizontalScroll(page);
  });

  test("a listagem tem 4 episódios publicados e trilha", async ({ page }) => {
    await page.goto("/conteudo/podcast");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Podcast" })).toBeVisible();
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail.getByRole("link")).toHaveText(["Início", "Conteúdo"]);
    await expect(trail.locator("[aria-current='page']")).toHaveText("Podcast");
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(page.getByRole("heading", { level: 3, name: /^Como a hiperlexia/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Lentes coloridas/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^O treino de processamento auditivo/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /^Sinapses e redes neurais/ })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "podcast");
  });

  test("o card leva ao episódio", async ({ page }) => {
    await page.goto("/conteudo/podcast");
    await page.getByRole("link", { name: /^Lentes coloridas/ }).click();
    await expect(page).toHaveURL(PODCAST_EPISODE);
  });

  test("o episódio mostra título, player de áudio ativo e link para o curso", async ({ page }) => {
    await page.goto(PODCAST_EPISODE);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Lentes coloridas na Síndrome de Irlen" })).toBeVisible();
    const audio = page.locator("audio");
    await expect(audio).toHaveCount(1);
    await expect(audio).toHaveAttribute("src", "/audio/podcasts/lentes-coloridas-na-sindrome-de-irlen.m4a");
    await expect(page.getByRole("heading", { level: 2, name: "Neste episódio" })).toBeVisible();
    const course = page.getByRole("complementary", { name: "Do curso" });
    await expect(course.getByRole("link", { name: "Conhecer o curso" })).toHaveAttribute(
      "href",
      "/cursos/dificuldades-na-aprendizagem",
    );
    const trail = page.getByRole("navigation", { name: "Trilha de navegação" });
    await expect(trail.getByRole("link")).toHaveText(["Início", "Conteúdo", "Podcast"]);
  });

  test("anterior e próximo episódio", async ({ page }) => {
    await page.goto(PODCAST_EPISODE);
    const pager = page.getByRole("navigation", { name: "Outros episódios" });
    await expect(pager.getByRole("link")).toHaveCount(2);
    await pager.getByRole("link", { name: /Próximo episódio/ }).click();
    await expect(page).toHaveURL("/conteudo/podcast/o-treino-de-processamento-auditivo-realmente-funciona");
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

  test("permite curtir e descurtir artigos e episódios de podcast com persistência", async ({ page }) => {
    /* Artigo */
    await page.goto(ARTICLE);
    const articleLike = page.locator('[data-content-like^="article:"] button');
    await expect(articleLike).toBeVisible();
    await expect(articleLike).toHaveAttribute("aria-pressed", "false");
    const articleBox = await articleLike.boundingBox();
    expect(articleBox?.height ?? 0).toBeGreaterThanOrEqual(48);

    await expect(articleLike.locator("[data-like-count]")).toBeVisible();
    const articlePost = page.waitForResponse(
      (res) => res.url().includes("/api/content/likes") && res.request().method() === "POST",
    );
    await articleLike.click();
    expect((await articlePost).status()).toBe(200);
    await expect(articleLike).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(async () => Number((await articleLike.locator("[data-like-count]").textContent()) ?? "0"))
      .toBeGreaterThanOrEqual(1);

    await page.reload();
    await expect(articleLike).toHaveAttribute("aria-pressed", "true");
    const articleUnlike = page.waitForResponse(
      (res) => res.url().includes("/api/content/likes") && res.request().method() === "POST",
    );
    await articleLike.click();
    expect((await articleUnlike).status()).toBe(200);
    await expect(articleLike).toHaveAttribute("aria-pressed", "false");
    await expectNoHorizontalScroll(page);

    /* Podcast */
    await page.goto(PODCAST_EPISODE);
    const podcastLike = page.locator('[data-content-like^="podcast:"] button');
    await expect(podcastLike).toBeVisible();
    await expect(podcastLike).toHaveAttribute("aria-pressed", "false");
    const podcastBox = await podcastLike.boundingBox();
    expect(podcastBox?.height ?? 0).toBeGreaterThanOrEqual(48);

    await expect(podcastLike.locator("[data-like-count]")).toBeVisible();
    const podcastPost = page.waitForResponse(
      (res) => res.url().includes("/api/content/likes") && res.request().method() === "POST",
    );
    await podcastLike.click();
    expect((await podcastPost).status()).toBe(200);
    await expect(podcastLike).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(async () => Number((await podcastLike.locator("[data-like-count]").textContent()) ?? "0"))
      .toBeGreaterThanOrEqual(1);

    await page.reload();
    await expect(podcastLike).toHaveAttribute("aria-pressed", "true");
    const podcastUnlike = page.waitForResponse(
      (res) => res.url().includes("/api/content/likes") && res.request().method() === "POST",
    );
    await podcastLike.click();
    expect((await podcastUnlike).status()).toBe(200);
    await expect(podcastLike).toHaveAttribute("aria-pressed", "false");
    await expectNoHorizontalScroll(page);
  });
});
