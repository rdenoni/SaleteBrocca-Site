import { expect, test } from "@playwright/test";

test.describe("painel administrativo (Etapas 0 a 4)", () => {
  test("Etapa 0: /admin renderiza dashboard sem NAV/Footer públicos, com noindex e sidebar responsiva", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Painel Administrativo" })).toBeVisible();

    /* Sem barra NAV nem rodapé do site público dentro do painel ADM. */
    await expect(page.locator('nav[aria-label="Principal"]')).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");

    const width = page.viewportSize()?.width ?? 1440;
    const sidebar = page.locator("#admin-sidebar-nav");
    if (width >= 1100) {
      await expect(sidebar).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Financeiro" })).toBeVisible();
    } else {
      const toggle = page.getByRole("button", { name: "Módulos" });
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(sidebar).toBeVisible();
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    if (width === 1440 || width === 375) {
      await page.screenshot({ path: `tests/screenshots/current/admin-v2-${width}.png`, fullPage: true });
    }
  });

  test("Etapa 1: /admin/hero e /admin/links renderizam formulários sem overflow", async ({ page }) => {
    await page.goto("/admin/hero");
    await expect(page.getByRole("heading", { level: 1, name: "Hero & Depoimentos" })).toBeVisible();
    await page.getByRole("tab", { name: /Comentários/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Comentários / Depoimentos" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/admin/links");
    await expect(page.getByRole("heading", { level: 1, name: "Links & Contato" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Instagram" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 2: /admin/conteudo alterna entre Artigos e Podcasts sem overflow", async ({ page }) => {
    await page.goto("/admin/conteudo");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Artigos & Podcasts" })).toBeVisible();
    await page.getByRole("button", { name: "Novo artigo" }).click();
    await expect(page.getByRole("heading", { level: 3, name: "Adicionar novo artigo" })).toBeVisible();

    await page.getByRole("tab", { name: /Podcasts/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Episódios de Podcast" })).toBeVisible();
    await page.getByRole("button", { name: "Novo episódio" }).click();
    await expect(page.getByRole("heading", { level: 3, name: "Adicionar novo episódio de podcast" })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 3: /admin/usuarios e /admin/cadastro renderizam KPIs, busca, IPs e capacidade", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Usuários" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: /Buscar usuário/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Bloquear IPs/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/admin/cadastro");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Cadastro & Capacidade" })).toBeVisible();
    await expect(page.getByRole("progressbar")).toBeVisible();
    await expect(page.getByText(/vagas disponíveis/i).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 4: /admin/financeiro renderiza KPIs e abas Extrato, Estornos e Logs sem overflow", async ({ page }) => {
    await page.goto("/admin/financeiro");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Financeiro (Kiwify & Hotmart)" })).toBeVisible();
    await expect(page.getByText("Receita Líquida", { exact: true })).toBeVisible();
    await expect(page.getByText("Receita Bruta", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: /Auditoria de Estornos/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: /Auditoria de Reembolsos/i })).toBeVisible();

    await page.getByRole("tab", { name: /Logs de Webhooks/i }).click();
    await expect(page.getByRole("heading", { level: 2, name: /Logs de Webhooks/i })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 5: /admin/crm renderiza KPIs, busca e novo lead sem overflow", async ({ page }) => {
    await page.goto("/admin/crm");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "CRM & Leads" })).toBeVisible();
    await expect(page.getByText("Total de Leads", { exact: true })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: /Buscar lead/i })).toBeVisible();
    await page.getByRole("button", { name: "Novo lead" }).click();
    await expect(page.getByRole("button", { name: "Salvar lead" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 6: /admin/suporte renderiza KPIs, filtros e novo ticket sem overflow", async ({ page }) => {
    await page.goto("/admin/suporte");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Suporte — Tickets" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: /Buscar ticket/i })).toBeVisible();
    await expect(page.getByRole("combobox", { name: /Filtrar categoria/i })).toBeVisible();
    await page.getByRole("button", { name: "Novo ticket" }).click();
    await expect(page.getByRole("button", { name: "Criar ticket" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 7: /admin/sessoes renderiza tabela de sessões e limpeza sem overflow", async ({ page }) => {
    await page.goto("/admin/sessoes");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Sessões Ativas" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Coordenadas" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Limpar sessões/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 8: /admin/stream renderiza métricas Mux sem overflow", async ({ page }) => {
    await page.goto("/admin/stream");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Stream (Mux)" })).toBeVisible();
    await expect(page.getByText("Minutos armazenados", { exact: true })).toBeVisible();
    await expect(page.getByText("Banda estimada (30d)", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 9: /admin/backup renderiza exportação AES-256-GCM, GitHub e restauração sem overflow", async ({ page }) => {
    await page.goto("/admin/backup");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Backup Completo do Sistema" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Exportar backup/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Enviar backup no GitHub/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Validar e restaurar backup/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Etapa 10: /admin/marketing, /admin/lgpd e /admin/emails renderizam sem overflow", async ({ page }) => {
    await page.goto("/admin/marketing");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Marketing / Analytics" })).toBeVisible();
    await expect(page.getByText("Purchase NÃO disparado no frontend", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/admin/lgpd");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Relatório de Conformidade LGPD" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /1\. Criptografia em Trânsito/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /8\. Direitos do Titular/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/admin/emails");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: /ADM — Verificar e Responder E-mails/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar e-mail" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("login admin: /admin/login renderiza formulário isolado e botão da Home fica oculto para visitantes", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Entrar no Painel Admin" })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar no painel" })).toBeVisible();
    await expect(page.locator('nav[aria-label="Principal"]')).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.locator("#admin-sidebar-nav")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/");
    await expect(page.getByRole("link", { name: "Abrir Painel Administrativo" })).toHaveCount(0);
  });

  test("integracoes: /admin/integracoes renderiza campos de variáveis pendentes sem overflow", async ({ page }) => {
    await page.goto("/admin/integracoes");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Variáveis & Chaves de Integração" })).toBeVisible();
    await expect(page.getByLabel("Hotmart Webhook Token (HOTTOK)")).toBeVisible();
    await expect(page.getByLabel("Chave de Criptografia AES-256-GCM")).toBeVisible();
    await expect(page.getByRole("button", { name: "Gerar chave" }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Centro de Custos: /admin/custos exibe assinaturas ativas, KPIs e formulário sem overflow", async ({ page }) => {
    await page.goto("/admin/custos");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: /Centro de Custos/i })).toBeVisible();
    await expect(page.getByText("Netlify", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Supabase", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("GoDaddy · Domínio saletebrocca.com")).toBeVisible();
    await expect(page.getByText("Mux Video / Stream")).toBeVisible();
    await expect(page.getByRole("button", { name: "Adicionar assinatura" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
