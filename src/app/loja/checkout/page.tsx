import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { Button } from "@/components/ui/Button";
import { getProduct } from "@/lib/content/shop";
import styles from "./checkout.module.css";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

interface CheckoutPageProps {
  searchParams: Promise<{ produto?: string | string[] }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { produto } = await searchParams;
  const product = typeof produto === "string" ? getProduct(produto) : undefined;

  return (
    <>
      <PageBanner eyebrow="Loja" title="Finalizar compra" size="compact" />

      {product ? (
        <CheckoutView
          item={{ title: product.title, details: product.highlights, price: product.price }}
          stepsLabel="Etapas da compra"
          backHref={`/loja/${product.slug}`}
          backLabel="Voltar ao produto"
          idPrefix="checkout"
        />
      ) : (
        <div className={`container ${styles.page}`}>
          <section className={styles.empty} aria-labelledby="sem-produto">
            <span className={styles.icon}>
              <ShoppingBag aria-hidden="true" />
            </span>
            <h2 id="sem-produto" className={styles.title}>
              Nenhum produto selecionado
            </h2>
            <p className={styles.text}>Escolha um produto na loja para continuar.</p>
            <Button href="/loja" variant="primary">
              Ver a loja
            </Button>
          </section>
        </div>
      )}
    </>
  );
}
