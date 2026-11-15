import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCategoryNav } from "@/components/content/ArticleCategoryNav";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { PageBanner } from "@/components/layout/PageBanner";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { getArticleCategories, getArticleCategory, getArticles } from "@/lib/content/articles";
import styles from "../../conteudo.module.css";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getArticleCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getArticleCategory(slug);
  return category ? { title: `${category.label} | Conteúdo` } : {};
}

function countLabel(count: number): string {
  return count === 1 ? "1 artigo" : `${count} artigos`;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getArticleCategory(slug);
  if (!category) notFound();

  const articles = getArticles(category.slug);

  return (
    <>
      <PageBanner eyebrow="Categoria" title={category.label} subtitle={countLabel(articles.length)} size="compact" />

      <div className={`container ${styles.page}`}>
        <ArticleCategoryNav current={category.slug} />

        <section aria-labelledby="artigos-categoria">
          <h2 id="artigos-categoria" className="visually-hidden">
            Artigos sobre {category.label}
          </h2>
          <ArticleGrid articles={articles} />
        </section>

        <LinkArrow href="/conteudo" className={styles.back}>
          Todos os conteúdos
        </LinkArrow>
      </div>
    </>
  );
}
