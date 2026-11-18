import { expect, test, type Locator, type Page } from "@playwright/test";
import { getCourses } from "../src/lib/content/courses";
import { getCourseFaq } from "../src/lib/content/faq";

/* Dúvidas frequentes: recorte na Home (depois dos cursos), lista completa em /cursos e na página do curso.
   As respostas vêm dos dados do curso; nada de valor, carga horária ou certificado inventado. */

const [course] = getCourses();
const COURSE_PATH = `/cursos/${course.slug}`;
const FULL_FAQ = getCourseFaq(course);

const faqSection = (page: Page): Locator => page.locator("section#duvidas");
const questions = (page: Page): Locator => faqSection(page).locator("summary");

async function noHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

test.describe("dúvidas frequentes na Home", () => {
  test("vem logo depois dos cursos, com 4 perguntas e atalho para a lista completa", async ({ page }) => {
    await page.goto("/");
    const section = faqSection(page);
    await expect(section).toHaveCount(1);

    const neighbours = await section.evaluate((element) => ({
      previous: element.previousElementSibling?.id ?? null,
      next: element.nextElementSibling?.getAttribute("aria-label") ?? null,
    }));
    expect(neighbours).toEqual({ previous: "cursos", next: "Frase-conceito" });

    await expect(questions(page)).toHaveCount(4);
    await expect(section.getByRole("link", { name: "Ver todas as dúvidas" })).toHaveAttribute("href", "/cursos#duvidas");
  });
});

test.describe("dúvidas frequentes em /cursos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cursos");
  });

  test("lista todas as perguntas, todas fechadas, com alvo de toque de 48px", async ({ page }) => {
    await expect(faqSection(page).getByRole("heading", { level: 2, name: "Dúvidas frequentes" })).toBeVisible();
    await expect(questions(page)).toHaveCount(FULL_FAQ.length);
    await expect(faqSection(page).locator("details[open]")).toHaveCount(0);

    const heights = await questions(page).evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height));
    heights.forEach((height) => expect(height).toBeGreaterThanOrEqual(48));
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("abre com clique e com o teclado, e a resposta vem dos dados do curso", async ({ page }) => {
    const audience = page.locator("#duvida-para-quem");
    await audience.locator("summary").click();
    await expect(audience).toHaveAttribute("open", "");
    await expect(audience).toContainText(course.audience);

    const diagnosis = page.locator("#duvida-diagnostico");
    await diagnosis.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(diagnosis).toHaveAttribute("open", "");
    await expect(diagnosis).toContainText(course.notice);

    await page.keyboard.press("Enter");
    await expect(diagnosis).not.toHaveAttribute("open", "");
  });

  test("valor, carga horária e certificado: nada inventado enquanto não houver confirmação", async ({ page }) => {
    const commercial = page.locator("#duvida-valor");
    await commercial.locator("summary").click();
    if (Object.values(course.commercial).every((value) => value === null)) {
      await expect(commercial).toContainText("ainda não foram divulgados");
      await expect(commercial).not.toContainText("R$");
    }
    /* Valor confirmado aparece; o que falta continua dito como pendente. */
    if (course.commercial.price) await expect(commercial).toContainText(`Investimento: ${course.commercial.price}`);
    if (course.commercial.workload === null) await expect(commercial).toContainText("ainda não foram divulgados");
    await expect(commercial.getByRole("link", { name: "Perguntar pelo formulário de contato" })).toHaveAttribute(
      "href",
      "/contato#formulario",
    );
  });
});

test.describe("dúvidas frequentes na página do curso", () => {
  test("ficam no fim da página e não apontam para a própria página", async ({ page }) => {
    await page.goto(COURSE_PATH);
    await expect(questions(page)).toHaveCount(FULL_FAQ.length);

    const modules = page.locator("#duvida-organizacao");
    await modules.locator("summary").click();
    await expect(modules.locator("li")).toHaveCount(course.modules.length);
    await expect(modules.getByRole("link")).toHaveCount(0);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
