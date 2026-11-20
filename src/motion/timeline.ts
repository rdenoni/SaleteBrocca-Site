/* Partituras de entrada, em módulo puro (sem "use client"): servem aos componentes de cliente (com os tokens
   resolvidos) e às páginas de servidor (com os tokens crus de ./tokens).

   Regra de ordem (hierarquia): numa cascata entra primeiro o título (e o que pertence a ele), depois o subtítulo,
   depois o texto e só então o resto. Na página, o banner/topo vem antes das demais seções. No cabeçalho, o símbolo,
   depois o nome, depois os outros elementos. Cada passo começa mais ou menos na metade do anterior: a ordem fica
   clara sem ninguém esperar a animação acabar. */

import type { ResolvedMotionTokens } from "./useMotionTokens";

type TimingTokens = Pick<ResolvedMotionTokens, "duration" | "stagger">;

export interface HeroTimelineStep {
  id: "photo" | "title" | "rule" | "text" | "cta";
  label: string;
  /** Início em segundos (em segundos de tempo real). */
  start: number;
  /** Duração em segundos. */
  duration: number;
  /** Tokens que geram o tempo, para documentar. */
  tokens: string;
}

function countWords(text: string): number {
  return Math.max(1, text.split(/\s+/).filter(Boolean).length);
}

/* A partitura do Hero e do banner das páginas internas: única fonte para os componentes E para a página que a
   documenta. Todo tempo vem dos tokens, então acompanha o controle de velocidade. ~1,6 s em 1×. */
export function heroTimeline(t: TimingTokens, wordCount = 3): HeroTimelineStep[] {
  const titleStart = t.duration.instant;
  const titleDuration = (wordCount - 1) * t.stagger.words + t.duration.slow;
  const ruleStart = titleStart + t.duration.gentle;
  const textStart = ruleStart + t.duration.quick;
  const ctaStart = textStart + t.stagger.cards;

  return [
    { id: "photo", label: "Foto assenta (1,08 para 1)", start: 0, duration: t.duration.story, tokens: "duration.story · ease.out" },
    { id: "title", label: "Título, palavra por palavra", start: titleStart, duration: titleDuration, tokens: "duration.instant + stagger.words · duration.slow" },
    { id: "rule", label: "Régua ciano se desenha", start: ruleStart, duration: t.duration.slow, tokens: "+ duration.gentle · duration.slow · ease.stroke" },
    { id: "text", label: "Texto de apoio sobe e aparece", start: textStart, duration: t.duration.gentle, tokens: "+ duration.quick · duration.gentle · ease.out" },
    { id: "cta", label: "Botão sobe e aparece", start: ctaStart, duration: t.duration.gentle, tokens: "+ stagger.cards · duration.gentle · ease.out" },
  ];
}

/** Quando o primeiro bloco depois do banner (PageBanner) pode começar: com o subtítulo (ou o extra) já subindo. */
export function afterBanner(t: TimingTokens, title: string, hasExtra = false): number {
  const steps = heroTimeline(t, countWords(title));
  const last = steps.find((step) => step.id === (hasExtra ? "cta" : "text"));
  return (last?.start ?? 0) + t.duration.base;
}

/** Atraso do conteúdo de uma seção em relação ao título dela (TextReveal sem atraso): a última palavra já subindo. */
export function afterTitle(t: TimingTokens, title: string): number {
  return (countWords(title) - 1) * t.stagger.words + t.duration.base;
}

export interface HeaderTimeline {
  /** A pílula branca desce (duração). */
  pill: number;
  symbol: number;
  wordmark: number;
  /** Duração da revelação do nome. */
  wordmarkDuration: number;
  navItem: (index: number) => number;
  /** Duração da entrada de cada link e dos botões. */
  itemDuration: number;
  gota: number;
  actions: number;
  /** Fim da entrada inteira (s): a página começa a 80% disso (useEntranceReady). */
  end: number;
}

/* Cabeçalho: a pílula desce e, ainda descendo, o símbolo encaixa; o nome se revela quando as peças estão chegando;
   logo depois os links, a gota da página atual e os botões, em cascata curta. ~1,1 s em 1×. */
export function headerTimeline(t: TimingTokens, navItems: number): HeaderTimeline {
  const pill = t.duration.gentle;
  const symbol = t.duration.quick;
  const wordmark = symbol + t.duration.quick;
  const wordmarkDuration = t.duration.gentle;
  const nav = wordmark + t.duration.quick;
  const itemDuration = t.duration.base;
  const navItem = (index: number): number => nav + index * t.stagger.words;
  const actions = navItem(navItems);
  /* O encaixe das peças (spring.fit) leva ~duration.slow para assentar. */
  const end = Math.max(pill, wordmark + wordmarkDuration, actions + itemDuration, symbol + t.duration.slow);
  return { pill, symbol, wordmark, wordmarkDuration, navItem, itemDuration, gota: actions, actions, end };
}
