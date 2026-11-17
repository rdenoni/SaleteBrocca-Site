import { expect, test, type Page } from "@playwright/test";
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
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.offsetParent === null || img.complete),
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
      for (const label of ["Cursos", "Sobre", "Conteúdo", "Loja", "Contato"]) {
        await expect(desktopNav.getByRole("link", { name: label })).toBeVisible();
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
    await form.getByRole("button", { name: "Pedir avaliação" }).click();
    await expect(form.getByRole("status")).toContainText("Dados conferidos");
    await expect(form.getByText("Informe seu nome completo.")).toHaveCount(0);
  });

  test("formulário de avaliação aponta a política de privacidade", async ({ page }) => {
    await expect(page.locator("#avaliacao form").getByRole("link", { name: "política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });

  test("artigos de exemplo avisam que são exemplo", async ({ page }) => {
    const section = page.getByRole("region", { name: "Conteúdos em destaque" });
    await expect(section.getByRole("note")).toContainText("Conteúdo de exemplo.");
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

  test("um único depoimento real: citação sem carrossel nem controles", async ({ page }) => {
    const [real] = getTestimonials();
    expect(getTestimonials()).toHaveLength(1);

    const column = page.locator('#avaliacao [data-surface="dark"]');
    await expect(column.locator("figure")).toHaveCount(1);
    await expect(column.locator("blockquote")).toContainText(real.quote);
    await expect(column).toContainText(real.author);
    await expect(column).toContainText(real.role);

    /* Nada de carrossel: sem pontos nem pausa, sem região viva, sem foco no contêiner, sem gesto de arrastar. */
    await expect(column.getByRole("button")).toHaveCount(0);
    await expect(column.locator("[aria-roledescription]")).toHaveCount(0);
    await expect(column.locator("[aria-live], [role='status']")).toHaveCount(0);
    await expect(column.locator('[tabindex="0"]')).toHaveCount(0);
    await expect(column.locator("[data-swipe]")).toHaveCount(0);

    /* Os depoimentos simulados do laboratório nunca vão ao ar. */
    await expect(page.getByText(/simulad/i)).toHaveCount(0);
    await expect(page.getByText("Depoimento 1 de")).toHaveCount(0);
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
