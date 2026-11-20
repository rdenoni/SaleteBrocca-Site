import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCategoryNav } from "@/components/content/ArticleCategoryNav";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { getArticleCategories, getArticleCategory, getArticles } from "@/lib/content/articles";
import { Reveal } from "@/motion/Reveal";
import { afterBanner } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
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
  /* Ordem de leitura: banner → trilha → aviso e categorias → blocos. */
  const afterTop = afterBanner(motionTokens, category.label);

  return (
    <>
      <PageBanner eyebrow="Categoria" title={category.label} subtitle={countLabel(articles.length)} size="compact" />

      <div className="container">
        <Reveal variant="fade" trigger="mount" delay={afterTop}>
          <Breadcrumbs
            className={styles.trail}
            items={[
              { label: "Conteúdo", href: "/conteudo" },
              { label: category.label, href: `/conteudo/categoria/${category.slug}` },
            ]}
          />
        </Reveal>
      </div>

      <div className={`container ${styles.page}`}>
        <ArticleCategoryNav current={category.slug} entranceDelay={afterTop + motionTokens.stagger.cards} />

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
