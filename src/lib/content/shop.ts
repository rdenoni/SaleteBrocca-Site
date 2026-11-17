import type { Product, ProductCategory, ProductCategoryInfo } from "@/types/content";

/* A Loja guarda só produtos avulsos. Cursos vivem em /cursos (courses.ts) e têm a própria compra. */
export const PRODUCT_CATEGORIES: readonly ProductCategoryInfo[] = [
  {
    id: "materiais",
    label: "Materiais",
    emptyText: "Os materiais de apoio ainda serão cadastrados nesta loja.",
  },
  {
    id: "jogos",
    label: "Jogos e softwares",
    emptyText: "Os jogos e softwares desenvolvidos pela Salete ainda serão cadastrados nesta loja.",
  },
];

/* Materiais e jogos: nenhum produto confirmado pela cliente ainda.
   Cadastrar aqui (nome, preço, descrição e imagem reais) quando forem confirmados. */
const STANDALONE_PRODUCTS: readonly Product[] = [];

export function getProducts(category?: ProductCategory): readonly Product[] {
  return category ? STANDALONE_PRODUCTS.filter((product) => product.category === category) : STANDALONE_PRODUCTS;
}

export function getProduct(slug: string): Product | undefined {
  return getProducts().find((product) => product.slug === slug);
}

export function getCategory(id: string | undefined): ProductCategoryInfo | undefined {
  return PRODUCT_CATEGORIES.find((category) => category.id === id);
}

export function getCheckoutHref(product: Product): string {
  return `/loja/checkout?produto=${encodeURIComponent(product.slug)}`;
}
