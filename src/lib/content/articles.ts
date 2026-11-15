import type { Article, ArticleCategory } from "@/types/content";

/* Categorias PROPOSTAS a partir dos temas dos três artigos do site de referência.
   Validar nomes e organização com a cliente. */
const CATEGORIES: readonly ArticleCategory[] = [
  { slug: "audicao", label: "Audição" },
  { slug: "degluticao", label: "Deglutição" },
  { slug: "comportamento-infantil", label: "Comportamento infantil" },
];

/* Títulos e fotos dos três destaques do site de referência (PSD da cliente).
   Os textos completos e as datas ainda serão fornecidos: body e publishedAt ficam null. */
const ARTICLES: readonly Article[] = [
  {
    slug: "pac-avaliacao-do-processamento-auditivo",
    keyword: "PAC:",
    title: "Como é feita a avaliação do processamento auditivo?",
    category: "audicao",
    image: "/images/articles/pac-processamento-auditivo.jpg",
    imageAlt: "Menino com fone de ouvido durante uma avaliação auditiva",
    imagePosition: "68% center",
    publishedAt: null,
    body: null,
  },
  {
    slug: "disfagia-sintomas-e-tratamento",
    keyword: "Disfagia:",
    title: "Quais os sintomas e como tratá‑la?",
    category: "degluticao",
    image: "/images/articles/disfagia.jpg",
    imageAlt: "Criança de boca aberta durante exame com espátula",
    imagePosition: "40% center",
    publishedAt: null,
    body: null,
  },
  {
    slug: "castigo-13-verdades",
    keyword: "Castigo:",
    title: "13 verdades sobre castigo infantil.",
    category: "comportamento-infantil",
    image: "/images/articles/castigo-infantil.jpg",
    imageAlt: "Menina sentada no chão, de costas, virada para a parede",
    imagePosition: "30% 75%",
    publishedAt: null,
    body: null,
  },
];

export const ARTICLE_AUTHOR = "Maria Salete Brocca Denoni";

/* Os títulos acima são EXEMPLOS do layout de referência (docs/07, pendência 8).
   Enquanto true: o site avisa que são exemplos e a seção fica fora dos buscadores.
   Trocar para false quando a pauta real (títulos, textos, datas, categorias) chegar. */
export const ARTICLES_ARE_EXAMPLES = true;

export function getArticleCategories(): readonly ArticleCategory[] {
  return CATEGORIES;
}

export function getArticleCategory(slug: string): ArticleCategory | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getArticles(categorySlug?: string): readonly Article[] {
  return categorySlug ? ARTICLES.filter((article) => article.category === categorySlug) : ARTICLES;
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

/* Mesma categoria primeiro, depois os demais, sem repetir o artigo atual. */
export function getRelatedArticles(article: Article, limit: number): readonly Article[] {
  const others = ARTICLES.filter((item) => item.slug !== article.slug);
  const sameCategory = others.filter((item) => item.category === article.category);
  const rest = others.filter((item) => item.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function getFeaturedArticles(): readonly Article[] {
  return ARTICLES.slice(0, 3);
}

export function articleTitle(article: Article): string {
  return `${article.keyword} ${article.title}`;
}
