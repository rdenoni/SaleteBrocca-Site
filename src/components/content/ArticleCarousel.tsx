"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Stagger } from "@/motion/Stagger";
import styles from "./ArticleCarousel.module.css";

interface ArticleCarouselProps {
  /** Os <StaggerItem as="li"> com os cards. */
  children: ReactNode;
  label: string;
  delay?: number;
}

interface Pages {
  current: number;
  total: number;
  atStart: boolean;
  atEnd: boolean;
}

/* Carrossel no estilo do Instagram: uma linha (3 cards no desktop, 2 no tablet, 1 no celular), setas para frente e
   para trás e pontos que mostram a página. A rolagem é nativa (scroll-snap): arrastar com o dedo funciona e o foco do
   teclado leva o card até a vista. As setas andam uma página; nas pontas, a seta daquele lado some. */
export function ArticleCarousel({ children, label, delay = 0 }: ArticleCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Pages>({ current: 0, total: 1, atStart: true, atEnd: false });

  /* Largura de um passo (card + espaço) e quantos cards cabem: lidos do layout, que muda por breakpoint no CSS. */
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const items = viewport?.querySelectorAll<HTMLElement>("li");
    if (!viewport || !items || items.length === 0) return null;
    const step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : items[0].offsetWidth;
    const perView = Math.max(1, Math.round(viewport.clientWidth / step));
    return { viewport, step, perView, count: items.length };
  }, []);

  const sync = useCallback(() => {
    const m = measure();
    if (!m) return;
    const { viewport, step, perView, count } = m;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 2;
    const atEnd = viewport.scrollLeft >= max - 2;
    const total = Math.ceil(count / perView);
    const current = atEnd ? total - 1 : Math.min(total - 1, Math.round(viewport.scrollLeft / (step * perView)));
    setPages((prev) =>
      prev.current === current && prev.total === total && prev.atStart === atStart && prev.atEnd === atEnd
        ? prev
        : { current, total, atStart, atEnd },
    );
  }, [measure]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    sync();
    viewport.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(viewport);
    return () => {
      viewport.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  function goToPage(page: number) {
    const m = measure();
    if (!m) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    m.viewport.scrollTo({ left: page * m.perView * m.step, behavior: reduced ? "auto" : "smooth" });
  }

  const hasPages = pages.total > 1;

  return (
    <div className={styles.root} role="region" aria-roledescription="carrossel" aria-label={label}>
      <div ref={viewportRef} className={styles.viewport}>
        <Stagger as="ul" pace="cards" delay={delay} className={styles.track}>
          {children}
        </Stagger>
      </div>

      {hasPages && (
        <>
          <button
            type="button"
            className={styles.arrow}
            data-side="prev"
            aria-label="Artigos anteriores"
            disabled={pages.atStart}
            onClick={() => goToPage(pages.current - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.arrow}
            data-side="next"
            aria-label="Próximos artigos"
            disabled={pages.atEnd}
            onClick={() => goToPage(pages.current + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <div className={styles.dots}>
            {Array.from({ length: pages.total }, (_, page) => (
              <button
                key={page}
                type="button"
                className={styles.dot}
                aria-label={`Ir para a página ${page + 1} de ${pages.total}`}
                aria-current={page === pages.current ? "true" : undefined}
                onClick={() => goToPage(page)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
