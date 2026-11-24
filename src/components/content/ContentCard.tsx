import Image from "next/image";
import Link from "next/link";
import { LinkArrow } from "@/components/ui/LinkArrow";
import type { Article } from "@/types/content";
import styles from "./ContentCard.module.css";
import { Reveal } from "@/motion/Reveal";
import { overlapAfter } from "@/motion/timeline";
import { duration } from "@/motion/tokens";

/* A foto do card se desvela (de cima para baixo) com o card 30% formado. */
const CARD_PHOTO_DELAY = overlapAfter(duration.gentle);

export type ContentCardTone = "light" | "blue";

interface ContentCardProps {
  article: Article;
  tone?: ContentCardTone;
  /** Letra gigante translúcida ao fundo do bloco (grafismo tipográfico da referência). */
  letter?: string;
}

export function ContentCard({ article, tone = "light", letter }: ContentCardProps) {
  const href = `/conteudo/${article.slug}`;
  return (
    <article className={styles.card} data-tone={tone}>
      {letter && (
        <span className={styles.letter} aria-hidden="true">
          {letter}
        </span>
      )}
      <Reveal variant="mask" delay={CARD_PHOTO_DELAY} className={styles.photo}>
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 1099px) 60vw, 280px"
          style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
        />
      </Reveal>
      <div className={styles.panel}>
        <h3 className={styles.title}>
          <Link href={href} className={styles.link}>
            <strong>{article.keyword}</strong> {article.title}
          </Link>
        </h3>
      </div>
      <LinkArrow href={href} tone={tone === "blue" ? "inverse" : "default"} className={styles.more} decorative>
        Ler artigo
      </LinkArrow>
    </article>
  );
}
