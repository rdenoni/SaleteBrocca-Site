import { expect, test, type Page } from "@playwright/test";

const COURSE = "/area-do-aluno/cursos/dificuldades-na-aprendizagem";
const CURRENT_LESSON = `${COURSE}/aulas/m01-a02`;

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

test.describe("Área do Aluno — login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/area-do-aluno/login");
  });

  test("valida, mostra senha e explica que o login não está ativo", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Área do Aluno" })).toBeVisible();
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
    await expect(page.getByText("Informe sua senha.")).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeFocused();

    await page.getByLabel("E-mail").fill("aluno@exemplo.com");
    await page.getByLabel("Senha", { exact: true }).fill("teste-123");
    await page.getByLabel("Mostrar senha").check();
    await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Entrar" }).click();
    /* No conteúdo: o rodapé também tem uma região de status (aviso dos perfis sociais em confirmação). */
    await expect(page.getByRole("main").getByRole("status")).toContainText("O login ainda não está ativo.");
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "login");
  });
});

test.describe("Área do Aluno — painel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/area-do-aluno");
  });

  test("aviso de demonstração, sub-navegação e progresso de exemplo", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("note").filter({ hasText: "Demonstração." })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Seções da Área do Aluno" }).getByRole("link", { name: "Início" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("progressbar", { name: "Progresso geral" })).toHaveAttribute("aria-valuenow", "14");
    const panel = page.getByRole("region", { name: "Últimos materiais" });
    await expect(panel.getByRole("listitem")).toHaveText([/Comece aqui/, /Guia prático/, /Quadros essenciais/]);
    await expect(page.getByText("Nenhuma compra registrada")).toBeVisible();
  });

  test("header marca Área do Aluno como página atual", async ({ page }) => {
    await expect(page.locator("header").getByRole("link", { name: "Área do Aluno", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("continuar leva à aula em andamento", async ({ page }) => {
    await page.getByRole("link", { name: "Continuar aula" }).click();
    await expect(page).toHaveURL(CURRENT_LESSON);
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "painel");
  });
});

test.describe("Área do Aluno — cursos", () => {
  test("meus cursos lista o curso e o estado vazio", async ({ page }) => {
    await page.goto("/area-do-aluno/cursos");
    await expect(page.getByRole("heading", { level: 2, name: "Dificuldades na Aprendizagem" })).toBeVisible();
    await expect(page.getByText("Você ainda não tem outros cursos")).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("curso mostra 21 aulas com estado em palavra", async ({ page }) => {
    await page.goto(COURSE);
    await expect(page.locator(`main a[href^="${COURSE}/aulas/"]`)).toHaveCount(22); // 21 aulas + "Continuar aula"
    const current = page.getByRole("link", { name: /Transtornos específicos da aprendizagem/ });
    await expect(current).toBeVisible();
    await expect(current).toContainText("Em andamento");
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "curso-aluno");
  });
});

test.describe("Área do Aluno — player", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CURRENT_LESSON);
  });

  test("aula atual, navegação e conclusão", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Transtornos específicos da aprendizagem" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Aulas do curso" }).locator('[aria-current="page"]')).toHaveCount(1);
    const complete = page.getByRole("button", { name: "Marcar como concluída" });
    await expect(complete).toHaveAttribute("aria-pressed", "false");
    await complete.click();
    await expect(complete).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("link", { name: "Próxima aula" }).click();
    await expect(page).toHaveURL(`${COURSE}/aulas/m01-a03`);
  });

  test("abas funcionam com mouse e teclado", async ({ page }) => {
    const tabs = page.getByRole("tablist", { name: "Sobre a aula" });
    await tabs.getByRole("tab", { name: "Descrição" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: "Materiais da aula" })).toBeFocused();
    await expect(page.getByRole("tabpanel", { name: "Materiais da aula" }).getByRole("listitem")).toHaveText([
      /Quadros essenciais/,
    ]);
    await tabs.getByRole("tab", { name: "Anotações" }).click();
    await expect(page.getByRole("tabpanel", { name: "Anotações" })).toBeVisible();
  });

  test("sem rolagem horizontal", async ({ page }) => {
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "player");
  });

  test("primeira aula não tem aula anterior", async ({ page }) => {
    await page.goto(`${COURSE}/aulas/m00-a01`);
    await expect(page.getByRole("link", { name: "Aula anterior" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Próxima aula" })).toBeVisible();
  });

  test("animação de entrada roda uma única vez e não repete ao trocar de aula ou recarregar", async ({ page }) => {
    /* Aguarda o registro da primeira entrada no localStorage. */
    await page.waitForFunction(() => window.localStorage.getItem("salete-brocca:lesson-entrance-seen") === "1");

    /* Troca de aula: entrada imediata (sem elementos ocultos em opacity 0). */
    await page.getByRole("link", { name: "Próxima aula" }).click();
    await expect(page).toHaveURL(`${COURSE}/aulas/m01-a03`);
    const hiddenAfterSwitch = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (!main) return -1;
      return Array.from(main.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => {
        if (el.offsetParent === null) return false;
        return parseFloat(getComputedStyle(el).opacity) < 0.99;
      }).length;
    });
    expect(hiddenAfterSwitch).toBe(0);

    /* Recarga completa do site: continua sem repetir a animação de entrada. */
    await page.reload({ waitUntil: "load" });
    await expect(page.locator("h1")).toBeVisible();
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const main = document.querySelector("main");
            if (!main) return -1;
            return Array.from(main.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => {
              if (el.offsetParent === null) return false;
              return parseFloat(getComputedStyle(el).opacity) < 0.99;
            }).length;
          }),
        { timeout: 1500 },
      )
      .toBe(0);
  });

  test("mantém a posição de scroll ao recarregar a página", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 420));
    await page.waitForFunction(
      () => Number(window.sessionStorage.getItem(`salete-brocca:scroll:${window.location.pathname}`) ?? 0) >= 350,
    );
    await page.reload({ waitUntil: "load" });
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 2000 }).toBeGreaterThanOrEqual(350);
  });
});

test.describe("Área do Aluno — materiais", () => {
  test("lista os 11 PDFs na ordem, com link pela rota protegida", async ({ page }) => {
    await page.goto("/area-do-aluno/materiais");
    await expect(page.getByRole("heading", { level: 1, name: "Materiais complementares" })).toBeVisible();
    const items = page.getByRole("main").getByRole("listitem").filter({ has: page.getByRole("link", { name: /Baixar/ }) });
    await expect(items).toHaveCount(11);
    await expect(items.first()).toContainText("00 · Comece aqui: biblioteca de materiais");
    await expect(items.last()).toContainText("10 · Revisão rápida dos 6 módulos");
    await expect(items.nth(1).getByRole("link")).toHaveAttribute("href", "/api/materiais/guia-pratico");
    await expectNoHorizontalScroll(page);
    await fullPageShot(page, "materiais");
  });

  test("aba Materiais da aula lista os PDFs da aula; sem PDF mostra o estado vazio", async ({ page }) => {
    for (const [lesson, expected] of [
      ["m02-a05", [/Quadros essenciais/, /Casos para pensar/, /Ferramentas de observação/]],
      ["m00-a01", []],
    ] as const) {
      await page.goto(`${COURSE}/aulas/${lesson}?aba=materiais`);
      const panel = page.getByRole("tabpanel", { name: "Materiais da aula" });
      await expect(panel).toBeVisible();
      if (expected.length) {
        await expect(panel.getByRole("listitem")).toHaveText([...expected]);
        await expect(panel.getByRole("link").first()).toHaveAttribute("href", "/api/materiais/quadros-essenciais");
        await expectNoHorizontalScroll(page);
        await fullPageShot(page, "aula-materiais");
      } else {
        await expect(panel.getByText("Nenhum material nesta aula")).toBeVisible();
      }
    }
  });
});
