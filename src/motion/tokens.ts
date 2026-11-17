/* Motion tokens — Salete Brocca.
   Fonte única de tempo, curva, mola, distância e cadência do movimento.
   Valores em segundos (padrão do Motion). Os equivalentes em CSS estão em src/styles/motion.css.

   Duas ideias guiam os números:
   - O traço: o movimento termina devagar, como a caneta que completa uma letra (curvas "out" longas).
   - O encaixe: as peças do símbolo chegam com uma mola curta, sem quicar à toa (bounce baixo). */

export type CubicBezier = readonly [number, number, number, number];

export const duration = {
  /** Resposta ao toque (press, troca de cor de foco). */
  instant: 0.12,
  /** Hover, troca de ícone, tooltips. */
  quick: 0.2,
  /** Estados de interface: acordeão, abas, filtros. */
  base: 0.32,
  /** Entrada de seção, card e bloco de texto. */
  gentle: 0.56,
  /** Imagens, Hero, traço da régua ciano. */
  slow: 0.9,
  /** Assinatura da marca: símbolo, cortina de transição. Usar no máximo uma vez por tela. */
  story: 1.4,
} as const;

export const ease = {
  /** Entrada: desacelera longa e chega macia. Padrão para tudo que aparece. */
  out: [0.22, 1, 0.36, 1],
  /** Deslocamento dentro da tela (algo que já estava visível muda de lugar). */
  inOut: [0.65, 0, 0.35, 1],
  /** Saída: acelera e some, ~70% do tempo da entrada. Nunca chama atenção. */
  in: [0.55, 0, 1, 0.45],
  /** Traço: régua, símbolo, check. Começa hesitante e corre, como quem escreve. */
  stroke: [0.7, 0, 0.2, 1],
} as const satisfies Record<string, CubicBezier>;

/* Molas com visualDuration: o tempo percebido fica previsível. */
export const spring = {
  /** Botões, pílulas, abas, indicador de filtro. */
  ui: { type: "spring", visualDuration: 0.32, bounce: 0.12 },
  /** Press: volta rápida com um leve rebote (confirma o toque). */
  press: { type: "spring", visualDuration: 0.18, bounce: 0.3 },
  /** Encaixe das peças do símbolo e dos cards que se reorganizam. */
  fit: { type: "spring", visualDuration: 0.7, bounce: 0.2 },
} as const;

/* Suavização de valores ligados ao scroll (useSpring). Não depende de velocidade: segue o dedo. */
export const follow = { stiffness: 140, damping: 26, mass: 0.5 } as const;

export const distance = {
  /** Ícones e setas (nudge). */
  micro: 4,
  /** Hover de card, rótulos. */
  small: 8,
  /** Blocos de texto e cards entrando. */
  base: 24,
  /** Seções inteiras. */
  section: 40,
} as const;

export const stagger = {
  /** Palavras de um título. */
  words: 0.045,
  /** Itens de lista e linhas. */
  items: 0.07,
  /** Cards em grade. */
  cards: 0.1,
} as const;

/* Gatilho padrão de entrada por viewport: dispara quando o topo do bloco passa de 88% da altura da tela.
   "some" + margem, e não uma fração do bloco: um bloco mais alto que a tela (grade inteira no celular)
   nunca chegaria a 25% visível e ficaria escondido para sempre. */
export const viewport = {
  once: true,
  amount: "some",
  margin: "0px 0px -12% 0px",
} as const;

export const motionTokens = { duration, ease, spring, follow, distance, stagger, viewport } as const;
