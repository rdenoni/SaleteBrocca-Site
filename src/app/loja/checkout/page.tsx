import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { Button } from "@/components/ui/Button";
import { getProduct, getProductDelivery, isProductAvailable } from "@/lib/content/shop";
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
  const found = typeof produto === "string" ? getProduct(produto) : undefined;
  /* Produto "em breve" não tem compra: cai no estado de indisponibilidade, nunca no resumo do pedido. */
  const product = found && isProductAvailable(found) ? found : undefined;
  const unavailable = found && !product ? found : undefined;

  return (
    <>
      <PageBanner eyebrow="Loja" title="Finalizar compra" size="compact" />
      <div className="container">
        <Breadcrumbs
          className={styles.trail}
          items={[
            { label: "Loja", href: "/loja" },
            { label: "Finalizar compra", href: "/loja/checkout" },
          ]}
        />
      </div>

      {product ? (
        <CheckoutView
          item={{ title: product.title, details: product.highlights, price: product.price }}
          stepsLabel="Etapas da compra"
          backHref={`/loja/${product.slug}`}
          backLabel="Voltar ao produto"
          checkoutUrl={product.kiwify.checkoutUrl}
          delivery={getProductDelivery(product)}
        />
      ) : (
        <div className={`container ${styles.page}`}>
          <section className={styles.empty} aria-labelledby="sem-produto">
            <span className={styles.icon}>
              <ShoppingBag aria-hidden="true" />
            </span>
            <h2 id="sem-produto" className={styles.title}>
              {unavailable ? "Produto indisponível" : "Nenhum produto selecionado"}
            </h2>
            <p className={styles.text}>
              {unavailable
                ? `${unavailable.title} ainda está em desenvolvimento e não pode ser comprado.`
                : "Escolha um produto na loja para continuar."}
            </p>
            <Button href={unavailable ? `/loja/${unavailable.slug}` : "/loja"} variant="primary">
              {unavailable ? "Ver detalhes do produto" : "Ver a loja"}
            </Button>
          </section>
        </div>
      )}
    </>
  );
}
