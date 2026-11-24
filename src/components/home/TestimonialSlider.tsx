"use client";

import { AnimatePresence, motion, stagger as staggerChildren, useInView, type PanInfo, type Variants } from "motion/react";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type AnimationEvent, type FocusEvent, type KeyboardEvent } from "react";
import { useMotionTokens, type ResolvedMotionTokens } from "@/motion/useMotionTokens";
import type { Testimonial } from "@/types/content";
import styles from "./TestimonialSlider.module.css";

interface TestimonialSliderProps {
  /** Depoimentos reais (src/lib/content/testimonials). Um só vira uma citação com a entrada animada, sem controles. */
  items: readonly Testimonial[];
  /** Atraso (s) da primeira entrada, para esperar o recorte da coluna começar a abrir. */
  delay?: number;
  /** Nome do carrossel para leitores de tela (só usado com mais de um depoimento). */
  label?: string;
  /** Etiqueta exibida nos depoimentos simulados (`simulated`). */
  simulatedLabel?: string;
  /** Nota de uma linha perto dos controles (ex.: avisar que alguns itens são simulados). */
  note?: string;
  /** Libera a entrada de fora (ex.: quando o contêiner, recortado por clip-path, já está na tela).
      Sem isso, o próprio componente observa a viewport. Um IntersectionObserver não enxerga dentro de um recorte fechado. */
  play?: boolean;
}

type Direction = 1 | -1;

const OPEN = "inset(0% 0% 0% 0%)";
const FROM_BELOW = "inset(100% 0% 0% 0%)";
const FROM_RIGHT = "inset(0% 0% 0% 100%)";
const FROM_LEFT = "inset(0% 100% 0% 0%)";
/* Foto do avatar: desvela de cima para baixo, como as outras fotos do site (o círculo vem do raio do CSS). */
const PHOTO_CLOSED = "inset(0% 0% 100% 0%)";
/* Gesto de arrastar: passou desta distância (px) ou desta velocidade (px/s), troca de depoimento. */
const SWIPE_OFFSET = 60;
const SWIPE_VELOCITY = 500;
/* Tempo de cada depoimento no autoplay (ms). Também é a duração do preenchimento do ponto ativo. */
const AUTOPLAY_MS = 10000;

/* Variantes dos pedaços de um depoimento. Estados: enter (antes de entrar) → center (visível) → exit.
   Direção: +1 = próximo (o texto atual sai para a esquerda e o novo chega da direita); -1 = anterior (o contrário).
   Na primeira exibição (`rise`), o texto sobe de baixo, como na entrada original da seção.
   Reduzido: só opacidade; transform e recorte ficam neutros nos dois estados (podem ter hidratado com o
   movimento completo, então são zerados com duração 0). */
function buildVariants(t: ResolvedMotionTokens, startDelay: number, rise: boolean) {
  const gap = t.reduced ? 0 : t.stagger.cards;
  const instantStill = { x: { duration: 0 }, y: { duration: 0 }, scale: { duration: 0 }, clipPath: { duration: 0 } };
  const fadeIn = { duration: t.duration.quick, ...instantStill };

  const root: Variants = {
    enter: {},
    center: { transition: { delayChildren: staggerChildren(gap, { startDelay: t.reduced ? 0 : startDelay }) } },
    exit: {},
  };

  /* Aspas: se encaixam (spring.fit), cada uma vindo do lado de fora para o lugar. */
  const mark = (side: 1 | -1): Variants =>
    t.reduced
      ? {
          enter: { opacity: 0, scale: 1, x: 0, transition: fadeIn },
          center: { opacity: 1, scale: 1, x: 0, transition: fadeIn },
          exit: { opacity: 0, scale: 1, x: 0, transition: fadeIn },
        }
      : {
          enter: { opacity: 0, scale: 0.8, x: side * t.distance.small },
          center: { opacity: 1, scale: 1, x: 0, transition: { ...t.spring.fit, opacity: { duration: t.duration.base, ease: t.ease.out } } },
          exit: { opacity: 0, scale: 0.9, x: 0, transition: { duration: t.duration.quick, ease: t.ease.in } },
        };

  /* Texto: entra por uma máscara que se abre do lado de onde ele vem; sai fechando a máscara para o lado da saída,
     deslocando poucos px e esmaecendo. */
  const quote: Variants = t.reduced
    ? {
        enter: { opacity: 0, x: 0, y: 0, clipPath: OPEN, transition: fadeIn },
        center: { opacity: 1, x: 0, y: 0, clipPath: OPEN, transition: fadeIn },
        exit: { opacity: 0, x: 0, y: 0, clipPath: OPEN, transition: fadeIn },
      }
    : {
        enter: (direction: Direction) =>
          rise
            ? { opacity: 0, x: 0, y: t.distance.base, clipPath: FROM_BELOW }
            : { opacity: 0, x: direction * t.distance.base, y: 0, clipPath: direction > 0 ? FROM_RIGHT : FROM_LEFT },
        center: {
          opacity: 1,
          x: 0,
          y: 0,
          clipPath: OPEN,
          transition: { duration: t.duration.slow, ease: t.ease.out },
        },
        exit: (direction: Direction) => ({
          opacity: 0,
          x: -direction * t.distance.small,
          y: 0,
          clipPath: direction > 0 ? FROM_LEFT : FROM_RIGHT,
          transition: { duration: t.duration.base, ease: t.ease.in },
        }),
      };

  /* Avatar: o anel aparece e a imagem (foto ou iniciais) se desvela de cima para baixo. */
  const ring: Variants = {
    enter: { opacity: 0, transition: { duration: t.duration.quick } },
    center: { opacity: 1, transition: { duration: t.duration.base, ease: t.ease.out } },
    exit: { opacity: 0, transition: { duration: t.duration.quick, ease: t.ease.in } },
  };
  const photo: Variants = t.reduced
    ? {
        enter: { opacity: 0, clipPath: "none", transition: fadeIn },
        center: { opacity: 1, clipPath: "none", transition: fadeIn },
        exit: { opacity: 0, clipPath: "none", transition: fadeIn },
      }
    : {
        enter: { opacity: 0, clipPath: PHOTO_CLOSED },
        center: {
          opacity: 1,
          clipPath: OPEN,
          transition: { duration: t.duration.slow, ease: t.ease.stroke, opacity: { duration: t.duration.base } },
        },
        exit: { opacity: 0, clipPath: PHOTO_CLOSED, transition: { duration: t.duration.base, ease: t.ease.in } },
      };

  /* Nome, função e etiqueta: só aparecem (fade). */
  const fade: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: t.duration.gentle, ease: t.ease.out } },
    exit: { opacity: 0, transition: { duration: t.duration.quick, ease: t.ease.in } },
  };

  return { root, markOpen: mark(-1), markClose: mark(1), quote, ring, photo, fade };
}

function Avatar({ item }: { item: Testimonial }) {
  if (item.photo) return <Image src={item.photo} alt="" width={128} height={128} className={styles.photo} />;
  return (
    <span className={styles.initials} data-tone={item.avatarTone ?? "cyan"}>
      {item.initials}
    </span>
  );
}

interface SlideProps {
  item: Testimonial;
  direction: Direction;
  active: boolean;
  startDelay: number;
  rise: boolean;
  simulatedLabel: string;
  group?: { index: number; total: number };
  onSwipe?: (direction: Direction) => void;
}

function Slide({ item, direction, active, startDelay, rise, simulatedLabel, group, onSwipe }: SlideProps) {
  const t = useMotionTokens();
  const v = buildVariants(t, startDelay, rise);
  const groupProps = group
    ? { role: "group", "aria-roledescription": "slide", "aria-label": `${group.index + 1} de ${group.total}` }
    : {};

  /* Arrastar para a esquerda = próximo; para a direita = anterior. A tela rola na vertical normalmente. */
  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (!onSwipe) return;
    const farEnough = Math.abs(info.offset.x) > SWIPE_OFFSET || Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (!farEnough || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    onSwipe(info.offset.x < 0 ? 1 : -1);
  }
  const dragProps = onSwipe
    ? {
        drag: "x" as const,
        dragConstraints: { left: 0, right: 0 },
        dragElastic: 0.18,
        dragSnapToOrigin: true,
        onDragEnd: handleDragEnd,
      }
    : {};

  return (
    <motion.div
      className={styles.slide}
      data-swipe={onSwipe ? "" : undefined}
      initial="enter"
      animate={active ? "center" : "enter"}
      exit="exit"
      custom={direction}
      variants={v.root}
      {...groupProps}
      {...dragProps}
    >
      <figure className={styles.figure}>
        <div className={styles.quoteWrap}>
          {/* Aspas decorativas, como no site: azul translúcido (a opacidade 0,55 fica no glifo, não no wrapper animado). */}
          <motion.span className={styles.markOpen} aria-hidden="true" data-reveal="" variants={v.markOpen}>
            <span className={styles.glyph}>{"“"}</span>
          </motion.span>
          <motion.div className={styles.quoteMask} data-reveal="" custom={direction} variants={v.quote}>
            <blockquote className={styles.quote}>
              <p>{item.quote}</p>
            </blockquote>
          </motion.div>
          <motion.span className={styles.markClose} aria-hidden="true" data-reveal="" variants={v.markClose}>
            <span className={styles.glyph}>{"”"}</span>
          </motion.span>
        </div>
        <figcaption className={styles.author}>
          <motion.span className={styles.ring} data-reveal="" variants={v.ring}>
            <motion.span className={styles.photoClip} data-reveal="" variants={v.photo}>
              <Avatar item={item} />
            </motion.span>
          </motion.span>
          <motion.span className={styles.who} data-reveal="" variants={v.fade}>
            <span className={styles.name}>{item.author}</span>
            <span className={styles.role}>{item.role}</span>
            {item.simulated ? <span className={styles.tag}>{simulatedLabel}</span> : null}
          </motion.span>
        </figcaption>
      </figure>
    </motion.div>
  );
}

/* Cópia estática e invisível de um depoimento: ocupa a mesma célula da grade do palco, então a altura do palco é
   sempre a do MAIOR depoimento e a coluna navy não pula na troca. Sem motion, sem data-reveal, fora do foco e dos leitores. */
function Ghost({ item, simulatedLabel }: { item: Testimonial; simulatedLabel: string }) {
  return (
    <div className={styles.ghost} aria-hidden="true" inert>
      <figure className={styles.figure}>
        <div className={styles.quoteWrap}>
          <blockquote className={styles.quote}>
            <p>{item.quote}</p>
          </blockquote>
        </div>
        <figcaption className={styles.author}>
          <span className={styles.ring} />
          <span className={styles.who}>
            <span className={styles.name}>{item.author}</span>
            <span className={styles.role}>{item.role}</span>
            {item.simulated ? <span className={styles.tag}>{simulatedLabel}</span> : null}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

interface StageProps {
  items: readonly Testimonial[];
  delay: number;
  label: string;
  simulatedLabel: string;
  note?: string;
  play?: boolean;
}

/* Um depoimento só (o caso de hoje): uma citação com a coreografia de entrada (aspas se encaixam, texto sobe,
   avatar em círculo, nome aparece) e mais nada. Sem controles, sem autoplay, sem região viva, sem gestos de troca,
   sem observadores de ponteiro ou de aba: não há o que alternar, então nada disso existe. */
function SingleTestimonial({
  item,
  delay,
  simulatedLabel,
  play,
}: {
  item: Testimonial;
  delay: number;
  simulatedLabel: string;
  play?: boolean;
}) {
  const t = useMotionTokens();
  const stageRef = useRef<HTMLDivElement>(null);
  const seen = useInView(stageRef, { once: true, margin: t.viewport.margin });

  return (
    <div className={styles.root}>
      <div ref={stageRef} className={styles.stage}>
        <Slide item={item} direction={1} active={play ?? seen} startDelay={delay} rise simulatedLabel={simulatedLabel} />
      </div>
    </div>
  );
}

/* Carrossel (2 ou mais depoimentos). Troca sozinho a cada AUTOPLAY_MS e volta ao primeiro no fim.
   Região "carrossel" (foco no contêiner, setas ← → do teclado), pontos com indicador que desliza e preenchimento do
   tempo, botão de pausa (WCAG 2.2.2), arrastar com o dedo e anúncio polite SÓ quando a pessoa troca ou pausa
   (no autoplay a região fica aria-live="off"). Pausa também com o ponteiro em cima, com o foco do teclado dentro,
   com a aba em segundo plano e com o carrossel fora da tela.
   O relógio é a própria animação CSS do preenchimento (scaleX): ao terminar (animationend) avança. Assim barra e
   troca nunca saem de sincronia, e pausar a animação pausa o relógio. */
function TestimonialCarousel({ items, delay, label, simulatedLabel, note, play }: StageProps) {
  const t = useMotionTokens();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dotId = useId();
  const seen = useInView(stageRef, { once: true, margin: t.viewport.margin });
  const onScreen = useInView(rootRef);
  const inView = play ?? seen;
  const [state, setState] = useState<{ index: number; direction: Direction; touched: boolean; manual: boolean; cycle: number }>({
    index: 0,
    direction: 1,
    touched: false,
    manual: false,
    cycle: 0,
  });
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  /* Aba em segundo plano: não troca de depoimento sem ninguém olhando. */
  useEffect(() => {
    const sync = () => setTabHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const total = items.length;
  const current = items[state.index] ?? items[0];
  const paused = userPaused || hovered || focused || tabHidden || !onScreen;

  /* `cycle` muda a cada troca (até para o mesmo índice) e reinicia a contagem dos 10 s. */
  function goTo(index: number, direction: Direction, manual = true) {
    setState((prev) => ({ index: (index + total) % total, direction, touched: true, manual, cycle: prev.cycle + 1 }));
  }
  const goNext = () => goTo(state.index + 1, 1);
  const goPrev = () => goTo(state.index - 1, -1);

  /* Com movimento reduzido o globals.css força animation-duration: 0ms (!important) e o animationend dispararia
     em cada remontagem: o carrossel giraria sem parar. elapsedTime 0 = relógio zerado, então não avança sozinho. */
  function handleProgressEnd(event: AnimationEvent<HTMLSpanElement>) {
    if (event.target === event.currentTarget && event.elapsedTime > 0) goTo(state.index + 1, 1, false);
  }

  /* Só foco por teclado pausa: clicar num ponto com o mouse não deve travar o autoplay para sempre. */
  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    if (event.target.matches(":focus-visible")) setFocused(true);
  }
  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  }

  const spring = t.reduced ? { duration: 0 } : t.spring.ui;
  const announcement = state.manual
    ? `Depoimento ${state.index + 1} de ${total}. ${current.simulated ? `${simulatedLabel}. ` : ""}${current.quote} ${current.author}, ${current.role}.`
    : "";

  return (
    <div
      ref={rootRef}
      className={styles.root}
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div ref={stageRef} className={styles.stage}>
        {/* Todos os depoimentos como cópias invisíveis na mesma célula: reservam a altura do maior. */}
        {items.map((item, index) => (
          <Ghost key={item.author + index} item={item} simulatedLabel={simulatedLabel} />
        ))}
        <AnimatePresence mode="wait" initial custom={state.direction}>
          <Slide
            key={state.index}
            item={current}
            direction={state.direction}
            active={inView}
            startDelay={state.touched ? 0 : delay}
            rise={!state.touched}
            simulatedLabel={simulatedLabel}
            group={{ index: state.index, total }}
            onSwipe={(direction) => goTo(state.index + direction, direction)}
          />
        </AnimatePresence>
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {items.map((item, index) => {
            const selected = index === state.index;
            return (
              <button
                key={item.author + index}
                type="button"
                className={styles.dot}
                aria-label={`Ir para o depoimento ${index + 1} de ${total}`}
                aria-current={selected ? "true" : undefined}
                onClick={() => goTo(index, index > state.index ? 1 : -1)}
              >
                {selected ? <motion.span layoutId={`${dotId}-ativo`} className={styles.dotActive} transition={spring} /> : null}
                {selected ? (
                  <span
                    key={`${state.index}-${state.cycle}`}
                    className={styles.progress}
                    data-paused={paused ? "" : undefined}
                    data-reduced={t.reduced ? "" : undefined}
                    style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                    onAnimationEnd={handleProgressEnd}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        {/* Com movimento reduzido nada roda sozinho, então não há o que pausar. */}
        {t.reduced ? null : (
          <button
            type="button"
            className={styles.pause}
            aria-label={userPaused ? "Retomar depoimentos" : "Pausar depoimentos"}
            aria-pressed={userPaused}
            onClick={() => setUserPaused((value) => !value)}
          >
            {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
        )}
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
      {/* Anúncio só depois de uma troca feita pela pessoa (nunca na carga da página nem no autoplay). */}
      <div className="visually-hidden" aria-live={state.manual || userPaused ? "polite" : "off"} aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}

/* Um depoimento: citação com entrada animada. Dois ou mais: carrossel. Nenhum: nada. */
export function TestimonialSlider({
  items,
  delay = 0,
  label = "Depoimentos",
  simulatedLabel = "Depoimento simulado",
  note,
  play,
}: TestimonialSliderProps) {
  if (items.length === 0) return null;
  if (items.length === 1) {
    return <SingleTestimonial item={items[0]} delay={delay} simulatedLabel={simulatedLabel} play={play} />;
  }
  return (
    <TestimonialCarousel items={items} delay={delay} label={label} simulatedLabel={simulatedLabel} note={note} play={play} />
  );
}
