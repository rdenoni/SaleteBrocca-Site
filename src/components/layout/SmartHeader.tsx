"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./Header.module.css";

/* "rest": posição original (absoluta no topo da página) · "shown": fixo e visível · "hidden": fixo e recolhido. */
type Pin = "rest" | "shown" | "hidden";

const HIDDEN_Y = "-120%";
/* Histerese: quanto o usuário precisa rolar em um sentido para o cabeçalho reagir (evita tremer com o trackpad). */
const SCROLL_DOWN_TO_HIDE = 16;
const SCROLL_UP_TO_SHOW = 10;
/* Folga para considerar o cabeçalho original totalmente fora da tela antes de fixá-lo. */
const OUT_OF_VIEW_SLACK = 8;
/* Diferença entre o topo absoluto (40px) e o fixo (16px): a essa rolagem as duas posições coincidem
   e a troca fixo → absoluto não dá salto. Abaixo de 1100px: 16px e 8px. */
const COINCIDE_DESKTOP = 24;
const COINCIDE_MOBILE = 8;
const MOBILE_QUERY = "(max-width: 1099px)";

interface SmartHeaderProps {
  children: ReactNode;
}

/* Cabeçalho inteligente: fica na posição original (absoluto, no topo de cada página) e, depois que ela saiu da
   tela, reaparece fixo ao rolar para CIMA e se recolhe ao rolar para BAIXO. A troca absoluto ↔ fixo só acontece
   com o cabeçalho fora da tela (ou quando as duas posições coincidem), então ele nunca "pula".
   Só transform (y) e opacidade são animados. Movimento reduzido: sem deslize, só aparece e some.
   O cabeçalho vive no layout raiz e persiste entre páginas: ao navegar, a rolagem volta ao topo e ele volta ao repouso. */
export function SmartHeader({ children }: SmartHeaderProps) {
  const t = useMotionTokens();
  const { scrollY } = useScroll();
  const wrapRef = useRef<HTMLElement>(null);
  const y = useMotionValue("0%");
  const opacity = useMotionValue(1);

  const [pin, setPin] = useState<Pin>("rest");
  const pinRef = useRef<Pin>("rest");
  const previousPinRef = useRef<Pin>("rest");
  const lastScrollRef = useRef(0);
  const travelRef = useRef({ down: 0, up: 0 });
  const keyboardFocusInsideRef = useRef(false);
  /* Cache para o evento de rolagem não ler layout nem criar MediaQueryList a cada quadro. */
  const restBottomRef = useRef(0);
  const isMobileRef = useRef(false);

  /* Os tokens mudam com o movimento reduzido: o efeito de animação lê a versão atual daqui. */
  const tokensRef = useRef(t);
  tokensRef.current = t;

  const changePin = useCallback((next: Pin) => {
    if (pinRef.current === next) return;
    pinRef.current = next;
    setPin(next);
  }, []);

  useLayoutEffect(() => {
    lastScrollRef.current = scrollY.get();
  }, [scrollY]);

  /* Base do cabeçalho original em coordenadas do documento (topo absoluto + altura). Só dá para medir em
     repouso: fixo, ele não acompanha o documento. Refeito ao redimensionar e ao voltar ao repouso. */
  const measureRestBottom = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || pinRef.current !== "rest") return;
    restBottomRef.current = wrap.getBoundingClientRect().bottom + window.scrollY;
  }, []);

  /* MediaQueryList criada uma vez, acompanhada por "change"; o ResizeObserver cobre mudança de altura
     do cabeçalho (fonte, largura) e a troca de 40px para 16px de topo no breakpoint. A primeira medição também
     vem dele: o primeiro callback roda depois do layout e antes da pintura, então a montagem não lê layout. */
  useLayoutEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    isMobileRef.current = mobile.matches;
    const handleMobileChange = (event: MediaQueryListEvent) => {
      isMobileRef.current = event.matches;
      measureRestBottom();
    };
    mobile.addEventListener("change", handleMobileChange);

    const wrap = wrapRef.current;
    const observer = new ResizeObserver(measureRestBottom);
    if (wrap) observer.observe(wrap);
    window.addEventListener("resize", measureRestBottom);

    return () => {
      mobile.removeEventListener("change", handleMobileChange);
      observer.disconnect();
      window.removeEventListener("resize", measureRestBottom);
    };
  }, [measureRestBottom]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollRef.current;
    lastScrollRef.current = latest;
    const travel = travelRef.current;
    if (delta > 0) {
      travel.down += delta;
      travel.up = 0;
    } else if (delta < 0) {
      travel.up -= delta;
      travel.down = 0;
    }

    const current = pinRef.current;
    if (current === "rest") {
      const outOfView = latest - restBottomRef.current > OUT_OF_VIEW_SLACK;
      if (outOfView && travel.up > SCROLL_UP_TO_SHOW) changePin("shown");
      return;
    }

    const coincide = isMobileRef.current ? COINCIDE_MOBILE : COINCIDE_DESKTOP;
    if (latest <= coincide) {
      changePin("rest");
      return;
    }
    /* Quem navega pelo teclado dentro do cabeçalho não pode vê-lo sumir. */
    if (keyboardFocusInsideRef.current) {
      changePin("shown");
      return;
    }
    if (current === "shown" && travel.down > SCROLL_DOWN_TO_HIDE) changePin("hidden");
    else if (current === "hidden" && travel.up > SCROLL_UP_TO_SHOW) changePin("shown");
  });

  /* Animação de cada mudança de estado. Roda antes da pintura: ao fixar, o cabeçalho já nasce recolhido. */
  useLayoutEffect(() => {
    const before = previousPinRef.current;
    previousPinRef.current = pin;
    if (before === pin) return;
    /* Voltou ao repouso (absoluto): é a hora de remedir a base do cabeçalho. */
    if (pin === "rest") measureRestBottom();

    const tokens = tokensRef.current;
    const visible = pin === "shown";

    if (pin === "rest") {
      y.jump("0%");
      if (before === "hidden") {
        /* Voltou ao lugar original estando recolhido: aparece sem saltar. */
        opacity.jump(0);
        animate(opacity, 1, { duration: tokens.duration.quick, ease: tokens.ease.out });
      } else {
        opacity.jump(1);
      }
      return;
    }

    if (before === "rest") {
      y.jump(tokens.reduced ? "0%" : HIDDEN_Y);
      opacity.jump(tokens.reduced ? 0 : 1);
    }

    if (tokens.reduced) {
      y.jump("0%");
      animate(opacity, visible ? 1 : 0, {
        duration: tokens.duration.quick,
        ease: visible ? tokens.ease.out : tokens.ease.in,
      });
      return;
    }

    opacity.jump(1);
    animate(
      y,
      visible ? "0%" : HIDDEN_Y,
      visible
        ? { duration: tokens.duration.gentle, ease: tokens.ease.out }
        : { duration: tokens.duration.base, ease: tokens.ease.in },
    );
  }, [pin, y, opacity, measureRestBottom]);

  /* Publica o estado no <html> (data-header-pin): páginas com blocos sticky podem se afastar do cabeçalho fixo. */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.headerPin = pin;
    return () => {
      delete root.dataset.headerPin;
    };
  }, [pin]);

  function handleFocus(event: FocusEvent<HTMLElement>) {
    if (!event.target.matches(":focus-visible")) return;
    keyboardFocusInsideRef.current = true;
    if (pinRef.current === "hidden") changePin("shown");
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) keyboardFocusInsideRef.current = false;
  }

  /* <header> no nível da página = marco "banner". */
  return (
    <motion.header
      ref={wrapRef}
      className={styles.wrap}
      data-pin={pin}
      style={{ y, opacity }}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      {children}
    </motion.header>
  );
}
