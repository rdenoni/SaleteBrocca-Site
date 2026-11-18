import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Lock, Hourglass } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductMedia } from "@/components/shop/ProductMedia";
import { Button } from "@/components/ui/Button";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { getCheckoutHref, getProduct, getProducts, isProductAvailable } from "@/lib/content/shop";
import styles from "./produto.module.css";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/* Só os produtos cadastrados (inclusive os "em breve") geram página; qualquer outro slug responde 404.
   Os endereços antigos dos cursos são redirecionados em next.config.ts antes de chegar aqui. */
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return { title: `${product.title} | Loja`, description: product.summary };
}

function Price({ value }: { value: string | null }) {
  return value ? <strong>{value}</strong> : <span className="pending">A confirmar</span>;
}

const CONTACT_HREF = "/contato#formulario";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const available = isProductAvailable(product);
  const checkoutHref = getCheckoutHref(product);
  /* Disponíveis primeiro: o relacionado que o visitante pode comprar vem antes do que ainda não existe. */
  const related = getProducts()
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => Number(isProductAvailable(b)) - Number(isProductAvailable(a)));

  return (
    <>
      <PageBanner eyebrow={product.kind} title={product.title} size="compact" />

      <div className={`container ${styles.page}`}>
        <Breadcrumbs
          items={[
            { label: "Loja", href: "/loja" },
            { label: product.title, href: `/loja/${product.slug}` },
          ]}
          className={styles.breadcrumbs}
        />

        <div className={styles.top}>
          <figure className={styles.gallery}>
            <span className={styles.galleryBlock} aria-hidden="true" />
            <div className={styles.galleryFrame}>
              <ProductMedia product={product} sizes="(max-width: 1099px) 100vw, 640px" priority />
            </div>
          </figure>

          <section className={styles.panel} aria-labelledby="compra-titulo">
            <h2 id="compra-titulo" className={styles.panelTitle}>
              {available ? "Informações de compra" : "Disponibilidade"}
            </h2>
            <span className="rule" aria-hidden="true" />
            {available ? (
              <p className={styles.price}>
                <span>Preço</span>
                <Price value={product.price} />
              </p>
            ) : (
              <>
                <p className={styles.status}>
                  <Hourglass aria-hidden="true" />
                  Em breve
                </p>
                {product.price && (
                  <p className={styles.price}>
                    <span>Preço previsto</span>
                    <Price value={product.price} />
                  </p>
                )}
              </>
            )}
            <dl className={styles.facts}>
              {product.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value ?? <span className="pending">A confirmar</span>}</dd>
                </div>
              ))}
            </dl>
            {available ? (
              <>
                <Button href={checkoutHref} variant="primary" className={styles.buy}>
                  Comprar
                </Button>
                <p className={styles.note}>
                  <Lock aria-hidden="true" />
                  Pagamento online em preparação.
                </p>
              </>
            ) : (
              <>
                <Button variant="primary" className={styles.buy} disabled aria-disabled="true">
                  Indisponível
                </Button>
                <p className={styles.soonText}>Este produto ainda está em desenvolvimento.</p>
                <LinkArrow href={CONTACT_HREF}>Avise-me pelo contato</LinkArrow>
              </>
            )}
          </section>
        </div>

        <div className={styles.details}>
          <section aria-labelledby="descricao">
            <h2 id="descricao" className={styles.heading}>
              Sobre o produto
            </h2>
            <p className={styles.lead}>{product.summary}</p>
            {product.description.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className={styles.reading}>
                {paragraph}
              </p>
            ))}
          </section>

          <section className={styles.includes} aria-labelledby="inclui">
            <h2 id="inclui" className={styles.includesTitle}>
              {available ? "O que inclui" : "O que está previsto"}
            </h2>
            <ul>
              {product.includes.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="relacionados">
            <h2 id="relacionados" className={styles.heading}>
              Outros produtos da loja
            </h2>
            <ul className={styles.relatedGrid}>
              {related.slice(0, 3).map((item) => (
                <li key={item.slug}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <LinkArrow href="/loja" className={styles.back}>
          Voltar para a loja
        </LinkArrow>
      </div>

      <StickyActionBar>
        {available ? (
          <>
            <p className={styles.barPrice}>
              <span>Preço</span>
              <Price value={product.price} />
            </p>
            <Button href={checkoutHref} variant="primary">
              Comprar
            </Button>
          </>
        ) : (
          <>
            <p className={styles.barPrice}>
              <span>Disponibilidade</span>
              <strong>Em breve</strong>
            </p>
            <Button variant="primary" disabled aria-disabled="true">
              Indisponível
            </Button>
          </>
        )}
      </StickyActionBar>
    </>
  );
}
