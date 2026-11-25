/* Textos e links da página de avaliação clínica (/avaliacao). */

/* Etapas da avaliação: preencher só com o texto confirmado pela cliente. */
export const EVALUATION_STEPS: readonly { title: string; text: string }[] = [];

/** Link discreto sob o formulário da Home. */
export const EVALUATION_HOME_LINK = { label: "Como funciona a avaliação", href: "/avaliacao" } as const;

export const EVALUATION_PAGE = {
  title: "Avaliação",
  whoTitle: "Quem atende",
  whoLink: { label: "Conheça a trajetória", href: "/sobre" },
  howTitle: "Como funciona a avaliação",
  howIntro: "Estas informações serão publicadas assim que forem confirmadas.",
  pendingLabel: "A confirmar",
  backToForm: "Pedir avaliação",
} as const;
