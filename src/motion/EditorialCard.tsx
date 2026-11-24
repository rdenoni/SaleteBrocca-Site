"use client";

import { ChevronRight } from "lucide-react";
import { motion, type MotionValue, type Variants } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ComponentProps } from "react";
import styles from "./EditorialCard.module.css";
import { TransitionLink } from "./transitions/TransitionLink";
import { useMotionTokens, type ResolvedMotionTokens } from "./useMotionTokens";
import { useEditorialScrollEntrance, type EditorialScrollEntrance } from "./useScrollEntrance";

export interface EditorialCardArticle {
  slug: string;
  keyword: string;
  title: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
}

export type EditorialCardTone = "light" | "blue" | "navy";

/* Entrada própria do card (opt-in), em dois modos:
   - "time" (padrão): o card observa a viewport sozinho e, ao chegar à tela, toca a cascata por tempo.
   - "scroll": a entrada é ligada à rolagem e feita em camadas (bloco de cor, letra, foto, painel, "Ler artigo");
     ver useEditorialScrollEntrance. */
export interface EditorialCardTimeEntrance {
  mode?: "time";
  /** Atraso (s) do card inteiro: use para a cascata entre blocos lado a lado. */
  delay?: number;
}

export interface EditorialCardScrollEntrance {
  mode: "scroll";
  /** Posição do card na fileira (0 = primeiro). */
  index?: number;
  /** Atraso por card, em fração da altura da tela. Use 0 quando os cards estão empilhados. */
  step?: number;
}

export type EditorialCardEntrance = EditorialCardTimeEntrance | EditorialCardScrollEntrance;

interface EditorialCardProps {
  article: EditorialCardArticle;
  /** Destino do link esticado. Padrão: /conteudo/{slug}. */
  href?: string;
  tone?: EditorialCardTone;
  /** Letra gigante translúcida ao fundo (grafismo tipográfico da referência). */
  letter?: string;
  /** Marque a foto do primeiro card visível acima da dobra. */
  priority?: boolean;
  /** Opcional: navega pela transição de página (cortina) em vez do Link comum. Padrão: false. */
  withCurtain?: boolean;
  /** Opcional: deslocamento vertical (ligado ao scroll) da letra de fundo, para ela derivar mais devagar que o card. */
  letterShift?: MotionValue<number> | MotionValue<string>;
  /** Opcional: o card faz a própria entrada em cascata (bloco de cor, letra, foto, painel, título, "Ler artigo").
      Sem isso o card é estático e quem usa envolve em <StaggerItem variant="mask">. */
  entrance?: EditorialCardEntrance;
}

const OPEN = "inset(0% 0% 0% 0%)";

/* Cascata interna de um card (a partir do atraso dele, tudo em tokens; termina em ≈1,1 s):
   bloco de cor varre da esquerda (0) → letra (instant) → foto se desvela (quick) → painel entra pela direita
   (quick + quick) → título (+ instant) → "Ler artigo" (painel + base). */
function entranceVariants(t: ResolvedMotionTokens, delay: number) {
  const tLetter = t.duration.instant;
  const tPhoto = t.duration.quick;
  const tPanel = t.duration.quick + t.duration.quick;
  const tTitle = tPanel + t.duration.instant;
  const tMore = tPanel + t.duration.base;

  /* Reduzido: só opacidade no card inteiro; as partes ficam neutras (a hidratação pode ter começado recortada). */
  if (t.reduced) {
    const still: Variants = {
      hidden: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: OPEN, transition: { duration: 0 } },
      visible: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: OPEN, transition: { duration: 0 } },
    };
    return {
      card: {
        hidden: { opacity: 0, clipPath: OPEN, transition: { duration: t.duration.quick } },
        visible: { opacity: 1, clipPath: OPEN, transition: { duration: t.duration.quick, delay, clipPath: { duration: 0 } } },
      } satisfies Variants,
      letter: still,
      photo: still,
      photoImage: still,
      panel: still,
      title: still,
      more: still,
    };
  }

  const enter = (start: number, duration: number, ease: ResolvedMotionTokens["ease"][keyof ResolvedMotionTokens["ease"]]) => ({
    duration,
    ease,
    delay: delay + start,
  });

  return {
    card: {
      hidden: { clipPath: "inset(0% 100% 0% 0%)" },
      visible: { clipPath: OPEN, transition: enter(0, t.duration.gentle, t.ease.stroke) },
    } satisfies Variants,
    letter: {
      hidden: { opacity: 0, x: -t.distance.base },
      visible: { opacity: 1, x: 0, transition: enter(tLetter, t.duration.gentle, t.ease.out) },
    } satisfies Variants,
    photo: {
      hidden: { clipPath: "inset(0% 0% 100% 0%)" },
      visible: { clipPath: OPEN, transition: enter(tPhoto, t.duration.slow, t.ease.out) },
    } satisfies Variants,
    photoImage: {
      hidden: { scale: 1.12 },
      visible: { scale: 1, transition: enter(tPhoto, t.duration.slow, t.ease.out) },
    } satisfies Variants,
    panel: {
      hidden: { clipPath: "inset(0% 0% 0% 100%)" },
      visible: { clipPath: OPEN, transition: enter(tPanel, t.duration.gentle, t.ease.out) },
    } satisfies Variants,
    title: {
      hidden: { opacity: 0, x: t.distance.base },
      visible: { opacity: 1, x: 0, transition: enter(tTitle, t.duration.gentle, t.ease.out) },
    } satisfies Variants,
    more: {
      hidden: { opacity: 0, y: t.distance.small },
      visible: { opacity: 1, y: 0, transition: enter(tMore, t.duration.base, t.ease.out) },
    } satisfies Variants,
  };
}

/* Card de conteúdo do site com micro-movimento no hover e no foco: a foto aproxima 1 → 1,04 dentro da moldura,
   o painel do título sobe 8px e a seta de "Ler artigo" avança 4px. O card inteiro é um único link.
   Para a entrada, envolva em <StaggerItem variant="mask"> (o card é estático) ou passe `entrance`:
   modo "time" = cascata própria por tempo; modo "scroll" = entrada ligada à rolagem.
   São dois componentes porque o scroll mode precisa de hooks (useScroll) que o card estático não deve pagar. */
export function EditorialCard(props: EditorialCardProps) {
  const { entrance, ...rest } = props;
  if (entrance?.mode === "scroll") return <ScrollEditorialCard {...rest} entrance={entrance} />;
  return <TimedEditorialCard {...rest} entrance={entrance} />;
}

type CardRootProps = Omit<EditorialCardProps, "entrance"> & {
  /** Props do <motion.article> raiz que mudam por modo de entrada. */
  rootProps: ComponentProps<typeof motion.article>;
  /** Variantes das partes internas (só no modo "time"). */
  v?: ReturnType<typeof entranceVariants>;
  /** Atributo data-reveal nas partes internas (só no modo "time"). */
  reveal?: "";
  /** Atributo data-reveal da raiz (só no modo "time": no "scroll" a raiz não se move). */
  rootReveal?: "";
  /** Entrada em camadas ligada à rolagem (só no modo "scroll"). */
  scroll?: EditorialScrollEntrance;
};

function ScrollEditorialCard({ entrance, ...rest }: Omit<EditorialCardProps, "entrance"> & { entrance: EditorialCardScrollEntrance }) {
  const ref = useRef<HTMLElement>(null);
  const scroll = useEditorialScrollEntrance(ref, { index: entrance.index, step: entrance.step });
  /* A raiz fica parada (sem opacidade nem transform, para não brigar com o hover); cada camada interna carrega
     o próprio estado inicial e o próprio atributo data-reveal / data-reveal-transform, que o noscript anula. */
  return <EditorialCardView {...rest} scroll={scroll} rootProps={{ ref }} />;
}

function TimedEditorialCard({ entrance, ...rest }: Omit<EditorialCardProps, "entrance"> & { entrance?: EditorialCardTimeEntrance }) {
  const t = useMotionTokens();
  /* Sem `entrance`, nenhuma variante é aplicada e o card renderiza como antes (inclusive dentro de um StaggerItem). */
  const v = entrance ? entranceVariants(t, entrance.delay ?? 0) : undefined;
  const reveal = entrance ? "" : undefined;
  const rootPlay = entrance ? { initial: "hidden", whileInView: "visible", viewport: t.viewport } : {};
  return <EditorialCardView {...rest} v={v} reveal={reveal} rootReveal={reveal} rootProps={{ variants: v?.card, ...rootPlay }} />;
}

function EditorialCardView({
  article,
  href,
  tone = "light",
  letter,
  priority = false,
  withCurtain = false,
  letterShift,
  rootProps,
  v,
  reveal,
  rootReveal,
  scroll,
}: CardRootProps) {
  const t = useMotionTokens();
  const target = href ?? `/conteudo/${article.slug}`;
  const LinkTag = withCurtain ? TransitionLink : Link;

  return (
    <motion.article
      className={styles.card}
      data-tone={tone}
      data-entrance={scroll ? "scroll" : undefined}
      data-reduced={t.reduced ? "" : undefined}
      data-reveal={rootReveal}
      {...rootProps}
    >
      {/* Bloco de cor: no modo "scroll" o fundo do card é este bloco, que varre por scaleX (sem clip-path). */}
      {scroll ? <motion.div ref={scroll.refs.block} className={styles.block} data-reveal-transform="" style={scroll.block} /> : null}
      {letter ? (
        <motion.span className={styles.letter} aria-hidden="true" style={letterShift ? { y: t.reduced ? 0 : letterShift } : undefined}>
          <motion.span
            className={styles.letterInner}
            data-reveal={reveal ?? (scroll ? "" : undefined)}
            variants={v?.letter}
            style={scroll?.letter}
          >
            {letter}
          </motion.span>
        </motion.span>
      ) : null}
      <motion.div className={styles.photo} data-reveal={reveal} variants={v?.photo}>
        {/* Cortina: a moldura (overflow: hidden) fica parada e a camada interna sobe de 100% a 0 com zoom 1,15 → 1. */}
        <motion.div
          ref={scroll?.refs.photo}
          className={styles.photoImage}
          data-reveal={reveal}
          data-reveal-transform={scroll ? "" : undefined}
          variants={v?.photoImage}
          style={scroll?.photo}
        >
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 1099px) 60vw, 420px"
            style={article.imagePosition ? { objectPosition: article.imagePosition } : undefined}
          />
        </motion.div>
      </motion.div>
      {/* O wrapper leva a entrada (x + opacidade) e o .panel dentro sobe 8px só no foco por teclado (no hover não, para o link do card seguir cobrindo o card inteiro): transforms em elementos distintos. */}
      <motion.div
        ref={scroll?.refs.panel}
        className={styles.panelEnter}
        data-reveal={scroll ? "" : undefined}
        style={scroll?.panel}
      >
        <motion.div className={styles.panel} data-reveal={reveal} variants={v?.panel}>
          <motion.h3 className={styles.title} data-reveal={reveal} variants={v?.title}>
            <LinkTag href={target} className={styles.link}>
              <strong>{article.keyword}</strong> {article.title}
            </LinkTag>
          </motion.h3>
        </motion.div>
      </motion.div>
      <motion.span
        ref={scroll?.refs.more}
        className={styles.more}
        aria-hidden="true"
        data-reveal={reveal ?? (scroll ? "" : undefined)}
        variants={v?.more}
        style={scroll?.more}
      >
        Ler artigo
        <span className={styles.arrow}>
          <ChevronRight strokeWidth={2.5} />
        </span>
      </motion.span>
    </motion.article>
  );
}
