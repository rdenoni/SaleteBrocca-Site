import { expect, test } from "@playwright/test";
import { getCourse } from "../src/lib/content/courses";
import { MATERIALS } from "../src/lib/content/materials";

/* Catálogo de materiais e a rota de download. Roda uma vez, no projeto "desktop". */
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "lógica pura e API: basta rodar uma vez");
});

test("todo código de aula dos materiais existe no catálogo do curso", () => {
  for (const material of MATERIALS) {
    const course = getCourse(material.courseSlug);
    expect(course, material.id).toBeDefined();
    const codes = new Set(course?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.code)));
    for (const code of material.lessonCodes) expect(codes.has(code), `${material.id}: ${code}`).toBe(true);
  }
});

test("ids são únicos, seguros para URL e o href aponta para a rota protegida", () => {
  expect(new Set(MATERIALS.map((material) => material.id)).size).toBe(MATERIALS.length);
  for (const material of MATERIALS) {
    expect(material.id).toMatch(/^[a-z0-9-]+$/);
    expect(material.href).toBe(`/api/materiais/${material.id}`);
  }
});

/* Os testes rodam sem Supabase (modo demonstração): a rota nunca entrega arquivo. */
test("rota: material inexistente responde 404", async ({ request }) => {
  const response = await request.get("/api/materiais/nao-existe");
  expect(response.status()).toBe(404);
});

test("rota: sem Supabase responde 503 e não redireciona", async ({ request }) => {
  const response = await request.get("/api/materiais/guia-pratico", { maxRedirects: 0 });
  expect(response.status()).toBe(503);
  expect(response.headers()["cache-control"]).toContain("no-store");
});
