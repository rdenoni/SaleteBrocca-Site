import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/PageBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { UpcomingCategory } from "@/components/shop/UpcomingCategory";
import { FilterNav, type FilterItem } from "@/components/ui/FilterNav";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { getCategory, getProducts, PRODUCT_CATEGORIES } from "@/lib/content/shop";
import styles from "./loja.module.css";

export const metadata: Metadata = {
  title: "Loja",
  description: "Materiais de apoio, jogos e softwares de Maria Salete Brocca Denoni.",
  /* Os filtros ?categoria= são variações desta página até existir /loja/categoria/[slug]. */
  alternates: { canonical: "/loja" },
};

interface ShopPageProps {
  searchParams: Promise<{ categoria?: string | string[] }>;
}

function countLabel(count: number): string {
  if (count === 0) return "Nenhum produto disponível ainda";
  return count === 1 ? "1 produto disponível" : `${count} produtos disponíveis`;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { categoria } = await searchParams;
  /* Categoria desconhecida ou repetida na URL: mostra o catálogo inteiro. */
  const active = getCategory(typeof categoria === "string" ? categoria : undefined);
  const products = getProducts(active?.id);
  const upcoming = active
    ? []
    : PRODUCT_CATEGORIES.filter((category) => getProducts(category.id).length === 0);

  const countOrSoon = (count: number) => (count > 0 ? count : "em breve");
  const productsLabel = (count: number) =>
    count === 0 ? "em breve" : count === 1 ? "1 produto" : `${count} produtos`;
  const filters: FilterItem[] = [
    {
      label: "Todos",
      href: "/loja",
      current: !active,
      count: countOrSoon(getProducts().length),
      countLabel: productsLabel(getProducts().length),
    },
    ...PRODUCT_CATEGORIES.map((category) => {
      const count = getProducts(category.id).length;
      return {
        label: category.label,
        href: `/loja?categoria=${category.id}`,
        current: category.id === active?.id,
        count: countOrSoon(count),
        countLabel: productsLabel(count),
      };
    }),
  ];

  return (
    <>
      <PageBanner
        title="Loja"
        subtitle="Materiais de apoio, jogos e softwares de Maria Salete Brocca Denoni."
        size="compact"
      />

      <div className={`container ${styles.page}`}>
        <p className={styles.coursesHint}>
          <span>Procurando os cursos?</span>
          <LinkArrow href="/cursos">Ver o catálogo de cursos</LinkArrow>
        </p>

        <FilterNav label="Categorias da loja" items={filters} keepScroll />

        <section aria-labelledby="catalogo-titulo">
          <div className={styles.heading}>
            <h2 id="catalogo-titulo" className={styles.title}>
              {active ? active.label : "Todos os produtos"}
            </h2>
            <p className={styles.total}>{countLabel(products.length)}</p>
          </div>

          {active && products.length === 0 ? (
            <div className={styles.empty}>
              <UpcomingCategory category={active} tone="navy" showTitle={false} />
            </div>
          ) : (
            <ul className={styles.grid}>
              {products.map((product) => (
                <li key={product.slug}>
                  <ProductCard product={product} />
                </li>
              ))}
              {upcoming.map((category, index) => (
                <li key={category.id}>
                  <UpcomingCategory category={category} tone={index % 2 === 0 ? "light" : "navy"} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
