import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/PageBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopCourseCard } from "@/components/shop/ShopCourseCard";
import { UpcomingCategory } from "@/components/shop/UpcomingCategory";
import { FilterNav, type FilterItem } from "@/components/ui/FilterNav";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { getCategory, getShopEntries, PRODUCT_CATEGORIES, type ShopEntry } from "@/lib/content/shop";
import type { ProductCategoryInfo } from "@/types/content";
import styles from "./loja.module.css";

const SUBTITLE =
  "Cursos, aplicativo, jogos educativos, kits personalizados e materiais em PDF de Maria Salete Brocca Denoni.";

export const metadata: Metadata = {
  title: "Loja",
  description: SUBTITLE,
  /* Os filtros ?categoria= são variações desta página até existir /loja/categoria/[slug]. */
  alternates: { canonical: "/loja" },
};

interface ShopPageProps {
  searchParams: Promise<{ categoria?: string | string[] }>;
}

function itemsLabel(count: number): string {
  return count === 1 ? "1 item" : `${count} itens`;
}

function availabilityLabel(entries: readonly ShopEntry[]): string {
  const soon = entries.filter((entry) => entry.status === "coming-soon").length;
  const available = entries.length - soon;
  const availablePart = available === 1 ? "1 disponível" : `${available} disponíveis`;
  return soon > 0 ? `${availablePart} · ${soon} em breve` : availablePart;
}

function EntryCard({ entry }: { entry: ShopEntry }) {
  return entry.type === "course" ? <ShopCourseCard course={entry.course} /> : <ProductCard product={entry.product} />;
}

function CategorySection({ category, entries }: { category: ProductCategoryInfo; entries: readonly ShopEntry[] }) {
  const headingId = `categoria-${category.id}`;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <h2 id={headingId} className={styles.title}>
          {category.label}
        </h2>
        {entries.length > 0 && <p className={styles.total}>{availabilityLabel(entries)}</p>}
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <UpcomingCategory category={category} tone="navy" showTitle={false} />
        </div>
      ) : (
        <ul className={styles.grid}>
          {entries.map((entry) => (
            <li key={entry.key}>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { categoria } = await searchParams;
  /* Categoria desconhecida ou repetida na URL: mostra o catálogo inteiro. */
  const active = getCategory(typeof categoria === "string" ? categoria : undefined);
  const visible = active ? [active] : PRODUCT_CATEGORIES;
  const totalItems = PRODUCT_CATEGORIES.reduce((sum, category) => sum + getShopEntries(category.id).length, 0);

  const filters: FilterItem[] = [
    {
      label: "Todos",
      href: "/loja",
      current: !active,
      count: totalItems,
      countLabel: itemsLabel(totalItems),
    },
    ...PRODUCT_CATEGORIES.map((category) => {
      const count = getShopEntries(category.id).length;
      return {
        label: category.label,
        href: `/loja?categoria=${category.id}`,
        current: category.id === active?.id,
        count,
        countLabel: itemsLabel(count),
      };
    }),
  ];

  return (
    <>
      <PageBanner title="Loja" subtitle={SUBTITLE} size="compact" />

      <div className={`container ${styles.page}`}>
        <p className={styles.coursesHint}>
          <span>Quer conhecer os cursos em detalhe?</span>
          <LinkArrow href="/cursos">Ver todos os cursos</LinkArrow>
        </p>

        <FilterNav label="Categorias da loja" items={filters} keepScroll />

        {visible.map((category) => (
          <CategorySection key={category.id} category={category} entries={getShopEntries(category.id)} />
        ))}
      </div>
    </>
  );
}
