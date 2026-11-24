import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/content";
import { ProductMedia } from "./ProductMedia";
import styles from "./ProductCard.module.css";
import { Reveal } from "@/motion/Reveal";
import { overlapAfter } from "@/motion/timeline";
import { duration } from "@/motion/tokens";

/* A foto do card se desvela (de cima para baixo) com o card 30% formado. */
const CARD_PHOTO_DELAY = overlapAfter(duration.gentle);

interface ProductCardProps {
  product: Product;
}

/* "Em breve": o card continua levando à página do produto (que explica a indisponibilidade), sem caminho de compra. */
export function ProductCard({ product }: ProductCardProps) {
  const comingSoon = product.status === "coming-soon";

  return (
    <article className={styles.card} data-status={product.status} data-linked="true">
      <Reveal variant="mask" delay={CARD_PHOTO_DELAY} className={styles.media}>
        <ProductMedia product={product} sizes="(max-width: 767px) 100vw, 400px" />
        {comingSoon && <span className={styles.statusBadge}>Em breve</span>}
      </Reveal>
      <div className={styles.body}>
        <span className={styles.chip}>{product.kind}</span>
        <h3 className={styles.title}>
          <Link href={`/loja/${product.slug}`} className={styles.cardLink}>
            {product.title}
          </Link>
        </h3>
        <div className={styles.footer}>
          {comingSoon ? (
            <p className={styles.unavailable}>Indisponível no momento</p>
          ) : (
            <p className={styles.price}>{product.price ?? <span className="pending">A confirmar</span>}</p>
          )}
          <span className={styles.more} aria-hidden="true">
            Ver detalhes
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
