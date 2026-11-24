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
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterTitle, bannerTextStart, overlapAfter } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import type { Product } from "@/types/content";
import styles from "./loja.module.css";

const BANNER_TITLE = "Loja";
const { duration, stagger } = motionTokens;
/* Movimento (ordem de leitura, em sobreposição): banner → categorias (lateral) com o subtítulo 30% formado → título
   do catálogo quando a pílula Aplicativos termina → total → destaque (a base se desvela de cima para baixo e, com ela
   30% formada, o texto sobe item a item; a foto depois do título) — o topo ao montar. Daqui para baixo, ao chegar à
   tela: a grade em cascata, a faixa "Sobre a compra" e a ponte para os cursos. */
const ALL_TITLE = "Todos os produtos";
/* Tempos do topo (ao montar). Não variam com a categoria: se variassem, trocar o filtro re-registraria a espera do
   topo e a grade nova esperaria segundos. */
const SIDEBAR_START = bannerTextStart(motionTokens, BANNER_TITLE) + overlapAfter(duration.gentle);
const PILLS_START = SIDEBAR_START + stagger.items;
/* Pílula "Aplicativos" (depois de "Todos"): o título entra quando ela termina de subir. */
const APPS_PILL = 1 + PRODUCT_CATEGORIES.findIndex((category) => category.id === "aplicativos");
const TOP_START = PILLS_START + APPS_PILL * stagger.items + duration.base;
const TOTAL_START = TOP_START + overlapAfter(duration.slow);
const BRIDGE_TITLE = "Procurando os cursos?";

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

/* O texto começa com a base 30% desvelada; a foto nunca antes do texto que a apresenta (o título, 3º item, já subindo). */
const FEATURED_TEXT_START = overlapAfter(duration.slow);
const FEATURED_MEDIA_START = FEATURED_TEXT_START + 2 * stagger.items + duration.base;

/* Por viewport, não ao montar: na primeira carga espera o topo (até o total) pela ordem de leitura; ao voltar para
   "Todos" pelo filtro (mesma página, sem banner), entra logo em vez de esperar os tempos do topo. */
function FeaturedProduct({ product }: { product: Product }) {
  return (
    <Reveal as="section" variant="mask" className={styles.featured} aria-labelledby="destaque-titulo">
      <Reveal variant="mask" trigger="parent" delay={FEATURED_MEDIA_START} className={styles.featuredMedia}>
        <ProductMedia product={product} sizes="(max-width: 767px) 100vw, 480px" />
      </Reveal>
      <Stagger className={styles.featuredText} trigger="parent" delay={FEATURED_TEXT_START}>
        <StaggerItem>
          <span className={styles.featuredFlag}>Destaque</span>
        </StaggerItem>
        <StaggerItem>
          <p className={styles.featuredKind}>{product.kind}</p>
        </StaggerItem>
        <StaggerItem>
          <h3 id="destaque-titulo" className={styles.featuredTitle}>
            {product.title}
          </h3>
        </StaggerItem>
        <StaggerItem>
          <p className={styles.featuredSummary}>{product.summary}</p>
        </StaggerItem>
        <StaggerItem>
          <p className={styles.featuredPrice}>{product.price ?? <span className="pending">A confirmar</span>}</p>
        </StaggerItem>
        <StaggerItem>
          <p className={styles.secure}>
            <Lock size={16} aria-hidden="true" />
            <span>
              Pagamento pela Kiwify, em preparação ·<span className="pending">Reembolso: a confirmar</span>
            </span>
          </p>
        </StaggerItem>
        <StaggerItem className={styles.featuredActions}>
          <Button href={getCheckoutHref(product)} variant="primary" aria-label={`Comprar ${product.title}`}>
            Comprar
          </Button>
          <Button href={`/loja/${product.slug}`} variant="outline" aria-label={`Ver detalhes de ${product.title}`}>
            Ver detalhes
          </Button>
        </StaggerItem>
      </Stagger>
    </Reveal>
  );
}

function TrustStrip() {
  return (
    <section className={styles.trust} aria-label="Sobre a compra">
      <div className="container">
        <Stagger as="ul" pace="cards" className={styles.trustList}>
          <StaggerItem as="li" className={styles.trustItem}>
            <span className={styles.trustIcon}>
              <Lock size={22} aria-hidden="true" />
            </span>
            <p>
              <strong>Pagamento pela Kiwify</strong>
              <br />O pagamento online pela Kiwify está em preparação.
            </p>
          </StaggerItem>
          <StaggerItem as="li" className={styles.trustItem}>
            <span className={styles.trustIcon}>
              <Package size={22} aria-hidden="true" />
            </span>
            <p>
              <strong>Entrega</strong>
              <br />
              {SHOP_DELIVERY_SUMMARY}
            </p>
          </StaggerItem>
          <StaggerItem as="li" className={styles.trustItem}>
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
          </StaggerItem>
        </Stagger>
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
            <TextReveal as="h2" id="ponte-cursos" className={styles.heading} text={BRIDGE_TITLE} />
            {course?.commercial.price && (
              <Reveal as="p" delay={afterTitle(motionTokens, BRIDGE_TITLE)} className={styles.bridgeLine}>
                {course.title} · {course.commercial.price}
              </Reveal>
            )}
          </div>
          <Reveal delay={afterTitle(motionTokens, BRIDGE_TITLE) + stagger.items}>
            <Button href="/cursos" variant="primary" className={styles.bridgeButton}>
              Ver todos os cursos
            </Button>
          </Reveal>
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

  const heading = active ? active.label : ALL_TITLE;
  /* Trocar o filtro não remonta a página: a chave remonta a grade, que refaz a cascata com os itens novos. */
  const viewKey = active?.id ?? "todos";

  return (
    <>
      <PageBanner title={BANNER_TITLE} subtitle={SUBTITLE} size="compact" />

      <section className={styles.catalog} aria-label="Catálogo da loja">
        <div className={`container ${styles.layout}`}>
          <div className={styles.sidebar}>
            <Reveal as="p" trigger="mount" delay={SIDEBAR_START} className={styles.eyebrow} aria-hidden>
              Categorias
            </Reveal>
            <FilterNav
              label="Categorias da loja"
              items={filters}
              keepScroll
              orientation="vertical"
              entranceDelay={PILLS_START}
              /* A lateral corre ao lado do conteúdo: o destaque e a grade esperam o total, não a última pílula. */
              entranceHolds={false}
            />
          </div>

          <div className={styles.content}>
            <header className={styles.header}>
              <TextReveal as="h2" className={styles.heading} text={heading} trigger="mount" delay={TOP_START} />
              {entries.length > 0 && (
                <Reveal as="p" trigger="mount" delay={TOTAL_START} className={styles.total}>
                  {availabilityLabel(entries)}
                </Reveal>
              )}
            </header>

            {featured && <FeaturedProduct product={featured} />}

            {/* Por viewport: espera o topo se já estiver na tela ao abrir (ordem de leitura). */}
            {entries.length === 0 ? (
              <>
                {active && (
                  <Reveal key={`breve-${viewKey}`}>
                    <UpcomingCategory category={active} tone="navy" showTitle={false} />
                  </Reveal>
                )}
                <Reveal key={`aviso-${viewKey}`} delay={stagger.cards} className={styles.notify}>
                  <p>
                    <strong>Quer saber quando chegar?</strong> Fale com a Salete pela página de contato.
                  </p>
                  <Button href="/contato#formulario" variant="outline">
                    Ir para contato
                  </Button>
                </Reveal>
              </>
            ) : (
              <Stagger key={viewKey} as="ul" pace="cards" className={styles.grid}>
                {gridEntries.map((entry) => (
                  <StaggerItem as="li" key={entry.key}>
                    <EntryCard entry={entry} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </section>

      <TrustStrip />
      <CoursesBridge />
    </>
  );
}
