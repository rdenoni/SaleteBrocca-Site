import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/content";
import { ProductMedia } from "./ProductMedia";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

/* "Em breve": o card continua levando à página do produto (que explica a indisponibilidade), sem caminho de compra. */
export function ProductCard({ product }: ProductCardProps) {
  const comingSoon = product.status === "coming-soon";

  return (
    <article className={styles.card} data-status={product.status}>
      <div className={styles.media}>
        <ProductMedia product={product} sizes="(max-width: 767px) 100vw, 400px" />
        <span className={styles.badge}>{product.kind}</span>
        {comingSoon && <span className={styles.statusBadge}>Em breve</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.summary}>{product.summary}</p>
        {comingSoon ? (
          <p className={styles.unavailable}>Indisponível no momento</p>
        ) : (
          product.price && (
            <p className={styles.price}>
              <span>Preço</span>
              <strong>{product.price}</strong>
            </p>
          )
        )}
        <Button href={`/loja/${product.slug}`} variant={comingSoon ? "outline" : "primary"} className={styles.cta}>
          {comingSoon ? "Ver detalhes" : "Ver produto"}
        </Button>
      </div>
    </article>
  );
}
