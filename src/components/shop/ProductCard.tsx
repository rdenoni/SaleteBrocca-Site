import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/content";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 767px) 100vw, 400px" />
        <span className={styles.badge}>{product.kind}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.summary}>{product.summary}</p>
        {product.price && (
          <p className={styles.price}>
            <span>Preço</span>
            <strong>{product.price}</strong>
          </p>
        )}
        <Button href={`/loja/${product.slug}`} variant="primary" className={styles.cta}>
          Ver produto
        </Button>
      </div>
    </article>
  );
}
