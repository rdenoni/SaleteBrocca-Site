"use client";

import { motion } from "motion/react";
import { User } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { HOME_FEATURED_NAV_HREF, MAIN_NAV, STUDENT_AREA } from "@/lib/content/site";
import { BLUE_PIECE, CYAN_PIECE, SYMBOL_STROKE, SYMBOL_VIEWBOX } from "@/motion/BrandSymbol";
import { MotionButton } from "@/motion/MotionButton";
import { headerTimeline } from "@/motion/timeline";
import { TransitionLink } from "@/motion/transitions/TransitionLink";
import { openPageGateAfterHeader, useCurtainReady } from "@/motion/transitions/useEntranceReady";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { HeaderNav } from "./HeaderNav";
import { MobileMenu } from "./MobileMenu";
import { SmartHeader } from "./SmartHeader";
import styles from "./Header.module.css";

const HOME_HREF = "/";
const LOGO_SRC = "/brand/logo/logo-lateral-cor.png";
const LOGO_SIZES = "(max-width: 1099px) 168px, 181px";
/* Onde o PNG oficial (500 × 155) se divide: o símbolo ocupa as colunas 19–127 e o nome "SaleteBrocca" começa na 152.
   Medido pixel a pixel (alfa > 8): as colunas 128–151 são totalmente transparentes. Cortar em 140 (28%) não
   atravessa nenhum pixel pintado, então o nome recortado nunca toca o símbolo. */
const LOGO_SPLIT_PERCENT = 28;
const WORDMARK_CLOSED = `inset(0% ${100 - LOGO_SPLIT_PERCENT}% 0% ${LOGO_SPLIT_PERCENT}%)`;
const WORDMARK_OPEN = `inset(0% 0% 0% ${LOGO_SPLIT_PERCENT}%)`;
/* O nome desliza da esquerda (em px) enquanto o traço o revela: lê como "saindo" do símbolo. */
const WORDMARK_START_X = -16;

/* Onde as duas peças SVG (viewBox "70 70 360 360" do BrandSymbol) caem sobre o PNG, em % da caixa 500 × 155.
   O traço desenhado ocupa x 97–403 e y 83–417 (espessura de 62 incluída); no PNG isso são as colunas 19–127 e as
   linhas 18–136. Ajuste por mínimos quadrados contra o alfa do PNG: 0,356 px por unidade e origem do viewBox em
   (8,9 ; 13,8) px, uma caixa quadrada de ~128 px (IoU 0,95 com o PNG; as cores são idênticas). */
const SYMBOL_BOX = { left: "1.78%", top: "8.9%", width: "25.63%", height: "82.7%" };
/* Peças afastadas: as mesmas proporções da frase-conceito (150 × 110 de 360 unidades, giro de 22°), em % da caixa
   da peça. A ciano vem de cima à esquerda, a azul de baixo à direita. */
const APART = { x: 42, y: 31, rotate: 22 };
/* Centro do traço de cada peça em frações da caixa (ciano x 128–318, y 114–302; azul x 182–372, y 198–386): gira por ele. */
const CYAN_ORIGIN = { originX: (223 - 70) / 360, originY: (208 - 70) / 360 };
const BLUE_ORIGIN = { originX: (277 - 70) / 360, originY: (292 - 70) / 360 };
const SYMBOL_PIECES = [
  {
    key: "cyan",
    d: CYAN_PIECE,
    color: "var(--cyan)",
    origin: CYAN_ORIGIN,
    from: { x: `${-APART.x}%`, y: `${-APART.y}%`, rotate: -APART.rotate },
  },
  {
    key: "blue",
    d: BLUE_PIECE,
    color: "var(--blue)",
    origin: BLUE_ORIGIN,
    from: { x: `${APART.x}%`, y: `${APART.y}%`, rotate: APART.rotate },
  },
] as const;
/* Duas peças + o nome: a troca pela imagem original só acontece quando os três terminam. */
const ENTRANCE_PARTS = SYMBOL_PIECES.length + 1;

/* "playing": cópias animando. "fading": a imagem original já está opaca por baixo e as peças somem. "done": só a original. */
type LogoPhase = "playing" | "fading" | "done";

/* Logo oficial. Em repouso é a imagem única do site (PNG, sem redesenho).
   Entrada (uma vez, depois de useEntranceReady, junto com a pílula descendo):
   - Símbolo: as duas peças do BrandSymbol (ciano e azul), cada uma numa camada HTML própria com um só <svg>, como na
     frase-conceito, alinhadas sobre o símbolo do PNG. Chegam de lados opostos, giradas, e se encaixam com spring.fit.
   - Nome: uma cópia do PNG recortada (clip-path) revela da esquerda para a direita (ease.stroke), quando as peças chegam.
   Ao terminar, a imagem original fica opaca de uma vez, a cópia do nome sai (é idêntica a ela, nada muda) e só as
   peças somem num fade curto: o SVG é uma reconstrução e difere do PNG por frações de pixel nas bordas; o fade
   esconde isso sem o miolo ficar translúcido (a original já está opaca por baixo).
   Movimento reduzido: a imagem original só aparece com fade. Sem JavaScript: a imagem original fica visível (data-reveal). */
function HeaderLogo({ ready }: { ready: boolean }) {
  const t = useMotionTokens();
  const [phase, setPhase] = useState<LogoPhase>("playing");
  const finishedParts = useRef(new Set<string>());
  const animated = !t.reduced && phase !== "done";

  /* Cada peça termina com a mola; o nome, com o traço. Só troca quando todos acabam, senão o nome apareceria de repente. */
  function markFinished(part: string) {
    finishedParts.current.add(part);
    if (finishedParts.current.size >= ENTRANCE_PARTS) setPhase("fading");
  }

  /* Em sequência, não junto (headerTimeline): a pílula desce primeiro; as peças encaixam quando ela pousa;
     o nome começa quando elas estão chegando; links e botões só depois. Nome pronto ≈ 1,8 s em 1×. */
  const { symbol: symbolDelay, wordmark: wordmarkDelay, wordmarkDuration } = headerTimeline(t, MAIN_NAV.length);
  const pieceTransition = {
    default: { ...t.spring.fit, delay: symbolDelay },
    opacity: { duration: t.duration.quick, ease: t.ease.out, delay: symbolDelay },
  };

  return (
    <span className={styles.logoStack}>
      {/* A imagem original. Com movimento completo, ela fica opaca de uma vez (style, no mesmo commit que tira a cópia
          do nome): nenhum quadro fica sem logo. Com movimento reduzido, ela entra com um fade. */}
      <motion.span
        className={styles.logoBase}
        data-reveal=""
        initial={t.reduced ? { opacity: 0 } : false}
        animate={t.reduced ? { opacity: ready ? 1 : 0 } : undefined}
        transition={{ duration: t.duration.quick, ease: t.ease.out }}
        style={t.reduced ? undefined : { opacity: phase === "playing" ? 0 : 1 }}
      >
        <Image
          src={LOGO_SRC}
          alt="SaleteBrocca"
          width={500}
          height={155}
          sizes={LOGO_SIZES}
          priority
          className={styles.logoImage}
        />
      </motion.span>

      {animated ? (
        <span className={styles.logoCopies} aria-hidden="true">
          {/* Sem data-reveal de propósito: sem JavaScript as peças ficam em opacity 0 e só a imagem original aparece. */}
          <motion.span
            className={styles.logoSymbol}
            style={SYMBOL_BOX}
            animate={{ opacity: phase === "fading" ? 0 : 1 }}
            transition={{ duration: t.duration.quick, ease: t.ease.out }}
            onAnimationComplete={phase === "fading" ? () => setPhase("done") : undefined}
          >
            {SYMBOL_PIECES.map((piece) => (
              <motion.span
                key={piece.key}
                className={styles.logoPiece}
                style={piece.origin}
                initial={{ opacity: 0, ...piece.from }}
                animate={ready ? { opacity: 1, x: "0%", y: "0%", rotate: 0 } : undefined}
                transition={pieceTransition}
                onAnimationComplete={ready ? () => markFinished(piece.key) : undefined}
              >
                <svg className={styles.logoPieceSvg} viewBox={SYMBOL_VIEWBOX} overflow="visible" focusable="false">
                  <path
                    d={piece.d}
                    fill="none"
                    stroke={piece.color}
                    strokeWidth={SYMBOL_STROKE}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
            ))}
          </motion.span>
          {/* A cópia do nome só vive enquanto ele é revelado; sai no mesmo commit em que a original fica opaca. */}
          {phase === "playing" ? (
            <motion.span
              className={styles.logoPart}
              initial={{ clipPath: WORDMARK_CLOSED, x: WORDMARK_START_X }}
              animate={ready ? { clipPath: WORDMARK_OPEN, x: 0 } : undefined}
              transition={{ duration: wordmarkDuration, ease: t.ease.stroke, delay: wordmarkDelay }}
              onAnimationComplete={ready ? () => markFinished("wordmark") : undefined}
            >
              {/* Fundo, e não <img>: a cópia some do DOM ao fim da entrada; um <img> que desaparece no meio de uma
                  automação (ou de um leitor que percorre as imagens) falha como "elemento desanexado". */}
              <span className={styles.logoCopyImage} style={{ backgroundImage: `url(${LOGO_SRC})` }} />
            </motion.span>
          ) : null}
        </span>
      ) : null}
      {phase === "done" && !t.reduced ? (
        /* Camada de hover (mesma reação da frase-conceito): no repouso invisível (só o PNG oficial aparece);
           no hover do link, as duas peças SVG se afastam suavemente enquanto o nome permanece nítido. */
        <span className={styles.logoHover} aria-hidden="true">
          <span className={styles.logoSymbol} style={SYMBOL_BOX}>
            {SYMBOL_PIECES.map((piece) => (
              <span key={piece.key} className={styles.logoHoverPiece}>
                <svg className={styles.logoPieceSvg} viewBox={SYMBOL_VIEWBOX} overflow="visible" focusable="false">
                  <path
                    d={piece.d}
                    fill="none"
                    stroke={piece.color}
                    strokeWidth={SYMBOL_STROKE}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ))}
          </span>
          <span className={styles.logoPart} style={{ clipPath: WORDMARK_OPEN }}>
            <span className={styles.logoCopyImage} style={{ backgroundImage: `url(${LOGO_SRC})` }} />
          </span>
        </span>
      ) : null}
    </span>
  );
}

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* A pílula branca do site. Entrada: desce (y e opacidade) na primeira carga; a gota pinga logo depois (HeaderNav).
   O cabeçalho vive no layout raiz e não remonta ao navegar: a entrada toca uma vez só. Movimento reduzido: só opacidade. */
function HeaderBar() {
  const t = useMotionTokens();
  const ready = useCurtainReady();
  const timeline = headerTimeline(t, MAIN_NAV.length);
  /* A página só entra com o cabeçalho 80% feito: avisa quando a entrada começa (uma vez; depois o momento já passou). */
  const headerSeconds = t.reduced ? t.duration.quick : timeline.end;
  /* Layout effect: roda antes dos da página, que estimam a própria espera a partir deste momento. */
  useLayoutEffect(() => {
    if (ready) openPageGateAfterHeader(headerSeconds);
  }, [ready, headerSeconds]);
  const pathname = usePathname() ?? HOME_HREF;
  const currentHref = MAIN_NAV.find((item) => isCurrent(pathname, item.href))?.href;
  /* Na Home nenhuma página está ativa: a gota ciano destaca Cursos, como na referência. Sem item (privacidade,
     área do aluno, 404) não há gota. */
  const highlightedHref = currentHref ?? (pathname === HOME_HREF ? HOME_FEATURED_NAV_HREF : undefined);

  const hidden = { opacity: 0, y: t.reduced ? 0 : -t.distance.base };
  /* Ordem da marca: símbolo, nome e só então os botões (os links fazem a própria cascata em HeaderNav). */
  const actionsHidden = { opacity: 0, y: t.reduced ? 0 : -t.distance.small };
  const actionsTransition = t.reduced
    ? { duration: t.duration.quick, y: { duration: 0 } }
    : { duration: timeline.itemDuration, ease: t.ease.out, delay: timeline.actions };
  const transition = t.reduced
    ? { duration: t.duration.quick, y: { duration: 0 } }
    : { duration: t.duration.gentle, ease: t.ease.out };

  return (
    <motion.div
      className={styles.header}
      data-reveal=""
      initial={{ opacity: 0, y: -t.distance.base }}
      animate={ready ? { opacity: 1, y: 0 } : hidden}
      transition={transition}
    >
      <TransitionLink href={HOME_HREF} className={styles.logo} aria-label="Salete Brocca, página inicial">
        <HeaderLogo ready={ready} />
      </TransitionLink>

      <HeaderNav currentHref={currentHref} highlightedHref={highlightedHref} />

      <motion.div
        className={styles.actions}
        data-reveal=""
        initial={{ opacity: 0, y: -t.distance.small }}
        animate={ready ? { opacity: 1, y: 0 } : actionsHidden}
        transition={actionsTransition}
      >
        <MotionButton
          href={STUDENT_AREA.href}
          variant="accent"
          icon={<User aria-hidden="true" />}
          className={styles.studentButton}
          aria-current={isCurrent(pathname, STUDENT_AREA.href) ? "page" : undefined}
          withCurtain
        >
          {STUDENT_AREA.label}
        </MotionButton>
        <MobileMenu currentHref={currentHref} />
      </motion.div>
    </motion.div>
  );
}

/* Cabeçalho do site: pílula branca flutuante no topo de cada página, que reaparece ao rolar para cima. */
export function Header() {
  return (
    <SmartHeader>
      <HeaderBar />
    </SmartHeader>
  );
}
