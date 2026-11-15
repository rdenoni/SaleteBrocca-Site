import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./PageBanner.module.css";

interface PageBannerProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Foto tratada em azul; sem foto o banner é azul liso. */
  image?: string;
  imagePosition?: string;
  size?: "default" | "compact";
  children?: ReactNode;
}

/* Banner das páginas internas: mesmo tratamento azul do hero da Home, mais baixo.
   Também reserva o espaço do header flutuante. */
export function PageBanner({
  title,
  eyebrow,
  subtitle,
  image,
  imagePosition,
  size = "default",
  children,
}: PageBannerProps) {
  return (
    <section className={styles.banner} data-size={size} data-surface="photo" aria-labelledby="page-title">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.photo}
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      )}
      <div className={styles.inner}>
        {eyebrow && <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
        <h1 id="page-title" className={styles.title}>
          {title}
        </h1>
        <span className={`rule ${styles.rule}`} aria-hidden="true" />
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
    </section>
  );
}
