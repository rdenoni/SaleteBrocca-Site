import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import type { Article } from "@/types/content";
import { ArticleCarousel } from "./ArticleCarousel";
import { ContentCard, type ContentCardTone } from "./ContentCard";
import styles from "./ArticleGrid.module.css";

const TONES: readonly ContentCardTone[] = ["light", "blue"];
const COLUMNS = 3;

interface ArticleGridProps {
  articles: readonly Article[];
  /** Espera o título da seção (afterTitle). */
  delay?: number;
}

/* Blocos de cor alternados (claro | azul), sempre numa linha só: até COLUMNS artigos, grade; acima disso, carrossel
   com setas (ArticleCarousel). Enquanto houver menos artigos que colunas, um aviso honesto completa a linha em vez de
   artigos inventados.
   Entrada: os blocos sobem em cascata, da esquerda para a direita, depois do título da seção. */
export function ArticleGrid({ articles, delay = 0 }: ArticleGridProps) {
  const cards = articles.map((article, index) => (
    <StaggerItem as="li" key={article.slug}>
      <ContentCard article={article} tone={TONES[index % TONES.length]} />
    </StaggerItem>
  ));

  if (articles.length > COLUMNS) {
    return (
      <ArticleCarousel label="Artigos" delay={delay}>
        {cards}
      </ArticleCarousel>
    );
  }

  return (
    <Stagger as="ul" pace="cards" delay={delay} className={styles.grid}>
      {cards}
      {articles.length < COLUMNS && (
        <StaggerItem as="li">
          <EmptyState
            icon={<Newspaper aria-hidden="true" />}
            title="Novos artigos em breve"
            text="Os próximos textos da Salete serão publicados aqui."
          >
            <LinkArrow href="/cursos">Conheça os cursos</LinkArrow>
          </EmptyState>
        </StaggerItem>
      )}
    </Stagger>
  );
}
