import Image from "next/image";
import type { Product } from "@/types/content";
import { CATEGORY_ICONS } from "./category-icons";
import styles from "./ProductMedia.module.css";

interface ProductMediaProps {
  product: Product;
  sizes: string;
  priority?: boolean;
}

/* Preenche o contêiner (que deve ser `position: relative`). Sem foto real, mostra o grafismo da marca
   com o ícone da categoria: nunca uma foto inventada. */
export function ProductMedia({ product, sizes, priority = false }: ProductMediaProps) {
  if (product.image) {
    return <Image src={product.image} alt={product.imageAlt} fill priority={priority} sizes={sizes} />;
  }

  const Icon = CATEGORY_ICONS[product.category];
  return (
    <div className={styles.graphic} data-muted={product.status === "coming-soon" ? "true" : undefined} aria-hidden="true">
      <Image
        src="/brand/patterns/grafismo-pecas.png"
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className={styles.pattern}
      />
      <span className={styles.icon}>
        <Icon />
      </span>
    </div>
  );
}
