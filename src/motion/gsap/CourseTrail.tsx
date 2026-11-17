"use client";

import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { getCourse } from "@/lib/content/courses";
import { useMotionTokens, type ResolvedMotionTokens } from "../useMotionTokens";
import { GSAP_CONDITIONS } from "./gsapConditions";
import type { TrailHandle, TrailParts } from "./courseTrailEngine";
import styles from "./CourseTrail.module.css";

/* Por que GSAP aqui: scrub (a faixa corre na horizontal conforme ela mesma atravessa a tela na vertical).
   Sem pin e sem snap: a seção rola com a página, compacta, e não acrescenta rolagem extra.
   O Motion não tem equivalente direto para um x guiado pelo scroll com suavização.

   Estados:
   - ≥ 768px com movimento completo: módulos correm na horizontal enquanto a faixa passa pela tela.
     O GSAP (e o ScrollTrigger) só é carregado e ligado quando a seção chega perto da tela (uma tela de folga):
     nada de medir layout nem de ouvir scroll na montagem da página.
   - < 768px, ou movimento reduzido (sistema): lista vertical, tudo visível;
     no celular com movimento completo, entradas simples ao rolar (Motion + IntersectionObserver, sem GSAP).
   O motor GSAP vive em courseTrailEngine.ts, dentro de um gsap.context: desmontar (troca de página, strict mode,
   "Rever") reverte tudo. */

/* Folga de uma tela acima e abaixo: a trilha liga antes de aparecer, então a troca de layout acontece fora da vista. */
const LOOKAHEAD_MARGIN = "100% 0px 100% 0px";
/* Folga depois da entrada da página (duration.gentle) antes de medir a trilha. */
const SETTLE_MARGIN_MS = 150;
/* Entrada no celular: cada card dispara quando o topo passa de 90% da altura da tela. */
const ENTRANCE_MARGIN = "0px 0px -10% 0px";

/* Os módulos vêm do conteúdo oficial do site (src/lib/content/courses.ts), nunca de texto próprio.
   O código do cartão é "M" + número com dois dígitos (M00, M01…); "Começa em" é a primeira aula do módulo. */
const FEATURED_COURSE_SLUG = "dificuldades-na-aprendizagem";

interface TrailModule {
  code: string;
  title: string;
  lessonCount: number;
  firstLesson: string;
}

const featuredCourse = getCourse(FEATURED_COURSE_SLUG);
const TRAIL_MODULES: readonly TrailModule[] = (featuredCourse?.modules ?? []).map((module) => ({
  code: `M${String(module.number).padStart(2, "0")}`,
  title: module.title,
  lessonCount: module.lessons.length,
  firstLesson: module.lessons[0]?.title ?? "",
}));

function lessonLabel(count: number): string {
  return count === 1 ? "1 aula" : `${count} aulas`;
}

/* Celular: lista vertical com entradas simples (sobe e aparece, uma vez). Devolve a limpeza. */
function armMobileEntrances(cards: HTMLElement[], t: ResolvedMotionTokens): () => void {
  const running: { stop: () => void }[] = [];
  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = `translateY(${t.distance.base}px)`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      /* Os que entram juntos sobem em sequência (stagger.items). */
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, index) => {
          const card = entry.target as HTMLElement;
          observer.unobserve(card);
          const controls = animate(
            card,
            { opacity: [0, 1], y: [t.distance.base, 0] },
            { duration: t.duration.gentle, ease: [...t.ease.out], delay: index * t.stagger.items },
          );
          running.push(controls);
          /* A animação termina no estado final natural do card: o estilo de "escondido" sai de vez. */
          void controls.finished.then(() => {
            card.style.opacity = "";
            card.style.transform = "";
          });
        });
    },
    { rootMargin: ENTRANCE_MARGIN },
  );
  cards.forEach((card) => observer.observe(card));

  return () => {
    observer.disconnect();
    running.forEach((controls) => controls.stop());
    cards.forEach((card) => {
      card.style.opacity = "";
      card.style.transform = "";
    });
  };
}

/* Fontes e a entrada da página mudam as medidas logo depois da montagem. A trilha só mede depois
   disso, uma vez: nenhum refresh posterior (que cortaria uma rolagem suave em andamento). */
async function whenLayoutSettled(settleMs: number): Promise<void> {
  if (document.fonts && document.fonts.status !== "loaded") await document.fonts.ready;
  const remaining = settleMs - performance.now();
  if (remaining > 0) await new Promise<void>((resolve) => window.setTimeout(resolve, remaining));
}

/* Âncora da URL (/home#frase-conceito) que fica DEPOIS da trilha. Com ela, a trilha liga já na montagem: a rolagem
   até o destino é calculada sobre o layout final (trocar a grade/lista pela faixa compacta muda a altura do que vem abaixo). */
function hashTargetAfter(root: HTMLElement): HTMLElement | null {
  const hash = window.location.hash;
  if (hash.length < 2) return null;
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  const target = document.getElementById(id);
  if (!target || target === root || root.contains(target)) return null;
  return root.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING ? target : null;
}

/* Desktop: carrega o motor GSAP quando a seção chega perto da tela (ou já ficou para trás: página aberta
   rolada para baixo, âncora, scroll restaurado). Devolve a limpeza. */
function armDesktopTrail(
  parts: TrailParts,
  handleRef: { current: TrailHandle | null },
  settleMs: number,
): () => void {
  let cancelled = false;
  let observer: IntersectionObserver | null = null;
  const entryHash = window.location.hash;
  const entryTarget = hashTargetAfter(parts.root);

  const start = async () => {
    const [{ startCourseTrail }] = await Promise.all([import("./courseTrailEngine"), whenLayoutSettled(settleMs)]);
    if (cancelled) return;
    /* Se a seção já ficou acima da tela, trocar a lista pela faixa compacta puxa o que está abaixo:
       o que o usuário vê é recolocado com a diferença de altura do documento. */
    const passed = parts.root.getBoundingClientRect().bottom < 0;
    const heightBefore = document.documentElement.scrollHeight;
    const scrollBefore = window.scrollY;
    handleRef.current = startCourseTrail(parts);
    if (passed) {
      /* Posição absoluta (não scrollBy): o refresh do ScrollTrigger mexe na rolagem durante a criação. */
      const shift = document.documentElement.scrollHeight - heightBefore;
      if (shift !== 0) window.scrollTo({ top: scrollBefore + shift, behavior: "instant" });
    }
    /* Chegou por âncora depois da trilha: o refresh do ScrollTrigger corta a rolagem suave em andamento. Retoma
       o caminho uma vez (e só se a URL ainda é a de entrada: nunca briga com uma navegação posterior). */
    if (entryTarget && entryHash === window.location.hash) entryTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  observer = new IntersectionObserver(
    (entries) => {
      const latest = entries[entries.length - 1];
      if (!latest || !(latest.isIntersecting || latest.boundingClientRect.bottom < 0)) return;
      observer?.disconnect();
      void start();
    },
    { rootMargin: LOOKAHEAD_MARGIN },
  );
  if (entryTarget) {
    observer.disconnect();
    void start();
  } else {
    observer.observe(parts.root);
  }

  return () => {
    cancelled = true;
    observer?.disconnect();
    handleRef.current?.stop();
    handleRef.current = null;
  };
}

export interface CourseTrailProps {
  /** Nível do título de cada módulo. Padrão "h3"; use "h4" quando a seção já tem um h3 acima. */
  cardHeadingLevel?: "h3" | "h4";
  /** Id de um título que nomeia a seção. Se informado, substitui o aria-label padrão. */
  labelledBy?: string;
}

export function CourseTrail({ cardHeadingLevel = "h3", labelledBy }: CourseTrailProps = {}) {
  const CardHeading = cardHeadingLevel;
  const t = useMotionTokens();
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const handleRef = useRef<TrailHandle | null>(null);

  /* O efeito lê a versão atual dos tokens daqui, sem recriar a trilha. */
  const tokensRef = useRef(t);
  tokensRef.current = t;

  /* A largura (768px) é decidida aqui, com matchMedia nativo, antes de carregar qualquer GSAP. */
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    /* Movimento reduzido: nada é fixado, escondido ou animado. */
    if (t.reduced || !root || !panel || !viewport || !track) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
    const parts: TrailParts = { root, panel, viewport, track, cards };
    const wide = window.matchMedia(GSAP_CONDITIONS.wide);
    let teardown: (() => void) | null = null;

    const arm = () => {
      teardown?.();
      teardown = wide.matches
        ? armDesktopTrail(parts, handleRef, tokensRef.current.duration.gentle * 1000 + SETTLE_MARGIN_MS)
        : armMobileEntrances(cards, tokensRef.current);
    };
    arm();
    wide.addEventListener("change", arm);

    return () => {
      wide.removeEventListener("change", arm);
      teardown?.();
      teardown = null;
    };
  }, [t.reduced]);

  return (
    <section
      ref={rootRef}
      className={styles.root}
      aria-label={labelledBy ? undefined : `Trilha do curso: ${TRAIL_MODULES.length} módulos`}
      aria-labelledby={labelledBy}
    >
      <div ref={panelRef} className={styles.panel}>
        <div ref={viewportRef} className={styles.viewport}>
          <ol ref={trackRef} className={styles.track}>
            {TRAIL_MODULES.map((module) => (
              <li key={module.code} className={styles.card} data-card="">
                <span className={styles.code}>{module.code}</span>
                <CardHeading className={styles.title} data-card-title="">
                  {module.title}
                </CardHeading>
                <span className={styles.count} data-card-count="">
                  {lessonLabel(module.lessonCount)}
                </span>
                <span className={styles.rule} data-card-rule="" aria-hidden="true" />
                <p className={styles.first}>Começa em: {module.firstLesson}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
