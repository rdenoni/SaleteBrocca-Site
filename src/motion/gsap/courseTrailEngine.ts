import { distance, duration, stagger } from "../tokens";
import { gsap, ScrollTrigger } from "./registerGsap";
import { gsapEase } from "./useGsapMotion";

/* Motor GSAP da trilha do curso (desktop com movimento completo). Carregado sob demanda pelo CourseTrail
   (import dinâmico): no celular, com movimento reduzido ou longe da seção, o GSAP e o ScrollTrigger nem entram
   na página. Tudo nasce dentro de um gsap.context com escopo no <section>: parar() reverte tudo
   (troca de página, strict mode, "Rever", troca de largura). */

export interface TrailParts {
  root: HTMLElement;
  panel: HTMLElement;
  viewport: HTMLElement;
  track: HTMLElement;
  cards: HTMLElement[];
}

export interface TrailHandle {
  /** Reverte os gatilhos e os estilos que a trilha gravou. */
  stop: () => void;
}

export function startCourseTrail(parts: TrailParts): TrailHandle {
  const { root, panel, viewport, track, cards } = parts;

  const context = gsap.context(() => {
    const travel = () => Math.max(track.scrollWidth - viewport.clientWidth, 0);

    /* Medidas lidas só no refresh (nunca a cada quadro): percurso da trilha e centro de cada card dentro do track. */
    let travelMax = 0;
    let viewHalf = 0;
    let centers: number[] = [];
    const measure = () => {
      travelMax = travel();
      viewHalf = viewport.clientWidth / 2;
      centers = cards.map((card) => card.offsetLeft + card.offsetWidth / 2);
    };

    /* O modo da trilha muda o layout (lista vira faixa horizontal): só depois dele as medidas valem. */
    root.dataset.mode = "trail";
    measure();

    /* Destaque de cada card: título sobe, contagem aparece e o traço ciano se completa.
       Saída mais curta que a entrada (reverse acelerado). */
    const timelines = cards.map((card) => {
      const title = card.querySelector("[data-card-title]");
      const count = card.querySelector("[data-card-count]");
      const rule = card.querySelector("[data-card-rule]");
      if (!title || !count || !rule) return null;
      return gsap
        .timeline({ paused: true })
        .fromTo(
          title,
          { y: distance.small, opacity: 0.6 },
          { y: 0, opacity: 1, duration: duration.base, ease: gsapEase.out },
          0,
        )
        .fromTo(
          count,
          { scale: 0.9, opacity: 0.6 },
          { scale: 1, opacity: 1, duration: duration.base, ease: gsapEase.out },
          stagger.items,
        )
        .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: duration.gentle, ease: gsapEase.stroke }, 0);
    });

    /* Sem pin e sem snap, o destaque vai para o card mais perto do centro da tela (não há mais um instante
       em que um card "para" no centro). Se a trilha cabe inteira na tela, todos ficam destacados. */
    const ALL = -2;
    let active = -1;
    const setActive = (next: number) => {
      if (next === active) return;
      if (active === ALL) timelines.forEach((tl) => tl?.timeScale(1.6).reverse());
      else timelines[active]?.timeScale(1.6).reverse();
      if (next === ALL) timelines.forEach((tl) => tl?.timeScale(1).play());
      else timelines[next]?.timeScale(1).play();
      active = next;
    };
    const updateActive = () => {
      if (travelMax <= 0) return setActive(ALL);
      const x = gsap.getProperty(track, "x") as number;
      let nearest = 0;
      let best = Infinity;
      centers.forEach((center, index) => {
        const gap = Math.abs(center + x - viewHalf);
        if (gap < best) {
          best = gap;
          nearest = index;
        }
      });
      setActive(nearest);
    };

    /* Sem pin: a faixa corre na horizontal conforme o scroll avança e volta (scrub bidirecional). */
    gsap.to(track, {
      x: () => -travel(),
      ease: "none",
      /* Sem barra de progresso (o cliente pediu para tirar a linha): o scroll só move a faixa e o destaque. */
      onUpdate: updateActive,
      scrollTrigger: {
        trigger: panel,
        /* Termina com a faixa ainda inteira na tela (base a 40% da altura): o último módulo aparece por completo
           enquanto dá para lê-lo, e não só quando a faixa já está saindo pelo topo. */
        start: "top 90%",
        end: "bottom 40%",
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure();
          updateActive();
        },
        /* A camada do track só é promovida (will-change) enquanto a faixa está na tela. */
        onToggle: (self) => {
          track.style.willChange = self.isActive ? "transform" : "";
        },
      },
    });
    updateActive();

    return () => {
      delete root.dataset.mode;
      track.style.willChange = "";
    };
  }, root);
  /* Refaz as medidas já na criação: quem chama confere a altura do documento logo em seguida (compensação de rolagem). */
  ScrollTrigger.refresh();

  return {
    stop: () => {
      context.revert();
    },
  };
}
