import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import { ArticleBody } from "@/components/content/ArticleBody";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ARTICLE_AUTHOR,
  ARTICLES_ARE_EXAMPLES,
  articleTitle,
  getArticle,
  getArticleCategory,
  getArticles,
  getRelatedArticles,
} from "@/lib/content/articles";
import styles from "./artigo.module.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const RELATED_LIMIT = 2;
const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  /* Sem descrição enquanto não houver texto: repetir o título não ajuda o buscador. */
  return article ? { title: articleTitle(article) } : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getArticleCategory(article.category);
  const related = getRelatedArticles(article, RELATED_LIMIT);

  return (
    <>
      <PageBanner eyebrow={category?.label ?? "Conteúdo"} title={articleTitle(article)} size="compact" />

      <div className={`container ${styles.page}`}>
        <div className={styles.column}>
          <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
            <ol>
              <li>
                <Link href="/conteudo">Conteúdo</Link>
                <ChevronRight aria-hidden="true" />
              </li>
              {category && (
                <li>
                  <Link href={`/conteudo/categoria/${category.slug}`}>{category.label}</Link>
                  <ChevronRight aria-hidden="true" />
                </li>
              )}
              <li aria-current="page">{article.keyword.replace(/:$/, "")}</li>
            </ol>
          </nav>
          <p className={styles.meta}>
            <span className={styles.author}>
              Por <strong>{ARTICLE_AUTHOR}</strong>
            </span>
            <span aria-hidden="true">·</span>
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>{DATE_FORMAT.format(new Date(article.publishedAt))}</time>
            ) : (
              <span className="pending">Data a confirmar</span>
            )}
            {ARTICLES_ARE_EXAMPLES && <span className="pending">Artigo de exemplo</span>}
          </p>
        </div>

        <figure className={styles.cover}>
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 720px"
            style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
          />
        </figure>

        <div className={styles.column}>
          {article.body ? (
            <ArticleBody blocks={article.body} />
          ) : (
            <EmptyState
              icon={<FileText aria-hidden="true" />}
              title="Texto em preparação"
              text={
                ARTICLES_ARE_EXAMPLES
                  ? "Este título é um exemplo do layout de referência. O texto real entra quando a pauta da Salete for definida."
                  : "O artigo completo será publicado em breve."
              }
            />
          )}

          <aside className={styles.cta} data-surface="dark" aria-labelledby="entender-melhor">
            <h2 id="entender-melhor" className={styles.ctaTitle}>
              Quer entender melhor?
            </h2>
            <p className={styles.ctaText}>Conheça os cursos ou converse com a Salete sobre o seu caso.</p>
            <div className={styles.ctaActions}>
              <Button href="/cursos" variant="accent">
                Conhecer os cursos
              </Button>
              <Button href="/contato" variant="ghost">
                Fale com a Salete
              </Button>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="leia-tambem">
            <h2 id="leia-tambem" className={styles.heading}>
              Leia também
            </h2>
            <ArticleGrid articles={related} />
          </section>
        )}
      </div>
    </>
  );
}
