import Image from "next/image";
import Link from "next/link";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { ARTICLE_AUTHOR, getArticleCategory } from "@/lib/content/articles";
import type { Article } from "@/types/content";
import styles from "./FeaturedArticle.module.css";

interface FeaturedArticleProps {
  article: Article;
}

/* Destaque da biblioteca: foto grande e bloco navy com o título "Palavra-chave: título". */
export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const href = `/conteudo/${article.slug}`;
  const category = getArticleCategory(article.category);

  return (
    <article className={styles.card} data-surface="dark" aria-labelledby="destaque-titulo">
      <div className={styles.photo}>
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 720px"
          style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
        />
      </div>
      <div className={styles.body}>
        <p className="eyebrow">Em destaque{category ? ` · ${category.label}` : ""}</p>
        <h2 id="destaque-titulo" className={styles.title}>
          <Link href={href} className={styles.link}>
            <strong>{article.keyword}</strong> {article.title}
          </Link>
        </h2>
        <p className={styles.author}>Por {ARTICLE_AUTHOR}</p>
        <LinkArrow href={href} tone="inverse" decorative className={styles.more}>
          Leia o artigo
        </LinkArrow>
      </div>
    </article>
  );
}
