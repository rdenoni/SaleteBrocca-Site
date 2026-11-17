import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/Button";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { getCheckoutHref, getProduct, getProducts } from "@/lib/content/shop";
import styles from "./produto.module.css";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/* Sem produtos avulsos cadastrados, nenhum slug é gerado e toda URL /loja/[slug] responde 404.
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const checkoutHref = getCheckoutHref(product);
  const related = getProducts().filter((item) => item.slug !== product.slug);

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
              <Image src={product.image} alt={product.imageAlt} fill priority sizes="(max-width: 1099px) 100vw, 640px" />
            </div>
          </figure>

          <section className={styles.panel} aria-labelledby="compra-titulo">
            <h2 id="compra-titulo" className={styles.panelTitle}>
              Informações de compra
            </h2>
            <span className="rule" aria-hidden="true" />
            <p className={styles.price}>
              <span>Preço</span>
              <Price value={product.price} />
            </p>
            <dl className={styles.facts}>
              {product.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value ?? <span className="pending">A confirmar</span>}</dd>
                </div>
              ))}
            </dl>
            <Button href={checkoutHref} variant="primary" className={styles.buy}>
              Comprar
            </Button>
            <p className={styles.note}>
              <Lock aria-hidden="true" />
              Pagamento online em preparação.
            </p>
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
              O que inclui
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
              Produtos relacionados
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
        <p className={styles.barPrice}>
          <span>Preço</span>
          <Price value={product.price} />
        </p>
        <Button href={checkoutHref} variant="primary">
          Comprar
        </Button>
      </StickyActionBar>
    </>
  );
}
