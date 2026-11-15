import type { Course, Product, ProductCategory, ProductCategoryInfo } from "@/types/content";
import { countLessons, getCourses } from "./courses";

export const PRODUCT_CATEGORIES: readonly ProductCategoryInfo[] = [
  {
    id: "cursos",
    label: "Cursos",
    emptyText: "Nenhum curso disponível no momento.",
  },
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

/* O curso entra na loja com os mesmos dados confirmados de courses.ts. */
function courseToProduct(course: Course): Product {
  const { commercial } = course;
  const modules = `${course.modules.length} módulos`;
  const lessons = `${countLessons(course)} aulas`;
  return {
    slug: course.slug,
    category: "cursos",
    kind: "Curso online",
    title: course.title,
    summary: course.audience,
    description: course.description,
    image: course.image,
    imageAlt: course.imageAlt,
    price: commercial.price,
    facts: [
      { label: "Formato", value: "Curso online" },
      { label: "Conteúdo", value: `${modules} · ${lessons}` },
      { label: "Carga horária", value: commercial.workload },
      { label: "Certificado", value: commercial.certificate },
      { label: "Acesso", value: commercial.access },
    ],
    highlights: [modules, lessons],
    includes: course.modules.map((module) => `Módulo ${module.number} · ${module.title}`),
    detailsHref: `/cursos/${course.slug}`,
  };
}

export function getProducts(category?: ProductCategory): readonly Product[] {
  const all = [...getCourses().map(courseToProduct), ...STANDALONE_PRODUCTS];
  return category ? all.filter((product) => product.category === category) : all;
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
