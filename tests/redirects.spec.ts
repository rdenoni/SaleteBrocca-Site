import { expect, test } from "@playwright/test";

const SLUG = "dificuldades-na-aprendizagem";

/* A compra dos cursos vive em /cursos: a página e o checkout antigos de curso na Loja redirecionam com 301
   (regras em next.config.ts). O Next repassa a query da requisição ao destino e não há como removê-la, então
   ?produto= sobrevive no Location; a página de destino a ignora. */
test.describe("Redirecionamentos 301 da Loja para /cursos", () => {
  const MOVED = [
    {
      from: `/loja/${SLUG}`,
      to: `/cursos/${SLUG}`,
    },
    {
      from: `/loja/checkout?produto=${SLUG}`,
      to: `/cursos/${SLUG}/compra?produto=${SLUG}`,
    },
  ] as const;

  for (const { from, to } of MOVED) {
    test(`${from} -> 301 ${to}`, async ({ request, baseURL }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      const location = response.headers()["location"];
      expect(location).toBeTruthy();
      const target = new URL(location, baseURL);
      expect(target.pathname + target.search).toBe(to);
    });
  }

  test("o endereço antigo do curso termina na página do curso (200)", async ({ request, baseURL }) => {
    const response = await request.get(`/loja/${SLUG}`);
    expect(response.status()).toBe(200);
    expect(new URL(response.url(), baseURL).pathname).toBe(`/cursos/${SLUG}`);
  });

  test("a compra antiga termina na inscrição do curso (200)", async ({ request, baseURL }) => {
    const response = await request.get(`/loja/checkout?produto=${SLUG}`);
    expect(response.status()).toBe(200);
    expect(new URL(response.url(), baseURL).pathname).toBe(`/cursos/${SLUG}/compra`);
  });

  /* A Loja tem a categoria "Cursos" (vitrine): nenhum filtro ?categoria= redireciona. */
  for (const categoria of ["cursos", "aplicativos", "jogos", "kits", "materiais"]) {
    test(`?categoria=${categoria} não redireciona: o filtro segue na Loja`, async ({ request }) => {
      const response = await request.get(`/loja?categoria=${categoria}`, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
    });
  }

  test("produto avulso da Loja não redireciona", async ({ request }) => {
    const response = await request.get("/loja/brinqueletrando-box", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("/loja/checkout sem produto não redireciona", async ({ request }) => {
    const response = await request.get("/loja/checkout", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("/loja/qualquer-coisa responde 404 (slug sem produto, sem redirecionamento)", async ({ request }) => {
    const response = await request.get("/loja/qualquer-coisa", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });
});
