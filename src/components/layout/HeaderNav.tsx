"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue, type ValueAnimationTransition } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MAIN_NAV } from "@/lib/content/site";
import { headerTimeline } from "@/motion/timeline";
import { useCurtainReady } from "@/motion/transitions/useEntranceReady";
import { TransitionLink } from "@/motion/transitions/TransitionLink";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./Header.module.css";

/* A gota é 6px mais larga que o link de cada lado (24px de respiro contra os 18px do link, como no site).
   A camada dela (.gotaLayer) também é 6px mais larga que a lista de cada lado: sem isso, na primeira e na última
   posição o recorte passava da lista e o que sobrava (Cursos, Contato) ficava sem pintura, cortado. */
const GOTA_BLEED = 6;
/* Valor longo o bastante para recortar tudo antes da primeira medição (o servidor não mede nada). */
const CLIPPED_AWAY = 9999;
const GOTA_ROUND = "0px 0px var(--radius-xl) var(--radius-xl)";

interface LinkBox {
  start: number;
  end: number;
  padding: number;
}

function insetClip(left: number, right: number, round?: string): string {
  return `inset(0px ${right}px 0px ${left}px${round ? ` round ${round}` : ""})`;
}

/* Desliza um valor numérico até o destino (mola) ou salta, conforme o movimento. */
function glide(value: MotionValue<number>, to: number, instant: boolean, transition: ValueAnimationTransition<number>) {
  if (instant) {
    value.stop();
    value.set(to);
    return;
  }
  animate(value, to, transition);
}

interface HeaderNavProps {
  /** Item da rota atual: ganha aria-current="page". */
  currentHref?: string;
  /** Item que recebe a gota: a rota atual ou, na Home, Cursos (como na referência). Sem item, a gota some. */
  highlightedHref?: string;
}

/* Navegação principal (≥ 1100px). Duas marcas viajam entre os itens:
   - a GOTA ciano (traço do site) que marca a página atual e desliza quando a rota muda;
   - o SUBLINHADO de hover/foco, uma peça só que desliza de item em item.
   Elas são recortes (clip-path) de uma camada que cobre a lista inteira, em vez de layoutId: a posição vem do
   offsetLeft dos links (não depende da rolagem, então funciona com o cabeçalho fixo) e o raio da gota não deforma. */
export function HeaderNav({ currentHref, highlightedHref }: HeaderNavProps) {
  const t = useMotionTokens();
  const ready = useCurtainReady();

  /* As chaves são os href (únicos). null = nenhuma página do menu está ativa (privacidade, área do aluno, 404). */
  const activeHref = highlightedHref ?? null;
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [measured, setMeasured] = useState(false);
  const underlineTarget = hovered ?? focused;
  /* Sobre a gota o sublinhado some: ela já marca o item (como no site). */
  const underlineHref = underlineTarget && underlineTarget !== activeHref ? underlineTarget : null;

  const trackRef = useRef<HTMLDivElement>(null);
  const gotaLayerRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  const gotaLeft = useMotionValue(0);
  const gotaRight = useMotionValue(CLIPPED_AWAY);
  const lineLeft = useMotionValue(0);
  const lineRight = useMotionValue(CLIPPED_AWAY);
  const gotaClip = useTransform([gotaLeft, gotaRight], ([left, right]: number[]) => insetClip(left, right, GOTA_ROUND));
  const lineClip = useTransform([lineLeft, lineRight], ([left, right]: number[]) => insetClip(left, right));

  const tokensRef = useRef(t);
  tokensRef.current = t;
  const activeRef = useRef(activeHref);
  activeRef.current = activeHref;
  const underlineRef = useRef(underlineHref);
  underlineRef.current = underlineHref;
  const lineVisibleRef = useRef(false);
  const gotaPlacedRef = useRef(false);

  /* Caixas dos links medidas numa passada só (leituras juntas, sem escrever entre elas), no callback do
     ResizeObserver: ali o layout já está pronto (depois do layout, antes da pintura), então a medição não força
     recálculo nenhum. A gota e o sublinhado só leem este cache; hover e rolagem nunca tocam o layout. */
  const boxesRef = useRef(new Map<string, LinkBox>());
  const trackWidthRef = useRef(0);
  const measuredRef = useRef(false);

  const measureAll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const boxes = new Map<string, LinkBox>();
    let padding = 0;
    linkRefs.current.forEach((link, href) => {
      boxes.set(href, { start: link.offsetLeft, end: link.offsetLeft + link.offsetWidth, padding: 0 });
      if (padding === 0) padding = parseFloat(getComputedStyle(link).paddingLeft) || 0;
    });
    boxes.forEach((box) => {
      box.padding = padding;
    });
    boxesRef.current = boxes;
    trackWidthRef.current = track.offsetWidth;
    measuredRef.current = boxes.size > 0;
  }, []);

  const measure = useCallback((href: string): (LinkBox & { width: number }) | null => {
    const box = boxesRef.current.get(href);
    if (!box || !measuredRef.current) return null;
    return { ...box, width: trackWidthRef.current };
  }, []);

  const placeGota = useCallback(
    (instant: boolean) => {
      const active = activeRef.current;
      if (!active) return;
      const box = measure(active);
      if (!box) return;
      const tokens = tokensRef.current;
      const jump = instant || tokens.reduced || !gotaPlacedRef.current;
      gotaPlacedRef.current = true;
      /* A camada começa GOTA_BLEED antes da lista: o recorte (já com o respiro de cada lado) fica igual ao do link. */
      glide(gotaLeft, box.start, jump, tokens.spring.fit);
      glide(gotaRight, box.width - box.end, jump, tokens.spring.fit);
    },
    [gotaLeft, gotaRight, measure],
  );

  const placeLine = useCallback(
    (href: string | null, instant: boolean) => {
      if (!href) return;
      const box = measure(href);
      if (!box) return;
      const tokens = tokensRef.current;
      /* Aparecendo agora: nasce sob o item (sem viajar de onde parou); já visível: desliza. */
      const jump = instant || tokens.reduced || !lineVisibleRef.current;
      glide(lineLeft, box.start + box.padding, jump, tokens.spring.ui);
      glide(lineRight, box.width - box.end + box.padding, jump, tokens.spring.ui);
    },
    [lineLeft, lineRight, measure],
  );

  /* A primeira medição vem do primeiro callback do ResizeObserver (depois do layout, antes da pintura): nada é lido
     durante a montagem. O mesmo observador refaz tudo quando a lista muda de tamanho (fonte, largura da tela).
     `measured` (estado, sem leitura de layout) libera a entrada da gota já na montagem, como antes: a gota só
     aparece depois do atraso da entrada, quando o observador já a colocou no lugar. */
  useLayoutEffect(() => {
    setMeasured(true);
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      measureAll();
      placeGota(true);
      placeLine(underlineRef.current, true);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [measureAll, placeGota, placeLine]);

  /* A gota acompanha a rota atual. Sem item ativo ela some; ao voltar, nasce sob o novo item (sem viajar). */
  useEffect(() => {
    if (activeHref === null) {
      gotaPlacedRef.current = false;
      return;
    }
    placeGota(false);
  }, [activeHref, placeGota]);

  /* O sublinhado viaja entre os itens; ao sair some por opacidade (a posição fica onde estava). */
  useEffect(() => {
    placeLine(underlineHref, false);
    lineVisibleRef.current = underlineHref !== null;
  }, [underlineHref, placeLine]);

  /* A camada da gota (grande) só é promovida enquanto a entrada dela roda; ao terminar, volta ao normal. */
  const promoteGota = (on: boolean) => {
    const layer = gotaLayerRef.current;
    if (layer) layer.style.willChange = on ? "transform, opacity" : "";
  };

  /* Os links entram depois do símbolo e do nome (headerTimeline), um a um; a gota pinga quando o último chega. */
  const timeline = headerTimeline(t, MAIN_NAV.length);
  const itemHidden = { opacity: 0, y: t.reduced ? 0 : -t.distance.small };
  const itemTransition = (index: number) =>
    t.reduced
      ? { duration: t.duration.quick, y: { duration: 0 } }
      : { duration: timeline.itemDuration, ease: t.ease.out, delay: timeline.navItem(index) };

  const gotaIn = ready && measured && activeHref !== null;
  /* Só a primeira entrada espera a cascata; depois (ex.: vindo de uma página sem item) a gota pinga logo. */
  const [gotaEntered, setGotaEntered] = useState(false);
  const gotaDelay = gotaEntered ? t.duration.instant : timeline.gota;
  const hiddenGota = { opacity: 0, scaleY: t.reduced ? 1 : 0 };
  const gotaTransition = t.reduced
    ? { opacity: { duration: t.duration.quick }, scaleY: { duration: 0 } }
    : {
        delay: gotaDelay,
        opacity: { duration: t.duration.quick, delay: gotaDelay },
        scaleY: { ...t.spring.fit, delay: gotaDelay },
      };

  return (
    <nav aria-label="Principal" className={styles.nav}>
      <div ref={trackRef} className={styles.track} onPointerLeave={() => setHovered(null)}>
        {/* A gota pinga do topo do cabeçalho (scaleY, origem no topo). */}
        <motion.span
          ref={gotaLayerRef}
          aria-hidden="true"
          className={`${styles.markLayer} ${styles.gotaLayer}`}
          data-reveal=""
          onAnimationStart={() => promoteGota(true)}
          onAnimationComplete={() => {
            promoteGota(false);
            if (gotaIn) setGotaEntered(true);
          }}
          style={{ originY: 0 }}
          initial={hiddenGota}
          animate={gotaIn ? { opacity: 1, scaleY: 1 } : hiddenGota}
          transition={gotaTransition}
        >
          <motion.span className={styles.gota} style={{ clipPath: gotaClip }} />
        </motion.span>

        <motion.span
          aria-hidden="true"
          className={`${styles.markLayer} ${styles.lineLayer}`}
          /* Sem data-reveal: é o indicador de hover, escondido em repouso de propósito (também sem JavaScript). */
          initial={{ opacity: 0 }}
          animate={{ opacity: underlineHref ? 1 : 0 }}
          transition={{ duration: t.duration.quick, ease: t.ease.out }}
        >
          <motion.span className={styles.underline} style={{ clipPath: lineClip }} />
        </motion.span>

        <ul className={styles.navList}>
          {MAIN_NAV.map((item, index) => (
            <li key={item.href}>
              <TransitionLink
                href={item.href}
                ref={(node: HTMLAnchorElement | null) => {
                  if (node) linkRefs.current.set(item.href, node);
                  else linkRefs.current.delete(item.href);
                }}
                className={styles.navLink}
                aria-current={item.href === currentHref ? "page" : undefined}
                data-fallback-gota={!measured && item.href === activeHref ? "" : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHovered(item.href);
                }}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) setFocused(item.href);
                }}
                onBlur={() => setFocused(null)}
              >
                {/* Anima só o rótulo: um transform no <li> ou no link vira offsetParent e estraga a medição da gota. */}
                <motion.span
                  className={styles.navLabel}
                  data-reveal=""
                  initial={{ opacity: 0, y: -t.distance.small }}
                  animate={ready ? { opacity: 1, y: 0 } : itemHidden}
                  transition={itemTransition(index)}
                >
                  {item.label}
                </motion.span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
