import type { Metadata } from "next";
import { ArticleCategoryNav } from "@/components/content/ArticleCategoryNav";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { FeaturedArticle } from "@/components/content/FeaturedArticle";
import { PageBanner } from "@/components/layout/PageBanner";
import { getArticles } from "@/lib/content/articles";
import styles from "./conteudo.module.css";

export const metadata: Metadata = {
  title: "Conteúdo",
  description: "Artigos e orientações de Maria Salete Brocca Denoni, professora e fonoaudióloga clínica.",
};

export default function ContentLibraryPage() {
  const [featured, ...rest] = getArticles();

  return (
    <>
      <PageBanner
        title="Conteúdo"
        subtitle="Artigos e orientações de Maria Salete Brocca Denoni."
        size="compact"
      />

      <div className={`container ${styles.page}`}>
        <ArticleCategoryNav />

        {featured && <FeaturedArticle article={featured} />}

        <section aria-labelledby="mais-conteudos">
          <h2 id="mais-conteudos" className={styles.heading}>
            Mais conteúdos
          </h2>
          <ArticleGrid articles={rest} />
        </section>
      </div>
    </>
  );
}
