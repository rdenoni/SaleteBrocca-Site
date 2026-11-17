import { Info } from "lucide-react";
import { FilterNav, type FilterItem } from "@/components/ui/FilterNav";
import { ARTICLES_ARE_EXAMPLES, getArticleCategories, getArticles } from "@/lib/content/articles";
import styles from "./ArticleCategoryNav.module.css";

interface ArticleCategoryNavProps {
  /** Slug da categoria aberta; undefined na biblioteca completa. */
  current?: string;
}

function articlesLabel(count: number): string {
  return count === 1 ? "1 artigo" : `${count} artigos`;
}

/* id="categorias": âncora dos filtros (/conteudo#categorias). */
export function ArticleCategoryNav({ current }: ArticleCategoryNavProps) {
  const total = getArticles().length;
  const items: FilterItem[] = [
    { label: "Todos", href: "/conteudo", current: current === undefined, count: total, countLabel: articlesLabel(total) },
    ...getArticleCategories().map((category) => {
      const count = getArticles(category.slug).length;
      return {
        label: category.label,
        href: `/conteudo/categoria/${category.slug}`,
        current: category.slug === current,
        count,
        countLabel: articlesLabel(count),
      };
    }),
  ];

  return (
    <>
      {ARTICLES_ARE_EXAMPLES && (
        <p className={styles.note} role="note">
          <Info aria-hidden="true" />
          <span>
            <strong>Conteúdo de exemplo.</strong> Os títulos e as categorias vêm do layout de referência e serão
            trocados pela pauta real da Salete.
          </span>
        </p>
      )}
      <FilterNav id="categorias" label="Categorias de conteúdo" items={items} />
    </>
  );
}
