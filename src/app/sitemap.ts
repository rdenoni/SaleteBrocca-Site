import type { MetadataRoute } from "next";
import { ARTICLES_ARE_EXAMPLES, getArticleCategories, getArticles } from "@/lib/content/articles";
import { getCourses } from "@/lib/content/courses";
import { absoluteUrl } from "@/lib/site-url";

/* Só as páginas indexáveis. Ficam fora as que levam noindex:
   - Área do Aluno (privada), inscrição do curso (/cursos/[slug]/compra) e checkout da loja;
   - /termos-de-uso, enquanto o texto não existir;
   - toda a árvore /conteudo enquanto os artigos forem de exemplo (a mesma flag que põe o noindex no layout).
   Sem lastModified, changeFrequency ou priority: não há datas reais para informar. */
const STATIC_ROUTES = ["/", "/cursos", "/avaliacao", "/sobre", "/contato", "/loja", "/privacidade"] as const;

function contentRoutes(): string[] {
  if (ARTICLES_ARE_EXAMPLES) return [];
  return [
    "/conteudo",
    ...getArticleCategories().map((category) => `/conteudo/categoria/${category.slug}`),
    ...getArticles().map((article) => `/conteudo/${article.slug}`),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...STATIC_ROUTES,
    ...getCourses().map((course) => `/cursos/${course.slug}`),
    ...contentRoutes(),
  ];
  return routes.map((route) => ({ url: absoluteUrl(route) }));
}
