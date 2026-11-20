import type { Metadata } from "next";
import { ArticleCategoryNav } from "@/components/content/ArticleCategoryNav";
import { ArticleGrid } from "@/components/content/ArticleGrid";
import { FeaturedArticle } from "@/components/content/FeaturedArticle";
import { PodcastSection } from "@/components/content/PodcastSection";
import { PageBanner } from "@/components/layout/PageBanner";
import { ARTICLES_ARE_EXAMPLES, getArticleCategories, getArticles } from "@/lib/content/articles";
import { TextReveal } from "@/motion/TextReveal";
import { afterBanner, afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import styles from "./conteudo.module.css";

export const metadata: Metadata = {
  title: "Conteúdo",
  description:
    "Artigos, orientações e podcast de Maria Salete Brocca Denoni, professora e fonoaudióloga clínica.",
};

const BANNER_TITLE = "Conteúdo";
const MORE_TITLE = "Mais conteúdos";
const { duration, stagger } = motionTokens;
/* Topo da página, ao montar: aviso → pílulas (Todos + categorias, ver ArticleCategoryNav) → destaque. */
const TOP_START = afterBanner(motionTokens, BANNER_TITLE);
const PILLS_START = TOP_START + (ARTICLES_ARE_EXAMPLES ? stagger.cards * 2 : 0);
const FEATURED_START = PILLS_START + getArticleCategories().length * stagger.items + duration.base;

/* Movimento (ordem de leitura): banner → aviso e categorias (ao montar) → destaque → "Mais conteúdos" e os blocos
   → podcast (ao chegar à tela; o que já estiver na tela ao abrir espera o topo). */
export default function ContentLibraryPage() {
  const [featured, ...rest] = getArticles();

  return (
    <>
      <PageBanner
        title={BANNER_TITLE}
        subtitle="Artigos, orientações e podcast de Maria Salete Brocca Denoni."
        size="compact"
      />

      <div className={`container ${styles.page}`}>
        <ArticleCategoryNav entranceDelay={TOP_START} />

        {featured && <FeaturedArticle article={featured} entranceDelay={FEATURED_START} />}

        <section aria-labelledby="mais-conteudos">
          <TextReveal as="h2" id="mais-conteudos" className={styles.heading} text={MORE_TITLE} />
          <ArticleGrid articles={rest} delay={afterTitle(motionTokens, MORE_TITLE)} />
        </section>

        <PodcastSection />
      </div>
    </>
  );
}
