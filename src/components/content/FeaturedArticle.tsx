import Image from "next/image";
import Link from "next/link";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { ARTICLE_AUTHOR, getArticleCategory } from "@/lib/content/articles";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { motionTokens } from "@/motion/tokens";
import type { Article } from "@/types/content";
import styles from "./FeaturedArticle.module.css";

interface FeaturedArticleProps {
  article: Article;
  /** Com valor (s), entra ao montar como parte do topo da página (logo depois das categorias); sem valor, ao chegar
      à tela. */
  entranceDelay?: number;
}

const { duration, stagger } = motionTokens;
/* A base navy se desvela primeiro; o texto começa com ela já subindo. */
const BODY_DELAY = duration.base;
/* Itens do bloco de texto (selo, título, autora, link): a foto entra quando o último já está subindo. */
const BODY_ITEMS = 4;
const PHOTO_DELAY = BODY_DELAY + (BODY_ITEMS - 1) * stagger.items + duration.base;

/* Destaque da biblioteca: foto grande e bloco navy com o título "Palavra-chave: título".
   Dois links de verdade (o título e "Leia o artigo"), cada um com o próprio hover e foco; o card não é um botão.
   Entrada: a base navy se desvela → selo → título → autora → "Leia o artigo" → a foto se desvela
   (ao montar, com entranceDelay). A foto nunca aparece antes do texto que a apresenta (ordem de leitura). */
export function FeaturedArticle({ article, entranceDelay }: FeaturedArticleProps) {
  const trigger = entranceDelay === undefined ? "inView" : "mount";
  const start = entranceDelay ?? 0;
  const href = `/conteudo/${article.slug}`;
  const category = getArticleCategory(article.category);

  return (
    <Reveal
      as="article"
      variant="mask"
      trigger={trigger}
      delay={start}
      className={styles.card}
      data-surface="dark"
      aria-labelledby="destaque-titulo"
    >
      <Reveal variant="mask" trigger={trigger} delay={start + PHOTO_DELAY} className={styles.photo}>
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 720px"
          style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
        />
      </Reveal>
      <Stagger className={styles.body} trigger={trigger} delay={start + BODY_DELAY}>
        <StaggerItem>
          <p className="eyebrow">Em destaque{category ? ` · ${category.label}` : ""}</p>
        </StaggerItem>
        <StaggerItem>
          <h2 id="destaque-titulo" className={styles.title}>
            <Link href={href} className={styles.link}>
              <strong>{article.keyword}</strong> {article.title}
            </Link>
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className={styles.author}>Por {ARTICLE_AUTHOR}</p>
        </StaggerItem>
        <StaggerItem>
          <LinkArrow href={href} tone="inverse" className={styles.more}>
            Leia o artigo<span className="visually-hidden"> sobre {article.keyword}</span>
          </LinkArrow>
        </StaggerItem>
      </Stagger>
    </Reveal>
  );
}
