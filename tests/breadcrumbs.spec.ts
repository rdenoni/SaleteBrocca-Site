import { expect, test, type Page } from "@playwright/test";

/* Trilha de navegação das páginas de nível 2 ou mais (Cursos e Conteúdo), com BreadcrumbList em JSON-LD.
   Páginas de nível 1 e a Área do Aluno não têm trilha. */

const COURSE_SLUG = "dificuldades-na-aprendizagem";
const COURSE_TITLE = "Dificuldades na Aprendizagem";
const TRAIL_NAME = "Trilha de navegação";
const MIN_TARGET = 48;

interface TrailLink {
  label: string;
  path: string;
}

interface TrailCase {
  name: string;
  route: string;
  /** Do "Início" até o item anterior à página atual. */
  parents: TrailLink[];
  current: string;
}

const HOME: TrailLink = { label: "Início", path: "/" };

const CASES: TrailCase[] = [
  {
    name: "página do curso",
    route: `/cursos/${COURSE_SLUG}`,
    parents: [HOME, { label: "Cursos", path: "/cursos" }],
    current: COURSE_TITLE,
  },
  {
    name: "inscrição",
    route: `/cursos/${COURSE_SLUG}/compra`,
    parents: [HOME, { label: "Cursos", path: "/cursos" }, { label: COURSE_TITLE, path: `/cursos/${COURSE_SLUG}` }],
    current: "Inscrição",
  },
  {
    name: "categoria de conteúdo",
    route: "/conteudo/categoria/degluticao",
    parents: [HOME, { label: "Conteúdo", path: "/conteudo" }],
    current: "Deglutição",
  },
  {
    name: "artigo",
    route: "/conteudo/disfagia-sintomas-e-tratamento",
    parents: [
      HOME,
      { label: "Conteúdo", path: "/conteudo" },
      { label: "Deglutição", path: "/conteudo/categoria/degluticao" },
    ],
    current: "Disfagia",
  },
];

interface ListItem {
  "@type": string;
  position: number;
  name: string;
  item?: string;
}

interface BreadcrumbJsonLd {
  "@type": string;
  itemListElement: ListItem[];
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  /* Compara com o viewport configurado: no mobile, window.innerWidth cresce junto com o conteúdo que vaza. */
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

for (const trailCase of CASES) {
  test.describe(`Trilha — ${trailCase.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(trailCase.route);
    });

    test("links na ordem e página atual sem link", async ({ page }) => {
      const trail = page.getByRole("navigation", { name: TRAIL_NAME });
      await expect(trail).toHaveCount(1);
      const links = trail.getByRole("link");
      await expect(links).toHaveText(trailCase.parents.map((parent) => parent.label));
      for (const [index, parent] of trailCase.parents.entries()) {
        await expect(links.nth(index)).toHaveAttribute("href", parent.path);
      }
      const current = trail.locator("[aria-current='page']");
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(trailCase.current);
      await expect(current.getByRole("link")).toHaveCount(0);
    });

    test("alvos de 48px e sem rolagem horizontal", async ({ page }) => {
      const heights = await page
        .getByRole("navigation", { name: TRAIL_NAME })
        .getByRole("link")
        .evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLElement).offsetHeight));
      expect(heights).toHaveLength(trailCase.parents.length);
      for (const height of heights) expect(height).toBeGreaterThanOrEqual(MIN_TARGET);
      await expectNoHorizontalScroll(page);
    });

    test("BreadcrumbList em JSON-LD igual à trilha visível", async ({ page }) => {
      const scripts = page.locator("script[type='application/ld+json']");
      await expect(scripts).toHaveCount(1);
      const data = JSON.parse((await scripts.first().textContent()) ?? "null") as BreadcrumbJsonLd;
      expect(data["@type"]).toBe("BreadcrumbList");

      const expected = [...trailCase.parents, { label: trailCase.current, path: trailCase.route }];
      const elements = data.itemListElement;
      expect(elements).toHaveLength(expected.length);
      for (const [index, entry] of expected.entries()) {
        const element = elements[index];
        expect(element["@type"]).toBe("ListItem");
        expect(element.position).toBe(index + 1);
        expect(element.name).toBe(entry.label);
        if (index === expected.length - 1) {
          expect(element.item).toBeUndefined();
        } else {
          /* URL absoluta em https (o buscador exige), com o caminho exato do item. */
          const url = new URL(element.item ?? "");
          expect(url.protocol).toBe("https:");
          expect(url.hostname).not.toBe("localhost");
          expect(url.pathname).toBe(entry.path);
        }
      }
    });
  });
}

test.describe("Trilha — fora das páginas de nível 2", () => {
  for (const route of ["/cursos", "/conteudo", "/sobre", "/area-do-aluno/login"]) {
    test(`${route} não tem trilha`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("navigation", { name: TRAIL_NAME })).toHaveCount(0);
    });
  }
});
