"use client";

import {
  animate,
  motion,
  stagger as staggerChildren,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BLUE_PIECE, CYAN_PIECE, SYMBOL_STROKE, SYMBOL_VIEWBOX } from "@/motion/BrandSymbol";
import { DrawRule } from "@/motion/DrawRule";
import { MotionButton } from "@/motion/MotionButton";
import { StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { useScrollWillChange } from "@/motion/useScrollWillChange";
import { HOME_CONCEPT as CONCEPT, HOME_SECTION_IDS } from "@/lib/content/home";
import styles from "./FraseConceito.module.css";

/* Peças afastadas (unidades do desenho do símbolo, 360 de largura) e giro inicial de cada uma. */
const APART = { x: 150, y: 110, rotate: 22 };
/* Cada peça é uma camada HTML própria (um <svg> com um só traço), então o transform é composto na GPU em vez de
   repintar o SVG a cada quadro. Os deslocamentos viram % da caixa da peça (que tem o tamanho do símbolo, 360
   unidades), sem medir nada: 150 unidades = 150/360 da largura. */
const SYMBOL_SIZE = 360;
const SYMBOL_ORIGIN = 70;
const toPercent = (units: number): number => (units / SYMBOL_SIZE) * 100;
const APART_PERCENT = { x: toPercent(APART.x), y: toPercent(APART.y) };
/* Centro de cada traço (caixa do desenho, sem a espessura) em frações da caixa: é em torno dele que a peça gira,
   como antes (o SVG girava cada path pelo centro do próprio desenho). Ciano: x 128–318, y 114–302.
   Azul: x 182–372, y 198–386. */
const toOrigin = (center: number): number => (center - SYMBOL_ORIGIN) / SYMBOL_SIZE;
const CYAN_ORIGIN = { originX: toOrigin(223), originY: toOrigin(208) };
const BLUE_ORIGIN = { originX: toOrigin(277), originY: toOrigin(292) };
/* Janela do scroll (progresso 0–1 da seção) em que as peças se encaixam, e o ponto em que a frase começa a abrir. */
const FIT_START = 0.04;
const FIT_END = 0.78;
const QUOTE_START = 0.3;
/* O encaixe "assenta": um leve ressalto de escala quando as peças terminam de se juntar. */
const FIT_DONE = 0.01;
const FIT_UNDONE = 0.06;
const SETTLE_SCALE = 1.035;
/* Flutuação depois do encaixe: sobe poucas unidades e volta. Limitada a ~5 s por vez que a seção está na tela
   (MOTION-SYSTEM §7: nenhuma animação automática passa de 5 s nem repete sem controle do usuário). */
const FLOAT_RISE = toPercent(7);
const FLOAT_CYCLE_FACTOR = 1.7;
const FLOAT_BUDGET_SECONDS = 4.8;

/* Segue o scroll como o resto do sistema: valores ligados ao scroll passam por motion values.
   Começa com a seção já 25% dentro da tela (topo a 75% da altura), não no instante em que ela encosta no pé da tela:
   antes o encaixe e a frase já tinham andado quando a seção mal aparecia (pedido do cliente: "começando cedo demais").
   Termina com o centro da seção um pouco acima do meio da tela. */
const SCROLL_OFFSET: ["start 0.75", "center 0.45"] = ["start 0.75", "center 0.45"];

/* Frase-conceito do Manual da Marca antes do rodapé, em light-blue (o rodapé já é navy).
   As duas peças do símbolo começam desmontadas e se encaixam (o encaixe) conforme a seção atravessa a tela;
   a frase se escreve palavra por palavra enquanto elas se juntam e a régua ciano se desenha (o traço).
   Movimento reduzido: peças já encaixadas, sem flutuar; a frase só aparece (opacidade). */
export function FraseConceito() {
  const t = useMotionTokens();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const seen = useInView(sectionRef, { once: true, margin: t.viewport.margin });
  const [started, setStarted] = useState(false);
  const [fitted, setFitted] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: SCROLL_OFFSET });
  const progress = useSpring(scrollYProgress, t.follow);
  /* 1 = peças afastadas, 0 = encaixadas. */
  const apart = useTransform(progress, [FIT_START, FIT_END], [1, 0], { clamp: true });
  const cyanX = useTransform(apart, [0, 1], ["0%", `${-APART_PERCENT.x}%`]);
  const cyanY = useTransform(apart, [0, 1], ["0%", `${-APART_PERCENT.y}%`]);
  const cyanRotate = useTransform(apart, [0, 1], [0, -APART.rotate]);
  const blueX = useTransform(apart, [0, 1], ["0%", `${APART_PERCENT.x}%`]);
  const blueY = useTransform(apart, [0, 1], ["0%", `${APART_PERCENT.y}%`]);
  const blueRotate = useTransform(apart, [0, 1], [0, APART.rotate]);

  const settle = useMotionValue(1);
  /* A flutuação anda em % da altura do símbolo (mesma razão de antes: 7 de 360 unidades). */
  const floatPercent = useMotionValue(0);
  const floatY = useMotionTemplate`${floatPercent}%`;
  /* Promove as camadas só enquanto o scroll as move (progresso entre 0 e 1); fora disso, voltam ao normal. */
  const groupRef = useRef<HTMLDivElement>(null);
  const cyanRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);
  useScrollWillChange(groupRef, scrollYProgress, !t.reduced);
  useScrollWillChange(cyanRef, scrollYProgress, !t.reduced);
  useScrollWillChange(blueRef, scrollYProgress, !t.reduced);

  /* A frase começa quando as peças já estão em boa parte juntas. Também confere o valor atual ao montar:
     chegando por âncora ou com a rolagem restaurada, nenhuma mudança futura dispararia o evento. */
  useMotionValueEvent(progress, "change", (value) => {
    if (value >= QUOTE_START) setStarted(true);
  });
  useEffect(() => {
    if (progress.get() >= QUOTE_START) setStarted(true);
  }, [progress]);
  const play = started || (t.reduced && seen);

  useMotionValueEvent(apart, "change", (value) => {
    if (value <= FIT_DONE && !fitted) {
      setFitted(true);
      if (!t.reduced) {
        /* "Clique" do encaixe: sobe um pouco e assenta com a mola. */
        animate(settle, SETTLE_SCALE, { duration: t.duration.instant, ease: t.ease.out }).then(() => animate(settle, 1, t.spring.fit));
      }
    } else if (value > FIT_UNDONE && fitted) {
      setFitted(false);
    }
  });

  /* Flutuação sutil só com as peças encaixadas e a seção na tela; pausa ao sair (a limpeza interrompe). */
  useEffect(() => {
    if (t.reduced || !fitted || !inView) return;
    const cycle = t.duration.story * FLOAT_CYCLE_FACTOR;
    const repeat = Math.max(1, Math.floor(FLOAT_BUDGET_SECONDS / cycle));
    /* O grupo só é promovido enquanto a flutuação roda (o fim do progresso já o despromoveu). */
    const group = groupRef.current;
    if (group) group.style.willChange = "transform";
    const controls = animate(floatPercent, [null, -FLOAT_RISE, 0], { duration: cycle, ease: t.ease.inOut, repeat: repeat - 1 });
    void controls.finished.then(() => {
      if (group) group.style.willChange = "";
    });
    return () => {
      controls.stop();
      if (group) group.style.willChange = "";
    };
  }, [t.reduced, t.duration.story, t.ease.inOut, fitted, inView, floatPercent]);

  /* Escalonamento de tudo que vem depois da frase, ligado ao mesmo gatilho. */
  const ruleDelay = t.reduced ? 0 : t.duration.gentle;
  const afterQuote = t.reduced ? 0 : t.duration.slow;
  const attribution: Variants = t.reduced
    ? {
        hidden: { opacity: 0, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: t.duration.quick, y: { duration: 0 } } },
      }
    : {
        hidden: { opacity: 0, y: t.distance.small },
        visible: { opacity: 1, y: 0, transition: { duration: t.duration.gentle, ease: t.ease.out, delay: afterQuote } },
      };
  const actions: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: staggerChildren(t.reduced ? 0 : t.stagger.items, { startDelay: t.reduced ? 0 : afterQuote + t.duration.base }),
      },
    },
  };

  const pieceStyle = (
    x: typeof cyanX,
    y: typeof cyanY,
    rotate: typeof cyanRotate,
    origin: typeof CYAN_ORIGIN,
  ) => (t.reduced ? { x: 0, y: 0, rotate: 0, ...origin } : { x, y, rotate, ...origin });

  return (
    <section ref={sectionRef} id={HOME_SECTION_IDS.concept} className={styles.section} aria-label={CONCEPT.ariaLabel}>
      <div className={`container ${styles.inner}`}>
        {/* O grafismo das peças: decorativo (a frase carrega o significado). */}
        <div className={styles.symbolWrap} aria-hidden="true">
          <motion.div ref={groupRef} className={styles.symbolGroup} style={t.reduced ? undefined : { y: floatY, scale: settle }}>
            <motion.div
              ref={cyanRef}
              className={styles.piece}
              data-reveal-transform=""
              style={pieceStyle(cyanX, cyanY, cyanRotate, CYAN_ORIGIN)}
            >
              <svg className={styles.pieceSvg} viewBox={SYMBOL_VIEWBOX} overflow="visible" focusable="false">
                <path
                  d={CYAN_PIECE}
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth={SYMBOL_STROKE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <motion.div
              ref={blueRef}
              className={styles.piece}
              data-reveal-transform=""
              style={pieceStyle(blueX, blueY, blueRotate, BLUE_ORIGIN)}
            >
              <svg className={styles.pieceSvg} viewBox={SYMBOL_VIEWBOX} overflow="visible" focusable="false">
                <path
                  d={BLUE_PIECE}
                  fill="none"
                  stroke="var(--blue)"
                  strokeWidth={SYMBOL_STROKE}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <figure className={styles.figure}>
          <blockquote className={styles.blockquote}>
            <TextReveal as="p" className={styles.quote} text={CONCEPT.quote} trigger="mount" play={play} />
          </blockquote>
          <DrawRule trigger="mount" play={play} delay={ruleDelay} className={styles.rule} />
          <motion.figcaption
            className={styles.author}
            data-reveal=""
            initial="hidden"
            animate={play ? "visible" : "hidden"}
            variants={attribution}
          >
            <span className={styles.name}>{CONCEPT.author}</span>
            <span className={styles.role}>{CONCEPT.role}</span>
          </motion.figcaption>
        </figure>

        <motion.div className={styles.actions} initial="hidden" animate={play ? "visible" : "hidden"} variants={actions}>
          <StaggerItem variant="rise">
            <MotionButton href={CONCEPT.primary.href} variant="primary" withCurtain>
              {CONCEPT.primary.label}
            </MotionButton>
          </StaggerItem>
          <StaggerItem variant="rise">
            <MotionButton href={CONCEPT.secondary.href} variant="outline" withCurtain>
              {CONCEPT.secondary.label}
            </MotionButton>
          </StaggerItem>
        </motion.div>
      </div>
    </section>
  );
}
