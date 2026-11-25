import { expect, test, type Locator, type Page } from "@playwright/test";

/* Cabeçalho e rodapé animados (fase 3): estado ativo da gota, cabeçalho inteligente, menu móvel,
   rodapé com perfis sociais (botões com aviso enquanto sem endereço) e ausência de sobreposição nas páginas internas. */

const DESKTOP_MIN_WIDTH = 1100;
const NAV_NAME = "Principal";
/* Menu na ordem do cabeçalho; a Loja entrou depois de Cursos. */
const MAIN_NAV_LABELS = ["Cursos", "Loja", "Avaliação", "Conteúdo", "Sobre", "Contato"];

/* Rodapé aprovado (4 colunas, máximo de 3 links por coluna). */
const FOOTER_COLUMNS = [
  {
    title: "Atendimento",
    links: [
      { label: "Marcar avaliação", href: "/avaliacao" },
      { label: "Sobre a Salete", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Cursos",
    links: [
      { label: "Catálogo", href: "/cursos" },
      { label: "Dúvidas frequentes", href: "/cursos#duvidas" },
      { label: "Área do Aluno", href: "/area-do-aluno" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Todos os conteúdos", href: "/conteudo" },
      { label: "Podcast", href: "/conteudo/podcast" },
      { label: "Audição", href: "/conteudo/categoria/audicao" },
    ],
  },
  {
    title: "Loja e temas",
    links: [
      { label: "Loja", href: "/loja" },
      { label: "Deglutição", href: "/conteudo/categoria/degluticao" },
      { label: "Fala e fluência", href: "/conteudo/categoria/fala-e-fluencia" },
    ],
  },
] as const;

const isMobile = (page: Page): boolean => (page.viewportSize()?.width ?? 0) < 768;

const isDesktop = (page: Page): boolean => (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH;

const banner = (page: Page): Locator => page.getByRole("banner");
const logoLink = (page: Page): Locator => banner(page).getByRole("link", { name: "Salete Brocca, página inicial" });
/* A pílula branca é o primeiro filho do marco "banner". */
const pill = (page: Page): Locator => banner(page).locator(":scope > div").first();

/* Espera a entrada da pílula terminar (transform some): durante ela o retângulo medido tem erro de ponto flutuante. */
async function waitForEntrance(page: Page): Promise<void> {
  await expect(pill(page)).toHaveCSS("opacity", "1");
  await expect(pill(page)).toHaveCSS("transform", "none");
  /* Os botões entram depois da logo e dos links (ordem do cabeçalho): mede só com eles parados. */
  const actions = pill(page).locator('[class*="actions"]').first();
  await expect(actions).toHaveCSS("opacity", "1");
  await expect(actions).toHaveCSS("transform", "none");
}

async function noHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

/* Resolve um token de cor (ex.: --cyan) para o rgb() que o navegador calcula. */
async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.color = `var(${name})`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

interface GotaState {
  /** Rótulo do link sob a gota, ou null se nenhum. */
  under: string | null;
  opacity: number;
}

/* A gota é um recorte (clip-path) de uma camada que cobre a lista: compara o recorte com a caixa de cada link. */
async function readGota(page: Page): Promise<GotaState> {
  return page.getByRole("navigation", { name: NAV_NAME, exact: true }).evaluate((nav) => {
    const track = nav.firstElementChild as HTMLElement;
    const layer = track.firstElementChild as HTMLElement;
    const gota = layer.firstElementChild as HTMLElement;
    const match = /inset\(\s*0px\s+(-?[\d.]+)px\s+0px\s+(-?[\d.]+)px/.exec(getComputedStyle(gota).clipPath);
    const opacity = Number(getComputedStyle(layer).opacity);
    if (!match) return { under: null, opacity };
    const right = Number(match[1]);
    const left = Number(match[2]);
    /* A camada .gotaLayer tem folga extra nas laterais para o overshoot da mola; desconta a diferença entre
       o bleed da camada (-layer.offsetLeft) e o respiro visual da gota (6px). */
    const overshootPad = Math.max(0, -layer.offsetLeft - 6);
    const visualLeft = left - overshootPad;
    const visualRight = right - overshootPad;
    const links = Array.from(track.querySelectorAll<HTMLAnchorElement>("ul a"));
    const hit = links.find(
      (link) =>
        Math.abs(link.offsetLeft - visualLeft) <= 1 &&
        Math.abs(track.offsetWidth - (link.offsetLeft + link.offsetWidth) - visualRight) <= 1,
    );
    return { under: hit?.textContent?.trim() ?? null, opacity };
  });
}

test.describe("cabeçalho: gota do item ativo", () => {
  test.beforeEach(({ page }) => {
    test.skip(!isDesktop(page), "a navegação principal só existe a partir de 1100px");
  });

  const routes: [string, string][] = [
    ["/cursos", "Cursos"],
    ["/avaliacao", "Avaliação"],
    ["/sobre", "Sobre"],
    ["/contato", "Contato"],
    ["/cursos/dificuldades-na-aprendizagem", "Cursos"],
    ["/conteudo", "Conteúdo"],
  ];

  for (const [route, label] of routes) {
    test(`${route} destaca ${label}`, async ({ page }) => {
      await page.goto(route);
      const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
      await expect(nav.locator("[aria-current='page']")).toHaveCount(1);
      await expect.poll(() => readGota(page), { timeout: 15_000 }).toEqual({ under: label, opacity: 1 });
    });
  }

  test("na Home a gota destaca Cursos sem marcar a página atual", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
    await expect(nav.locator("[aria-current='page']")).toHaveCount(0);
    await expect.poll(() => readGota(page), { timeout: 15_000 }).toEqual({ under: "Cursos", opacity: 1 });
  });

  test("o menu tem 6 itens na ordem definida, com a Loja em segundo", async ({ page }) => {
    await page.goto("/cursos");
    const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
    await expect(nav.getByRole("link")).toHaveText(MAIN_NAV_LABELS);
    await expect(nav.getByRole("link", { name: "Avaliação", exact: true })).toHaveAttribute("href", "/avaliacao");
    await expect(nav.getByRole("link", { name: "Loja", exact: true })).toHaveAttribute("href", "/loja");
  });

  /* Páginas que não são itens do menu (privacidade, termos) não têm gota nem aria-current. */
  for (const route of ["/privacidade", "/termos-de-uso"]) {
    test(`fora do menu (${route}) não há gota`, async ({ page }) => {
      await page.goto(route);
      const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
      await expect(nav.locator("[aria-current='page']")).toHaveCount(0);
      await expect.poll(async () => (await readGota(page)).opacity, { timeout: 15_000 }).toBe(0);
    });
  }

  test("a gota acompanha a navegação por cliques", async ({ page }) => {
    await page.goto("/cursos");
    const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
    await nav.getByRole("link", { name: "Sobre", exact: true }).click();
    await expect(page).toHaveURL(/\/sobre$/);
    await expect(nav.getByRole("link", { name: "Sobre", exact: true })).toHaveAttribute("aria-current", "page");
    await expect.poll(() => readGota(page), { timeout: 15_000 }).toEqual({ under: "Sobre", opacity: 1 });
  });

  test("área do aluno: botão do header marca a página atual e não há gota", async ({ page }) => {
    await page.goto("/area-do-aluno/login");
    await expect(banner(page).getByRole("link", { name: "Área do Aluno" })).toHaveAttribute("aria-current", "page");
    await expect.poll(async () => (await readGota(page)).opacity, { timeout: 15_000 }).toBe(0);
  });

  test("itens do menu têm largura uniforme e a gota tem folga contra corte nas extremidades", async ({ page }) => {
    await page.goto("/cursos");
    const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
    await expect.poll(() => readGota(page), { timeout: 15_000 }).toEqual({ under: "Cursos", opacity: 1 });

    const metrics = await nav.evaluate((el) => {
      const track = el.firstElementChild as HTMLElement;
      const layer = track.firstElementChild as HTMLElement;
      const gota = layer.firstElementChild as HTMLElement;
      const widths = Array.from(track.querySelectorAll<HTMLAnchorElement>("ul a")).map((a) => a.offsetWidth);
      const match = /inset\(\s*0px\s+(-?[\d.]+)px\s+0px\s+(-?[\d.]+)px/.exec(getComputedStyle(gota).clipPath);
      return {
        minWidth: Math.min(...widths),
        maxWidth: Math.max(...widths),
        clipLeft: match ? Number(match[2]) : -1,
        layerOffsetLeft: layer.offsetLeft,
      };
    });

    /* Todos os itens ficam praticamente do mesmo tamanho (diferença <= 16px em desktop). */
    expect(metrics.maxWidth - metrics.minWidth).toBeLessThanOrEqual(16);
    /* Folga suficiente na extremidade esquerda (Cursos) para o overshoot da mola não cortar a gota. */
    expect(metrics.layerOffsetLeft).toBeLessThanOrEqual(-40);
    expect(metrics.clipLeft).toBeGreaterThanOrEqual(40);
  });
});

test.describe("cabeçalho inteligente", () => {
  async function scrollTo(page: Page, top: number): Promise<void> {
    /* O html tem rolagem suave para âncoras: "instant" evita a animação do navegador. */
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await page.waitForTimeout(120);
  }

  test("fica em repouso, some ao rolar para baixo e volta ao rolar para cima", async ({ page }) => {
    await page.goto("/sobre");
    const header = banner(page);
    await expect(header).toHaveAttribute("data-pin", "rest");
    await expect(header).toHaveCSS("position", "absolute");

    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    expect(maxScroll).toBeGreaterThan(1500);

    /* Descendo, o cabeçalho original sai da tela e nada o traz de volta. */
    await scrollTo(page, 800);
    await scrollTo(page, 1200);
    await expect(header).toHaveAttribute("data-pin", "rest");

    /* Subindo (já fora de vista): aparece fixo. */
    await scrollTo(page, 1100);
    await expect(header).toHaveAttribute("data-pin", "shown");
    await expect(header).toHaveCSS("position", "fixed");
    await expect.poll(async () => (await pill(page).boundingBox())?.y ?? -999).toBeGreaterThanOrEqual(0);

    /* Descendo de novo: recolhe para cima da tela. */
    await scrollTo(page, 1400);
    await expect(header).toHaveAttribute("data-pin", "hidden");
    await expect
      .poll(async () => {
        const box = await pill(page).boundingBox();
        return box ? box.y + box.height : 0;
      })
      .toBeLessThanOrEqual(0);

    /* Subindo: volta. */
    await scrollTo(page, 1300);
    await expect(header).toHaveAttribute("data-pin", "shown");

    /* De volta ao topo: o repouso (absoluto) retorna. */
    await scrollTo(page, 0);
    await expect(header).toHaveAttribute("data-pin", "rest");
    await expect(header).toHaveCSS("position", "absolute");
  });

  test("o foco de teclado mantém o cabeçalho visível", async ({ page }) => {
    await page.goto("/sobre");
    const header = banner(page);
    await scrollTo(page, 1200);
    await scrollTo(page, 1100);
    await expect(header).toHaveAttribute("data-pin", "shown");
    await scrollTo(page, 1500);
    await expect(header).toHaveAttribute("data-pin", "hidden");

    /* Uma tecla antes do foco: assim o navegador trata o foco por script como :focus-visible. */
    await page.keyboard.press("Shift");
    await logoLink(page).focus();
    await expect(header).toHaveAttribute("data-pin", "shown");

    await scrollTo(page, 1900);
    await expect(header).toHaveAttribute("data-pin", "shown");
  });
});

test.describe("menu móvel", () => {
  test.beforeEach(({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "roda só no projeto de 375px");
    expect(isDesktop(page)).toBe(false);
  });

  test("abre como diálogo, marca a página atual, navega e fecha com Esc", async ({ page }) => {
    await page.goto("/sobre");
    await waitForEntrance(page);
    expect(await noHorizontalScroll(page)).toBe(true);

    const nav = page.getByRole("navigation", { name: NAV_NAME, exact: true });
    await expect(nav).toBeHidden();

    const trigger = page.getByRole("button", { name: "Abrir menu" });
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox?.width ?? 0).toBeGreaterThanOrEqual(48);
    expect(triggerBox?.height ?? 0).toBeGreaterThanOrEqual(48);

    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    for (const label of MAIN_NAV_LABELS) {
      const link = dialog.getByRole("link", { name: label, exact: true });
      await expect(link).toBeVisible();
      expect((await link.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    }
    await expect(dialog.getByRole("link", { name: "Avaliação", exact: true })).toHaveAttribute("href", "/avaliacao");
    await expect(dialog.getByRole("link", { name: "Loja", exact: true })).toHaveAttribute("href", "/loja");
    await expect(dialog.getByRole("link", { name: "Sobre", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(dialog.getByRole("link", { name: "Área do Aluno" })).toHaveAttribute("href", "/area-do-aluno");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await dialog.getByRole("link", { name: "Contato", exact: true }).click();
    await expect(page).toHaveURL(/\/contato$/);
    await expect(dialog).toBeHidden();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("o botão da Área do Aluno e o menu hambúrguer cabem em 48px dentro da base branca (inclusive em iPhone com zoom 340px)", async ({ page }) => {
    await page.goto("/");
    await waitForEntrance(page);
    const student = banner(page).getByRole("link", { name: "Área do Aluno" });
    const trigger = banner(page).getByRole("button", { name: "Abrir menu" });
    await expect(student).toBeVisible();
    await expect(trigger).toBeVisible();

    const pillBox = await pill(page).boundingBox();
    const studentBox = await student.boundingBox();
    const triggerBox = await trigger.boundingBox();
    expect(studentBox?.width ?? 0).toBe(48);
    expect(studentBox?.height ?? 0).toBe(48);
    expect(triggerBox?.width ?? 0).toBe(48);
    expect(triggerBox?.height ?? 0).toBe(48);
    expect((await logoLink(page).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    /* O botão hambúrguer nunca pode vazar da borda direita da pílula branca (mínimo 12px de respiro interno). */
    expect((pillBox?.x ?? 0) + (pillBox?.width ?? 0) - ((triggerBox?.x ?? 0) + (triggerBox?.width ?? 0))).toBeGreaterThanOrEqual(12);

    /* Simula tela estreita de iPhone com zoom de tela (340px CSS) e garante que o hambúrguer permanece dentro da base. */
    await page.setViewportSize({ width: 340, height: 812 });
    const narrowPill = await pill(page).boundingBox();
    const narrowTrigger = await trigger.boundingBox();
    expect((narrowPill?.x ?? 0) + (narrowPill?.width ?? 0) - ((narrowTrigger?.x ?? 0) + (narrowTrigger?.width ?? 0))).toBeGreaterThanOrEqual(11);
  });
});

test.describe("rodapé", () => {
  test("perfis sociais visíveis; WhatsApp abre app/web direto e perfis sem URL avisam", async ({ page }) => {
    await page.goto("/cursos");
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();

    /* Instagram, Facebook e LinkedIn seguem sem URL confirmada (botões com aviso); WhatsApp conecta direto ao app/web. */
    const pendingNetworks = ["Instagram", "Facebook", "LinkedIn"];
    const list = footer.getByRole("list", { name: "Redes sociais" });
    await expect(list).toBeVisible();
    await expect(list.getByRole("button")).toHaveCount(pendingNetworks.length);
    await expect(footer).not.toContainText("Perfis em confirmação");
    await expect(footer).not.toContainText("Professora e fonoaudióloga clínica");

    const whatsappLink = list.getByRole("link", { name: /WhatsApp/ });
    await expect(whatsappLink).toBeVisible();
    await expect(whatsappLink).toHaveAttribute("data-whatsapp-direct", "true");
    await expect(whatsappLink).toHaveAttribute("data-whatsapp-app", /^whatsapp:\/\/send\?phone=55/);
    await expect(whatsappLink).toHaveAttribute("data-whatsapp-web", /^https:\/\/web\.whatsapp\.com\/send\?phone=55/);
    await expect(whatsappLink).toHaveAttribute("href", /^https:\/\/wa\.me\/55/);

    const controls = [
      ...pendingNetworks.map((network) => list.getByRole("button", { name: new RegExp(network) })),
      whatsappLink,
    ];
    for (const control of controls) {
      await expect(control).toBeVisible();
      /* Alvo de toque: a célula do botão (o círculo visual tem 36px) precisa ter 48px; espera a entrada terminar. */
      const target = control.locator("xpath=..");
      await expect
        .poll(async () => {
          const box = await target.boundingBox();
          return Math.min(box?.width ?? 0, box?.height ?? 0);
        })
        .toBeGreaterThanOrEqual(48);
    }

    /* Ativar um perfil sem endereço mostra o aviso (uma região viva educada), dentro da tela. */
    const notice = footer.getByRole("status");
    await expect(notice).toHaveAttribute("aria-live", "polite");
    await list.getByRole("button", { name: /Instagram/ }).click();
    await expect(notice).toHaveText("Endereço em confirmação");
    const bubble = await notice.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 0;
    expect(bubble?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((bubble?.x ?? 0) + (bubble?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
    /* Some sozinho (o ponteiro sai de cima do botão para não manter o hover). */
    await page.mouse.move(0, 0);
    await expect(notice).toHaveText("", { timeout: 6000 });

    /* No mobile (<768px) o mapa do site e o logo ficam ocultos, deixando apenas redes sociais e barra legal. */
    if (isMobile(page)) {
      await expect(footer.getByRole("navigation")).toHaveCount(0);
      await expect(footer.getByRole("img", { name: "Salete Brocca" })).toBeHidden();
    } else {
      await expect(footer.getByRole("navigation")).toHaveCount(FOOTER_COLUMNS.length);
      await expect(footer.getByRole("img", { name: "Salete Brocca" })).toBeVisible();
    }
    await expect(footer).toContainText(`© ${new Date().getFullYear()} SaleteBrocca`);
    await expect(footer.getByRole("link", { name: "Política de privacidade" })).toHaveAttribute("href", "/privacidade");
    await expect(footer.getByRole("link", { name: "Termos de uso" })).toHaveAttribute("href", "/termos-de-uso");
    await expect(footer.getByRole("button", { name: "Voltar ao topo" })).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("4 colunas (Atendimento, Cursos, Conteúdo, Loja e temas) com no máximo 3 links cada e sem âncoras", async ({ page }) => {
    test.skip(isMobile(page), "no celular o mapa do site fica oculto (apenas redes sociais e barra legal)");
    await page.goto("/cursos");
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();

    await expect(footer.getByRole("navigation")).toHaveCount(FOOTER_COLUMNS.length);
    for (const column of FOOTER_COLUMNS) {
      expect(column.links.length).toBeLessThanOrEqual(3);
      const nav = footer.getByRole("navigation", { name: column.title, exact: true });
      await expect(nav.getByRole("heading", { level: 2, name: column.title })).toBeVisible();
      await expect(nav.getByRole("link")).toHaveText(column.links.map((link) => link.label));
      for (const link of column.links) {
        await expect(nav.getByRole("link", { name: link.label, exact: true })).toHaveAttribute("href", link.href);
      }
    }
    await expect(footer.getByRole("navigation", { name: "Profissão", exact: true })).toHaveCount(0);
  });

  test("'Marcar avaliação' do rodapé leva a /avaliacao", async ({ page }) => {
    test.skip(isMobile(page), "no celular o mapa do site fica oculto");
    await page.goto("/cursos");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: "Marcar avaliação", exact: true }).click();
    await expect(page).toHaveURL(/\/avaliacao$/, { timeout: 15_000 });
  });

  test("links não ganham sublinhado no hover: clareiam e recuam 3px", async ({ page }) => {
    test.skip(isMobile(page), "no celular o mapa do site fica oculto");
    await page.goto("/cursos");
    const footer = page.getByRole("contentinfo");
    const link = footer.getByRole("link", { name: "Catálogo" });
    await link.scrollIntoViewIfNeeded();

    const label = link.locator("span");
    const muted = await tokenColor(page, "--on-navy-muted");
    await expect(link).toHaveCSS("color", muted);

    await link.hover();
    await expect(link).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(link).toHaveCSS("text-decoration-line", "none");
    await expect(label).toHaveCSS("transform", "none");

    /* Todos os links das colunas, sem exceção. */
    const decorations = await footer.locator("nav a").evaluateAll((anchors) =>
      anchors.map((anchor) => getComputedStyle(anchor).textDecorationLine),
    );
    expect(decorations.length).toBe(FOOTER_COLUMNS.reduce((total, column) => total + column.links.length, 0));
    for (const decoration of decorations) expect(decoration).toBe("none");
  });

  test("foco por teclado desenha contorno ciano nos links", async ({ page }) => {
    test.skip(isMobile(page), "no celular o mapa do site fica oculto");
    await page.goto("/cursos");
    const footer = page.getByRole("contentinfo");
    const link = footer.getByRole("link", { name: "Todos os conteúdos" });
    await link.scrollIntoViewIfNeeded();
    await page.keyboard.press("Shift");
    await link.focus();

    await expect(link).toHaveCSS("outline-style", "solid");
    await expect(link).toHaveCSS("outline-width", "2px");
    await expect(link).toHaveCSS("outline-color", await tokenColor(page, "--cyan"));
  });

  test("os links legais levam a /privacidade e /termos-de-uso; Voltar ao topo rola ao início", async ({ page }) => {
    await page.goto("/sobre");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("button", { name: "Voltar ao topo" }).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    await footer.getByRole("button", { name: "Voltar ao topo" }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBe(0);

    await footer.getByRole("link", { name: "Política de privacidade" }).click();
    await expect(page).toHaveURL(/\/privacidade$/);

    await footer.getByRole("link", { name: "Termos de uso" }).click();
    await expect(page).toHaveURL(/\/termos-de-uso$/);
  });
});

test.describe("cabeçalho não cobre o conteúdo", () => {
  for (const route of ["/cursos", "/contato", "/area-do-aluno/login", "/privacidade", "/termos-de-uso", "/loja/checkout"]) {
    test(`${route}: a pílula termina antes do primeiro título`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await expect(pill(page)).toHaveCSS("opacity", "1");

      const h1 = page.getByRole("heading", { level: 1 }).first();
      await expect(h1).toBeVisible();
      const pillBox = await pill(page).boundingBox();
      const h1Box = await h1.boundingBox();
      if (!pillBox || !h1Box) throw new Error("sem caixa do cabeçalho ou do título");
      expect(pillBox.y + pillBox.height).toBeLessThanOrEqual(h1Box.y);
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }
});

test.describe("movimento reduzido", () => {
  for (const route of ["/cursos", "/contato"]) {
    test(`${route}: todo [data-reveal] fica visível`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);

      /* Rola a página inteira em passos: as entradas por viewport (inclusive as do rodapé) precisam disparar. */
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = (page.viewportSize()?.height ?? 800) * 0.6;
      for (let y = 0; y <= height; y += step) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
        await page.waitForTimeout(80);
      }
      await page.waitForTimeout(500);

      /* Opacidade efetiva (própria x ancestrais) de cada [data-reveal] com caixa na página. */
      await expect
        .poll(
          async () =>
            page.evaluate(() => {
              const hidden: string[] = [];
              const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
              for (const node of nodes) {
                if (node.getClientRects().length === 0) continue; // sem caixa: menu fechado, nav móvel oculta
                let opacity = 1;
                for (let el: HTMLElement | null = node; el; el = el.parentElement) {
                  opacity *= Number(getComputedStyle(el).opacity);
                }
                if (opacity < 0.99) hidden.push(`${node.tagName.toLowerCase()}.${node.className} (${opacity.toFixed(2)})`);
              }
              return hidden;
            }),
          { timeout: 15_000 },
        )
        .toEqual([]);

      expect(await page.locator("[data-reveal]").count()).toBeGreaterThan(3);
    });
  }

  test("a entrada do cabeçalho só usa opacidade", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/sobre");
    await expect(pill(page)).toHaveCSS("opacity", "1");
    const box = await pill(page).boundingBox();
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
    /* Sem deslocamento vertical residual: o topo da pílula é o topo do banner (40px, ou 16px no móvel). */
    const top = isDesktop(page) ? 40 : 16;
    expect(Math.abs((box?.y ?? 0) - top)).toBeLessThanOrEqual(1);
  });
});
