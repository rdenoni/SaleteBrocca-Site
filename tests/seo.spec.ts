import { expect, test, type APIRequestContext } from "@playwright/test";

/* sitemap.xml e robots.txt: o sitemap lista só páginas indexáveis (respondem 200 e não têm noindex) e as páginas
   com noindex ficam de fora. Testes de servidor: rodam uma vez, no projeto desktop. */

const NOINDEX_ROUTES = [
  "/area-do-aluno/login",
  "/termos-de-uso",
  "/cursos/dificuldades-na-aprendizagem/compra",
  "/loja/checkout",
] as const;

const NOINDEX_META = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i;

async function sitemapUrls(request: APIRequestContext): Promise<URL[]> {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => new URL(match[1]));
}

test.describe("SEO: sitemap e robots", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Teste de servidor: basta um projeto.");
  });

  test("robots.txt libera o rastreamento e aponta o sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toMatch(/Allow: \/$/m);
    expect(body).not.toMatch(/Disallow/i);
    const sitemapLine = body.match(/^Sitemap: (\S+)$/m);
    expect(sitemapLine).not.toBeNull();
    const sitemap = new URL(sitemapLine?.[1] ?? "");
    expect(sitemap.protocol).toBe("https:");
    expect(sitemap.pathname).toBe("/sitemap.xml");
  });

  test("o sitemap usa um único endereço https, sem datas inventadas", async ({ request }) => {
    const urls = await sitemapUrls(request);
    expect(urls.length).toBeGreaterThan(0);
    const origins = new Set(urls.map((url) => url.origin));
    expect(origins.size).toBe(1);
    expect(urls.every((url) => url.protocol === "https:" && url.hostname !== "localhost")).toBe(true);
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).not.toMatch(/<lastmod>|<priority>|<changefreq>/);
    expect(urls.map((url) => url.pathname)).toEqual(
      expect.arrayContaining(["/", "/cursos", "/cursos/dificuldades-na-aprendizagem", "/avaliacao", "/sobre", "/contato"]),
    );
  });

  test("toda página do sitemap responde 200 e não tem noindex", async ({ request }) => {
    for (const url of await sitemapUrls(request)) {
      const response = await request.get(url.pathname, { maxRedirects: 0 });
      expect(response.status(), url.pathname).toBe(200);
      expect(await response.text(), url.pathname).not.toMatch(NOINDEX_META);
    }
  });

  test("as páginas com noindex ficam fora do sitemap", async ({ request }) => {
    const paths = (await sitemapUrls(request)).map((url) => url.pathname);
    for (const route of NOINDEX_ROUTES) {
      const html = await (await request.get(route)).text();
      expect(html, route).toMatch(NOINDEX_META);
      expect(paths, route).not.toContain(route);
    }
    expect(paths.some((path) => path.startsWith("/area-do-aluno"))).toBe(false);
  });
});
