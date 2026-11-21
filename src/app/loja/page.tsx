import { Lock, MessageCircle, Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/layout/PageBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductMedia } from "@/components/shop/ProductMedia";
import { ShopCourseCard } from "@/components/shop/ShopCourseCard";
import { UpcomingCategory } from "@/components/shop/UpcomingCategory";
import { Button } from "@/components/ui/Button";
import { FilterNav, type FilterItem } from "@/components/ui/FilterNav";
import { getCatalogCourses, isCourseAvailable } from "@/lib/content/courses";
import {
  getCategory,
  getCheckoutHref,
  getProduct,
  getShopEntries,
  isProductAvailable,
  PRODUCT_CATEGORIES,
  SHOP_DELIVERY_SUMMARY,
  SHOP_FEATURED_SLUG,
  type ShopEntry,
} from "@/lib/content/shop";
import type { Product } from "@/types/content";
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

function FeaturedProduct({ product }: { product: Product }) {
  return (
    <section className={styles.featured} aria-labelledby="destaque-titulo">
      <div className={styles.featuredMedia}>
        <ProductMedia product={product} sizes="(max-width: 767px) 100vw, 480px" />
      </div>
      <div className={styles.featuredText}>
        <span className={styles.featuredFlag}>Destaque</span>
        <p className={styles.featuredKind}>{product.kind}</p>
        <h3 id="destaque-titulo" className={styles.featuredTitle}>
          {product.title}
        </h3>
        <p className={styles.featuredSummary}>{product.summary}</p>
        <p className={styles.featuredPrice}>{product.price ?? <span className="pending">A confirmar</span>}</p>
        <p className={styles.secure}>
          <Lock size={16} aria-hidden="true" />
          <span>
            Pagamento pela Kiwify, em preparação ·<span className="pending">Reembolso: a confirmar</span>
          </span>
        </p>
        <div className={styles.featuredActions}>
          <Button href={getCheckoutHref(product)} variant="primary" aria-label={`Comprar ${product.title}`}>
            Comprar
          </Button>
          <Button href={`/loja/${product.slug}`} variant="outline" aria-label={`Ver detalhes de ${product.title}`}>
            Ver detalhes
          </Button>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className={styles.trust} aria-label="Sobre a compra">
      <div className="container">
        <ul className={styles.trustList}>
          <li className={styles.trustItem}>
            <span className={styles.trustIcon}>
              <Lock size={22} aria-hidden="true" />
            </span>
            <p>
              <strong>Pagamento pela Kiwify</strong>
              <br />O pagamento online pela Kiwify está em preparação.
            </p>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustIcon}>
              <Package size={22} aria-hidden="true" />
            </span>
            <p>
              <strong>Entrega</strong>
              <br />
              {SHOP_DELIVERY_SUMMARY}
            </p>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustIcon}>
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <p>
              <strong>Dúvidas?</strong>
              <br />
              <Link href="/contato#formulario" className={styles.trustLink}>
                Fale pela página de contato
              </Link>
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

function CoursesBridge() {
  const course = getCatalogCourses().find(isCourseAvailable);
  return (
    <section className={styles.bridgeSection} aria-labelledby="ponte-cursos">
      <div className="container">
        <div className={styles.bridge}>
          <div>
            <h2 id="ponte-cursos" className={styles.heading}>
              Procurando os cursos?
            </h2>
            {course?.commercial.price && (
              <p className={styles.bridgeLine}>
                {course.title} · {course.commercial.price}
              </p>
            )}
          </div>
          <Button href="/cursos" variant="primary" className={styles.bridgeButton}>
            Ver todos os cursos
          </Button>
        </div>
      </div>
    </section>
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { categoria } = await searchParams;
  /* Categoria desconhecida ou repetida na URL: mostra o catálogo inteiro. */
  const active = getCategory(typeof categoria === "string" ? categoria : undefined);
  const visible = active ? [active] : PRODUCT_CATEGORIES;
  const entries = visible.flatMap((category) => getShopEntries(category.id));
  const totalItems = PRODUCT_CATEGORIES.reduce((sum, category) => sum + getShopEntries(category.id).length, 0);

  /* Destaque só na visão "Todos", e só se o produto existir e estiver à venda; sai da grade para não repetir. */
  const candidate = !active && SHOP_FEATURED_SLUG ? getProduct(SHOP_FEATURED_SLUG) : undefined;
  const featured = candidate && isProductAvailable(candidate) ? candidate : undefined;
  const gridEntries = entries.filter((entry) => entry.type !== "product" || entry.product.slug !== featured?.slug);

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

      <section className={styles.catalog} aria-label="Catálogo da loja">
        <div className={`container ${styles.layout}`}>
          <div className={styles.sidebar}>
            <p className={styles.eyebrow} aria-hidden="true">
              Categorias
            </p>
            <FilterNav label="Categorias da loja" items={filters} keepScroll orientation="vertical" />
          </div>

          <div className={styles.content}>
            <header className={styles.header}>
              <h2 className={styles.heading}>{active ? active.label : "Todos os produtos"}</h2>
              {entries.length > 0 && <p className={styles.total}>{availabilityLabel(entries)}</p>}
            </header>

            {featured && <FeaturedProduct product={featured} />}

            {entries.length === 0 ? (
              <>
                {active && <UpcomingCategory category={active} tone="navy" showTitle={false} />}
                <div className={styles.notify}>
                  <p>
                    <strong>Quer saber quando chegar?</strong> Fale com a Salete pela página de contato.
                  </p>
                  <Button href="/contato#formulario" variant="outline">
                    Ir para contato
                  </Button>
                </div>
              </>
            ) : (
              <ul className={styles.grid}>
                {gridEntries.map((entry) => (
                  <li key={entry.key}>
                    <EntryCard entry={entry} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <TrustStrip />
      <CoursesBridge />
    </>
  );
}
