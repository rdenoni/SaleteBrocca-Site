import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { Article } from "@/types/content";
import { ContentCard, type ContentCardTone } from "./ContentCard";
import styles from "./ArticleGrid.module.css";

const TONES: readonly ContentCardTone[] = ["light", "blue"];
const COLUMNS = 3;

interface ArticleGridProps {
  articles: readonly Article[];
}

/* Blocos de cor alternados (claro | azul). Enquanto houver menos artigos que colunas,
   um aviso honesto completa a linha em vez de artigos inventados. */
export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <ul className={styles.grid}>
      {articles.map((article, index) => (
        <li key={article.slug}>
          <ContentCard article={article} tone={TONES[index % TONES.length]} />
        </li>
      ))}
      {articles.length < COLUMNS && (
        <li>
          <EmptyState
            icon={<Newspaper aria-hidden="true" />}
            title="Novos artigos em breve"
            text="Os próximos textos da Salete serão publicados aqui."
          >
            <LinkArrow href="/cursos">Conheça os cursos</LinkArrow>
          </EmptyState>
        </li>
      )}
    </ul>
  );
}
