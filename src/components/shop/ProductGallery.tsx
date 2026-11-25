"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/content";
import { ProductMedia } from "./ProductMedia";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  product: Product;
}

/* Galeria interativa na página do produto (/loja/[slug]): exibe a foto principal em cores reais
   e, quando há mais de um ângulo em `product.gallery`, oferece miniaturas acessíveis abaixo. */
export function ProductGallery({ product }: ProductGalleryProps) {
  const images =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [{ src: product.image, alt: product.imageAlt }]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.stage}>
        <ProductMedia product={product} sizes="(max-width: 1099px) 100vw, 640px" priority />
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className={styles.wrapper}>
      <div className={styles.stageWrap}>
        <span className={styles.accentBlock} aria-hidden="true" />
        <div className={styles.stage} data-photo="true">
          <Image
            key={active.src}
            src={active.src}
            alt={active.alt}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 1099px) 100vw, 640px"
            className={styles.photo}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs} role="group" aria-label={`Fotos de ${product.title}`}>
          {images.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className={styles.thumb}
              aria-label={`Ver imagem ${index + 1} de ${images.length}: ${item.alt}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            >
              <Image src={item.src} alt="" fill sizes="96px" className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
