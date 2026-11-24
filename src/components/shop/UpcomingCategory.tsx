import { LinkArrow } from "@/components/ui/LinkArrow";
import type { ProductCategoryInfo } from "@/types/content";
import { CATEGORY_ICONS } from "./category-icons";
import styles from "./UpcomingCategory.module.css";

interface UpcomingCategoryProps {
  category: ProductCategoryInfo;
  /** "light" no catálogo geral; "navy" no estado vazio de uma categoria. */
  tone?: "light" | "navy";
  /** false quando a página já mostra o nome da categoria num título acima. */
  showTitle?: boolean;
}

/* Categoria prevista sem produtos cadastrados: bloco de cor honesto em vez de produto inventado. */
export function UpcomingCategory({ category, tone = "light", showTitle = true }: UpcomingCategoryProps) {
  const Icon = CATEGORY_ICONS[category.id];
  const dark = tone === "navy";

  return (
    <article className={styles.tile} data-tone={tone} data-surface={dark ? "dark" : undefined}>
      <span className={styles.icon}>
        <Icon aria-hidden="true" />
      </span>
      <span className="pending">Em preparação</span>
      {showTitle && <h3 className={styles.title}>{category.label}</h3>}
      <p className={styles.text}>{category.emptyText}</p>
      <LinkArrow href="/contato#formulario" tone={dark ? "inverse" : undefined} className={styles.link}>
        Pergunte pelo contato
      </LinkArrow>
    </article>
  );
}
