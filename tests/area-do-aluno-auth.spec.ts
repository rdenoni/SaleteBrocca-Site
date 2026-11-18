import { loadEnvConfig } from "@next/env";
import { expect, test, type Page } from "@playwright/test";

/* Lê .env.local como o `next build` lê: runner e servidor concordam sobre o modo (com ou sem Supabase). */
loadEnvConfig(process.cwd());

/* Login real da Área do Aluno (Supabase Auth).
   - Os fluxos com login só rodam com Supabase configurado no build/servidor (NEXT_PUBLIC_SUPABASE_URL e
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) e com uma conta de teste que tenha matrícula ativa em
     "dificuldades-na-aprendizagem": TEST_STUDENT_EMAIL e TEST_STUDENT_PASSWORD. Nada disso fica no repositório.
   - O teste do modo demonstração roda só quando o Supabase NÃO está configurado. */
const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
const EMAIL = process.env.TEST_STUDENT_EMAIL ?? "";
const PASSWORD = process.env.TEST_STUDENT_PASSWORD ?? "";
const HAS_TEST_ACCOUNT = Boolean(EMAIL && PASSWORD);

const COURSE = "/area-do-aluno/cursos/dificuldades-na-aprendizagem";
const LESSON = `${COURSE}/aulas/m01-a03`;

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("Área do Aluno — sem Supabase (demonstração)", () => {
  test.skip(SUPABASE_CONFIGURED, "Supabase configurado: as telas de senha usam o fluxo real (testado abaixo).");

  test("recuperar senha e definir senha abrem e avisam que o login não está ativo", async ({ page }) => {
    for (const path of ["/area-do-aluno/recuperar-senha", "/area-do-aluno/definir-senha"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByText("O login ainda não está ativo.")).toBeVisible();
      await expect(page.getByRole("link", { name: "Voltar para o login" })).toBeVisible();
    }
  });

  test("/auth/confirm sem Supabase volta para o login", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=x&type=recovery");
    await expect(page).toHaveURL(/\/area-do-aluno\/login$/);
  });

  test("/auth/confirmar sem Supabase volta para o login", async ({ page }) => {
    await page.goto("/auth/confirmar?token_hash=x&type=invite");
    await expect(page).toHaveURL(/\/area-do-aluno\/login$/);
  });
});

test.describe("Link do e-mail — com Supabase (GET não consome o token)", () => {
  test.skip(!SUPABASE_CONFIGURED, "Precisa do Supabase configurado no build/servidor.");

  test("/auth/confirm repassa para /auth/confirmar sem gastar o token", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=x&type=invite&next=/area-do-aluno/definir-senha&extra=1");
    await expect(page).toHaveURL(
      /\/auth\/confirmar\?token_hash=x&type=invite&next=%2Farea-do-aluno%2Fdefinir-senha$/,
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Confirmar acesso" })).toBeVisible();
    const button = page.getByRole("button", { name: "Continuar" });
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
    /* Não clica: com um token falso só passaria pelo caminho de falha. */
  });

  test("/auth/confirmar sem token nem code volta ao login com aviso", async ({ page }) => {
    await page.goto("/auth/confirmar");
    await expect(page).toHaveURL(/\/area-do-aluno\/login\?aviso=link-invalido$/);
  });
});

test.describe("Área do Aluno — com login real", () => {
  test.skip(
    !SUPABASE_CONFIGURED || !HAS_TEST_ACCOUNT,
    "Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, TEST_STUDENT_EMAIL e TEST_STUDENT_PASSWORD " +
      "(conta com matrícula ativa) para rodar os fluxos autenticados.",
  );
  /* O estado da conta de teste é compartilhado: um teste por vez. */
  test.describe.configure({ mode: "serial" });
  /* Os três projetos (desktop, tablet, mobile) rodam em paralelo: com uma conta só, um deles basta. */
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Conta de teste compartilhada: roda só no projeto desktop.");
  });

  test("sem sessão, /area-do-aluno leva ao login com o destino em ?next", async ({ page }) => {
    await page.goto("/area-do-aluno");
    await expect(page).toHaveURL(/\/area-do-aluno\/login\?next=%2Farea-do-aluno$/);
    await expect(page.getByRole("heading", { level: 1, name: "Área do Aluno" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Esqueci minha senha" })).toBeVisible();
  });

  test("senha errada mostra a mensagem genérica", async ({ page }) => {
    await page.goto("/area-do-aluno/login");
    await signIn(page, EMAIL, `${PASSWORD}-errada`);
    await expect(page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos." })).toBeVisible();
    await expect(page).toHaveURL(/\/area-do-aluno\/login/);
  });

  test("login leva ao painel e respeita o destino pedido", async ({ page }) => {
    await page.goto(`/area-do-aluno/login?next=${encodeURIComponent(COURSE)}`);
    await signIn(page, EMAIL, PASSWORD);
    await expect(page).toHaveURL(new RegExp(`${COURSE}$`));
    await page.goto("/area-do-aluno");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("note").filter({ hasText: "Demonstração." })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
  });

  test("destino externo em ?next é ignorado", async ({ page }) => {
    await page.goto(`/area-do-aluno/login?next=${encodeURIComponent("//example.com/x")}`);
    await signIn(page, EMAIL, PASSWORD);
    await expect(page).toHaveURL(/\/area-do-aluno$/);
  });

  test("aula marcada continua marcada depois de recarregar", async ({ page }) => {
    await page.goto(`/area-do-aluno/login?next=${encodeURIComponent(LESSON)}`);
    await signIn(page, EMAIL, PASSWORD);
    await expect(page).toHaveURL(new RegExp(`${LESSON}$`));

    const button = page.getByRole("button", { name: "Marcar como concluída" });
    /* Começa de um estado conhecido: desmarcada. */
    if ((await button.getAttribute("aria-pressed")) === "true") {
      await button.click();
      await expect(button).toBeEnabled();
    }
    await expect(button).toHaveAttribute("aria-pressed", "false");

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(button).toBeEnabled(); // a ação terminou
    await page.reload();
    await expect(page.getByRole("button", { name: "Marcar como concluída" })).toHaveAttribute("aria-pressed", "true");

    /* Limpa: deixa a aula desmarcada. */
    await page.getByRole("button", { name: "Marcar como concluída" }).click();
    await expect(page.getByRole("button", { name: "Marcar como concluída" })).toBeEnabled();
    await page.reload();
    await expect(page.getByRole("button", { name: "Marcar como concluída" })).toHaveAttribute("aria-pressed", "false");
  });

  test("Sair encerra a sessão e volta ao login", async ({ page }) => {
    await page.goto("/area-do-aluno/login");
    await signIn(page, EMAIL, PASSWORD);
    await expect(page).toHaveURL(/\/area-do-aluno$/);

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/area-do-aluno\/login$/);
    await page.goto("/area-do-aluno");
    await expect(page).toHaveURL(/\/area-do-aluno\/login\?next=/);
  });
});
