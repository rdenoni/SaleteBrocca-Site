import { expect, test, type Locator, type Page } from "@playwright/test";
import { getFeaturedArticles } from "../src/lib/content/articles";
import { getCourses } from "../src/lib/content/courses";
import { PROFILE_QUOTE } from "../src/lib/content/profile";
import { getTestimonials } from "../src/lib/content/testimonials";

const isDesktop = (width: number): boolean => width >= 1100;

/* Rola até cada imagem visível (dispara o lazy-load do next/image) e espera todas carregarem. */
async function loadAllImages(page: Page): Promise<void> {
  for (const image of await page.locator("main img, footer img").all()) {
    if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
  }
  /* Imagem lazy fora da tela não conta: o carrossel de depoimentos troca de slide sozinho e monta a foto nova
     enquanto o teste já rolou para o rodapé; ela só carrega quando volta à tela (comportamento correto do lazy). */
  await page.waitForFunction(
    () =>
      Array.from(document.images).every((img) => {
        if (img.offsetParent === null || img.complete) return true;
        const box = img.getBoundingClientRect();
        const onScreen = box.bottom > 0 && box.top < window.innerHeight;
        return img.loading === "lazy" && !onScreen;
      }),
    undefined,
    { timeout: 15_000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
}

/* Rola a página inteira devagar para disparar as entradas por viewport e por rolagem, e o lazy load. */
async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(300, Math.floor((page.viewportSize()?.height ?? 800) * 0.7));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    /* Dois quadros: com a máquina ocupada o navegador pode juntar duas rolagens num quadro só, e o
       IntersectionObserver nunca veria a posição do meio (o elemento "pulado" ficaria escondido). */
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(800);
}

/* Lista os [data-reveal] visíveis no layout que ficaram escondidos (opacidade < 0,99), para a falha dizer QUAL
   ficou preso. Com `still` (sem JavaScript) também exige transform e recorte neutros. */
async function hiddenReveals(page: Page, { still = false }: { still?: boolean } = {}): Promise<string[]> {
  return page.evaluate((checkStill) => {
    const neutralTransform = new Set(["none", "matrix(1, 0, 0, 1, 0, 0)"]);
    const neutralClip = new Set(["none", "inset(0%)", "inset(0px)"]);
    return Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-transform]"))
      .filter((element) => {
        if (element.offsetParent === null && !(element instanceof SVGElement)) return false;
        const style = getComputedStyle(element);
        const faded = element.hasAttribute("data-reveal") && Number(style.opacity) < 0.99;
        const moved = checkStill && (!neutralTransform.has(style.transform) || !neutralClip.has(style.clipPath));
        return faded || moved;
      })
      .map((element) => {
        const style = getComputedStyle(element);
        const top = Math.round(element.getBoundingClientRect().top + window.scrollY);
        const text = (element.textContent ?? "").trim().slice(0, 40);
        return `${element.tagName.toLowerCase()}.${String(element.className)} @${top}px "${text}" opacity=${style.opacity} transform=${style.transform} clip=${style.clipPath}`;
      });
  }, still);
}

test.describe("Home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mostra as seções na ordem do brief", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Conheça nossos cursos" })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    /* Os títulos animados (TextReveal) têm uma cópia visually-hidden e as palavras animadas em aria-hidden:
       lê só o texto que o leitor de tela recebe. */
    const headings = await page.locator("main h1, main h2").evaluateAll((elements) =>
      elements.map((element) => {
        const copy = element.cloneNode(true) as HTMLElement;
        copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
        return copy.textContent ?? "";
      }),
    );
    const order = [
      "Conheça nossos cursos",
      "Quer marcaruma avaliação?",
      "Conteúdos em destaque",
      "Maria Salete Brocca Denoni",
      "Cursos em destaque",
      "Dúvidas frequentes",
    ];
    expect(headings.map((text) => text.replace(/\s+/g, ""))).toEqual(order.map((text) => text.replace(/\s+/g, "")));

    /* A frase-conceito não tem título: o blockquote com a frase da marca fecha a página, antes do rodapé. */
    const concept = page.getByRole("region", { name: "Frase-conceito" });
    await expect(concept.locator("blockquote")).toContainText(PROFILE_QUOTE);
    await expect(page.getByText("Marque uma avaliação", { exact: true })).toHaveCount(0);

    await expect(page.getByRole("link", { name: "Explorar cursos" }).first()).toHaveAttribute("href", "/cursos");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("conteúdo real do curso: 6 módulos e 21 aulas", async ({ page }) => {
    const card = page.getByRole("article").filter({ hasText: "Dificuldades na Aprendizagem" });
    await expect(card).toContainText("6 módulos");
    await expect(card).toContainText("21 aulas");
  });

  test("Alfabetização aparece desabilitada, sem link, e a trilha segue no curso disponível", async ({ page }) => {
    const soon = page.locator("#curso-alfabetizacao");
    await expect(soon).toHaveCount(1);
    await expect(soon.getByRole("heading", { level: 3, name: "Alfabetização" })).toBeAttached();
    await expect(soon.getByText("Em breve", { exact: true })).toHaveCount(2);
    await expect(soon.getByText("Curso em preparação. Ainda não está disponível para inscrição.")).toBeAttached();
    await expect(soon.getByRole("link")).toHaveCount(0);
    await expect(page.locator('main a[href="/cursos/alfabetizacao"]')).toHaveCount(0);
    await expect(soon).not.toContainText("módulos");
  });

  test("Área do Aluno sempre acessível no header", async ({ page }) => {
    const student = page.getByRole("banner").getByRole("link", { name: "Área do Aluno" });
    await expect(student).toBeVisible();
    await expect(student).toHaveAttribute("href", "/area-do-aluno");
  });

  test("menu principal no desktop, menu móvel abaixo de 1100px", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    const desktopNav = page.getByRole("navigation", { name: "Principal", exact: true });
    const menuButton = page.getByRole("button", { name: "Abrir menu" });

    if (isDesktop(width)) {
      await expect(desktopNav).toBeVisible();
      await expect(menuButton).toBeHidden();
      for (const label of ["Cursos", "Loja", "Avaliação", "Conteúdo", "Sobre", "Contato"]) {
        await expect(desktopNav.getByRole("link", { name: label, exact: true })).toBeVisible();
      }
      return;
    }

    await expect(desktopNav).toBeHidden();
    await menuButton.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Conteúdo" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("formulário de avaliação valida nome e telefone", async ({ page }) => {
    const form = page.locator("#avaliacao form");
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByText("Informe seu nome completo.")).toBeVisible();
    await expect(form.getByText("Informe um telefone com DDD.")).toBeVisible();
    await expect(form.getByLabel("Nome completo")).toHaveAttribute("aria-invalid", "true");

    await form.getByLabel("Nome completo").fill("Maria da Silva");
    await form.getByLabel("Telefone").fill("(48) 99999-0000");
    await form.getByRole("checkbox").check();
    const post = page.waitForResponse((res) => res.url().includes("/api/leads") && res.request().method() === "POST");
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    expect((await post).status()).toBe(200);
    await expect(form.getByRole("status")).toContainText("Pedido de avaliação enviado com sucesso");
    await expect(form.getByText("Informe seu nome completo.")).toHaveCount(0);
  });

  test("formulário de avaliação aponta a política de privacidade", async ({ page }) => {
    await expect(page.locator("#avaliacao form").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });

  test("avaliação da Home leva a /avaliacao pelo link 'Como funciona a avaliação'", async ({ page }) => {
    await expect(page.locator("#avaliacao").getByRole("link", { name: "Como funciona a avaliação" })).toHaveAttribute(
      "href",
      "/avaliacao",
    );
  });

  test("artigos publicados não mostram aviso de exemplo", async ({ page }) => {
    const section = page.getByRole("region", { name: "Conteúdos em destaque" });
    await expect(section.getByRole("note")).toHaveCount(0);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });

  test("todas as imagens carregam", async ({ page }) => {
    await loadAllImages(page);
    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    expect(broken).toEqual([]);
  });

  test("links levam às rotas reais do site", async ({ page }) => {
    const [course] = getCourses();
    await expect(page.getByRole("link", { name: "Explorar cursos" }).first()).toHaveAttribute("href", "/cursos");
    await expect(page.getByRole("link", { name: "Explorar cursos" }).last()).toHaveAttribute("href", "/cursos");
    await expect(page.getByRole("link", { name: "Falar com a Salete" })).toHaveAttribute("href", "/contato");
    await expect(page.getByRole("link", { name: "Conheça minha trajetória" })).toHaveAttribute("href", "/sobre");
    await expect(page.getByRole("link", { name: "Ver curso" })).toHaveAttribute("href", `/cursos/${course.slug}`);
    for (const article of getFeaturedArticles()) {
      await expect(page.locator(`main a[href="/conteudo/${article.slug}"]`)).toHaveCount(1);
    }
    expect(await page.locator('main a[href^="#"], main a[href*="em-breve"]').count()).toBe(0);
  });

  test("a trilha mostra os 6 módulos do curso", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 3, name: "Os 6 módulos do curso" })).toBeAttached();
    await expect(page.getByRole("region", { name: "Os 6 módulos do curso" }).getByRole("listitem")).toHaveCount(6);
  });

  test("os dados têm 4 depoimentos: o real primeiro e sem marca, os 3 seguintes simulados", () => {
    const [real, ...others] = getTestimonials();
    expect(getTestimonials()).toHaveLength(4);
    expect(real.author).toBe("Daniele Schlichting Fusinato");
    expect(real.simulated).toBeFalsy();
    expect(real.photo).toBeTruthy();
    expect(others).toHaveLength(3);
    for (const item of others) {
      expect(item.simulated).toBe(true);
      expect(item.author).toMatch(/\(simulad[oa]\)/);
      expect(item.photo).toBeUndefined();
      expect(item.initials).toBeTruthy();
    }
  });

  /* O carrossel troca sozinho a cada 10 s: o ponteiro sobre ele pausa a troca (sem ser a pausa do usuário, então
     aria-live segue "off"). Com `reset`, volta ao 1º depoimento se a troca já tiver acontecido. */
  async function openCarousel(page: Page, { reset = true }: { reset?: boolean } = {}) {
    const carousel = page.getByRole("region", { name: "Depoimentos", exact: true });
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute("aria-roledescription", "carrossel");
    await carousel.hover();
    if (reset && (await carousel.getByRole("group", { name: "1 de 4" }).count()) === 0) {
      await carousel.getByRole("button", { name: "Ir para o depoimento 1 de 4" }).click();
    }
    return carousel;
  }
  const dot = (carousel: Locator, position: number) =>
    carousel.getByRole("button", { name: `Ir para o depoimento ${position} de 4` });

  test("carrossel de 4 depoimentos: o real vem primeiro, sem etiqueta, e há 4 pontos", async ({ page }) => {
    const [real] = getTestimonials();
    const carousel = await openCarousel(page);
    const slide = carousel.getByRole("group", { name: "1 de 4" });
    await expect(slide).toHaveAttribute("aria-roledescription", "slide");
    await expect(slide.locator("blockquote")).toContainText(real.quote);
    await expect(slide).toContainText(real.author);
    await expect(slide).toContainText(real.role);
    await expect(slide.getByText("Depoimento simulado")).toHaveCount(0);
    await expect(slide.getByText(/simulad/i)).toHaveCount(0);
    await expect(carousel.getByRole("button", { name: /Ir para o depoimento \d de 4/ })).toHaveCount(4);
    await expect(carousel.getByText("Depoimentos 2 a 4 são simulados para demonstrar a troca.")).toHaveCount(0);
  });

  test("os depoimentos 2 a 4 mostram a etiqueta 'Depoimento simulado' e o nome marcado", async ({ page }) => {
    const [, ...simulated] = getTestimonials();
    const carousel = await openCarousel(page);
    for (const [offset, item] of simulated.entries()) {
      const position = offset + 2;
      await dot(carousel, position).click();
      const slide = carousel.getByRole("group", { name: `${position} de 4` });
      await expect(slide).toBeVisible();
      await expect(slide.locator("blockquote")).toContainText(item.quote);
      await expect(slide.getByText("Depoimento simulado", { exact: true })).toBeVisible();
      await expect(slide.getByText(/\(simulad[oa]\)/)).toBeVisible();
      /* Avatar de iniciais, sem foto. */
      await expect(slide.locator("img")).toHaveCount(0);
      await expect(slide).toContainText(item.initials ?? "");
    }
  });

  test("bolinhas e as setas do teclado trocam o depoimento (N de 4)", async ({ page }) => {
    const carousel = await openCarousel(page);
    await expect(carousel.getByRole("group", { name: "1 de 4" })).toBeVisible();

    await dot(carousel, 2).click();
    await expect(carousel.getByRole("group", { name: "2 de 4" })).toBeVisible();
    await expect(carousel.getByRole("group", { name: "1 de 4" })).toHaveCount(0);

    await dot(carousel, 1).click();
    await expect(carousel.getByRole("group", { name: "1 de 4" })).toBeVisible();

    /* Teclado: com o foco na região, → avança e ← volta (e dá a volta no fim). */
    await carousel.focus();
    await page.keyboard.press("ArrowRight");
    await expect(carousel.getByRole("group", { name: "2 de 4" })).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(carousel.getByRole("group", { name: "4 de 4" })).toBeVisible();
    await expect(dot(carousel, 4)).toHaveAttribute("aria-current", "true");
  });

  test("a troca automática fica muda; só a troca feita pela pessoa é anunciada, com a etiqueta", async ({ page }) => {
    /* Sem reset: clicar numa bolinha já tornaria o anúncio "polite" antes da verificação. */
    const carousel = await openCarousel(page, { reset: false });
    const live = carousel.locator("[aria-live]");
    await expect(live).toHaveAttribute("aria-live", "off");
    await dot(carousel, 2).click();
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toContainText("Depoimento 2 de 4");
    await expect(live).toContainText("Depoimento simulado");
  });

  test("o depoimento troca sozinho depois de 10 s", async ({ page }) => {
    test.setTimeout(30_000);
    const carousel = await openCarousel(page);
    /* Clicar na 1ª bolinha zera os 10 s (troca manual reinicia a contagem); depois o ponteiro sai do carrossel
       (hover pausa a troca). */
    await dot(carousel, 1).click();
    await page.mouse.move(1, 1);
    await expect(carousel.getByRole("group", { name: "1 de 4" })).toBeVisible();
    await page.waitForTimeout(8_000);
    await expect(carousel.getByRole("group", { name: "1 de 4" })).toBeVisible();
    await expect(carousel.getByRole("group", { name: "2 de 4" })).toBeVisible({ timeout: 6_000 });
  });

  test("carrossel de depoimentos exibe somente os 4 pontos centralizados (sem play/pause nem barra de tempo)", async ({ page }) => {
    const carousel = await openCarousel(page);
    await expect(carousel.getByRole("button", { name: /Pausar|Retomar/ })).toHaveCount(0);
    await expect(carousel.getByRole("button", { name: /Ir para o depoimento \d de 4/ })).toHaveCount(4);
  });

  test("trocar de depoimento não muda a altura do palco (±2px)", async ({ page }) => {
    const carousel = await openCarousel(page);
    const stage = carousel.locator("> div").first();
    await expect(carousel.getByRole("group", { name: "1 de 4" })).toBeVisible();
    const baseStage = (await stage.boundingBox())!.height;
    for (let step = 2; step <= 4; step += 1) {
      await dot(carousel, step).click();
      await expect(carousel.getByRole("group", { name: `${step} de 4` })).toBeVisible();
      expect(Math.abs((await stage.boundingBox())!.height - baseStage)).toBeLessThanOrEqual(2);
    }
  });

  test("com movimento completo, tudo termina revelado depois de rolar a página", async ({ page }) => {
    /* Cobre as camadas ligadas à rolagem (artigos, card do curso, peças da frase-conceito): passada a janela
       de cada uma, o estado final tem que ser o visível. */
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await scrollThrough(page);
    await expect.poll(() => hiddenReveals(page), { timeout: 3000 }).toEqual([]);
  });

  test("captura de tela da página inteira", async ({ page }, testInfo) => {
    /* Movimento reduzido só para a captura: as entradas ligadas à rolagem (artigos, card do curso, peças da
       frase-conceito) desfazem ao voltar ao topo e a página inteira sairia com blocos vazios. */
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.locator("#avaliacao form[data-reduced]").waitFor({ state: "attached" });
    await scrollThrough(page);
    await loadAllImages(page);
    const width = page.viewportSize()?.width ?? 0;
    await page.screenshot({ path: `tests/screenshots/current/home-${width}.png`, fullPage: true });
    testInfo.annotations.push({ type: "screenshot", description: `home-${width}.png` });
  });
});

test.describe("Home com movimento reduzido", () => {
  test("nada fica escondido depois de rolar a página", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    /* Antes da hidratação o HTML do servidor ainda está no estado inicial e nenhum observador de rolagem existe:
       medir só depois dela. O formulário ganha data-reduced quando o cliente assume o movimento reduzido. */
    await page.waitForLoadState("networkidle");
    await page.locator("#avaliacao form[data-reduced]").waitFor({ state: "attached" });
    await scrollThrough(page);
    await expect.poll(() => hiddenReveals(page), { timeout: 3000 }).toEqual([]);
  });
});

test.describe("Home sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o noscript mostra todo o conteúdo animado", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await hiddenReveals(page, { still: true })).toEqual([]);
  });
});
