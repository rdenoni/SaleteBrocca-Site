"use client";

import { Info } from "lucide-react";
import { useScroll, useTransform } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { EditorialCard, type EditorialCardTone } from "@/motion/EditorialCard";
import { Reveal } from "@/motion/Reveal";
import { ARTICLES_ARE_EXAMPLES } from "@/lib/content/articles";
import { HOME_ARTICLES_NOTE, HOME_SECTION_IDS } from "@/lib/content/home";
import type { Article } from "@/types/content";
import styles from "./FeaturedContent.module.css";

/* Blocos de cor distintos: claro (PAC) | azul (Disfagia) | navy (Gagueira), com as letras de "BLOG" ao fundo. */
const TONES: readonly EditorialCardTone[] = ["light", "blue", "navy"];
const LETTERS = ["B", "O", "G"] as const;
/* A letra deriva só alguns por cento da própria altura (sobe e desce em torno do centro). */
const LETTER_DRIFT = "7%";
/* Cascata por rolagem: cada bloco seguinte começa 7,2% da altura da tela mais tarde (+20% em relação aos 6%
   anteriores), criando uma cadência progressiva mais marcada da esquerda para a direita sem atrasar demais o
   terceiro card. Empilhado (celular/tablet) os blocos já chegam em momentos diferentes, então sem atraso adicional. */
const ROW_STEP = 0.072;
/* Mesma largura em que a grade do CSS passa de 3 colunas para 1. */
const THREE_COLUMNS_QUERY = "(min-width: 1100px)";

function subscribeColumns(onChange: () => void): () => void {
  const query = window.matchMedia(THREE_COLUMNS_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/* Servidor e hidratação assumem 3 colunas; só o passo da cascata depende disso (é um motion value, não muda o HTML). */
function useThreeColumns(): boolean {
  return useSyncExternalStore(
    subscribeColumns,
    () => window.matchMedia(THREE_COLUMNS_QUERY).matches,
    () => true,
  );
}

/* A entrada dos três blocos é conduzida pela rolagem (rolar para baixo revela, para cima desfaz): começa quando o
   topo do bloco está a ~72% da altura da tela e termina a ~32%. Em camadas (bloco de cor, foto, painel, "Ler artigo").
   Em fileira, cada bloco começa um pouco depois do anterior (cascata, da esquerda para a direita).
   Ver EditorialCard (entrance.mode "scroll") e useEditorialScrollEntrance.
   As letras gigantes ao fundo derivam mais devagar que o card (parallax por motion values). */
interface FeaturedContentProps {
  articles: readonly Article[];
}

export function FeaturedContent({ articles }: FeaturedContentProps) {
  const row = useThreeColumns();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const letterShift = useTransform(scrollYProgress, [0, 1], [`-${LETTER_DRIFT}`, LETTER_DRIFT]);

  return (
    <section ref={sectionRef} id={HOME_SECTION_IDS.content} className={styles.section} aria-labelledby="conteudos-titulo">
      <h2 id="conteudos-titulo" className="visually-hidden">
        Conteúdos em destaque
      </h2>
      <div className={styles.grid}>
        {articles.slice(0, 3).map((article, index) => (
          <div key={article.slug} className={styles.item}>
            <EditorialCard
              article={article}
              tone={TONES[index % TONES.length]}
              letter={LETTERS[index % LETTERS.length]}
              letterShift={letterShift}
              withCurtain
              entrance={{ mode: "scroll", index, step: row ? ROW_STEP : 0 }}
            />
          </div>
        ))}
      </div>
      {ARTICLES_ARE_EXAMPLES ? (
        <Reveal variant="fade" delay={0.3}>
          <p className={styles.note} role="note">
            <Info aria-hidden="true" />
            <span>
              <strong>{HOME_ARTICLES_NOTE.strong}</strong> {HOME_ARTICLES_NOTE.text}
            </span>
          </p>
        </Reveal>
      ) : null}
    </section>
  );
}
