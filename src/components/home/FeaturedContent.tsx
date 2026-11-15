import { Info } from "lucide-react";
import { ContentCard, type ContentCardTone } from "@/components/content/ContentCard";
import { ARTICLES_ARE_EXAMPLES } from "@/lib/content/articles";
import type { Article } from "@/types/content";
import styles from "./FeaturedContent.module.css";

interface FeaturedContentProps {
  articles: readonly Article[];
}

/* Blocos de cor da referência: claro | azul | claro, com as letras de "BLOG" ao fundo. */
const TONES: readonly ContentCardTone[] = ["light", "blue", "light"];
const LETTERS = ["B", "O", "G"] as const;

export function FeaturedContent({ articles }: FeaturedContentProps) {
  return (
    <section className={styles.section} aria-labelledby="conteudos-titulo">
      <h2 id="conteudos-titulo" className="visually-hidden">
        Conteúdos em destaque
      </h2>
      <div className={styles.grid}>
        {articles.slice(0, 3).map((article, index) => (
          <ContentCard
            key={article.slug}
            article={article}
            tone={TONES[index % TONES.length]}
            letter={LETTERS[index % LETTERS.length]}
          />
        ))}
      </div>
      {ARTICLES_ARE_EXAMPLES && (
        <p className={styles.note} role="note">
          <Info aria-hidden="true" />
          <span>
            <strong>Conteúdo de exemplo.</strong> Os artigos definitivos serão publicados em breve.
          </span>
        </p>
      )}
    </section>
  );
}
