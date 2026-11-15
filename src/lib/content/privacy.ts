/* Política de privacidade: só fatos verificáveis no código do site.
   O texto jurídico (finalidade formal, base legal, prazo de guarda, responsável/encarregado)
   é pendência da cliente (docs/07, pendência 10) e aparece como "A confirmar". */

export interface DataCollectionPoint {
  /** Onde o dado é pedido. */
  form: string;
  href: string;
  fields: readonly string[];
}

export const DATA_COLLECTION: readonly DataCollectionPoint[] = [
  { form: "Agendar avaliação (página inicial)", href: "/#avaliacao", fields: ["Nome", "Telefone"] },
  {
    form: "Formulário de contato",
    href: "/contato#formulario",
    fields: ["Nome", "Telefone", "E-mail (opcional)", "Assunto", "Mensagem"],
  },
  {
    form: "Inscrição e compra",
    href: "/cursos/dificuldades-na-aprendizagem/compra",
    fields: ["Nome", "E-mail", "Telefone"],
  },
  { form: "Área do Aluno", href: "/area-do-aluno/login", fields: ["E-mail", "Senha"] },
];

/* Resumo em linguagem simples dos direitos do art. 18 da LGPD (Lei 13.709/2018).
   A página apresenta a lista como "entre outros": o texto jurídico final é da cliente. */
export const DATA_SUBJECT_RIGHTS: readonly string[] = [
  "Confirmar se seus dados são tratados e ter acesso a eles",
  "Corrigir dados incompletos, inexatos ou desatualizados",
  "Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desacordo com a lei",
  "Pedir a portabilidade dos dados",
  "Pedir a eliminação dos dados tratados com o seu consentimento",
  "Saber com quem seus dados são compartilhados",
  "Saber que pode não dar o consentimento e o que acontece se não der",
  "Revogar o consentimento a qualquer momento",
];

/** Data da versão aprovada (AAAA-MM-DD); null enquanto o texto jurídico não for confirmado. */
export const PRIVACY_UPDATED_AT: string | null = null;
