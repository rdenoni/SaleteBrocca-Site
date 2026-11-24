import { CLINIC_CITY, CLINIC_HOURS } from "./contact";

/* Ficha da avaliação clínica (/avaliacao). Nada aqui foi confirmado pela cliente além do que já está em
   contact.ts (local e horários, hoje null). Valor null = a página mostra "A confirmar"; nunca preencher com palpite. */

export type EvaluationFactIcon = "place" | "hours" | "age" | "price";

export interface EvaluationFact {
  label: string;
  /** null enquanto a cliente não confirmar. */
  value: string | null;
  icon: EvaluationFactIcon;
}

/** Faixa etária atendida: pendência da cliente (docs/07). */
export const EVALUATION_AGE_RANGE: string | null = null;

/** Valor da avaliação (ou "sob consulta"): pendência da cliente. */
export const EVALUATION_PRICE: string | null = null;

export const EVALUATION_FACTS: readonly EvaluationFact[] = [
  { label: "Local / modalidade", value: CLINIC_CITY, icon: "place" },
  { label: "Horários", value: CLINIC_HOURS, icon: "hours" },
  { label: "Faixa etária", value: EVALUATION_AGE_RANGE, icon: "age" },
  { label: "Valor", value: EVALUATION_PRICE, icon: "price" },
];

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
