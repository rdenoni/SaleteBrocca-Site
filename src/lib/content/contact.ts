import type { ContactChannel } from "@/types/content";

/* Número e e-mail aparecem nos arquivos da cliente (Paleta.txt), mas não foram confirmados:
   enquanto href for null, o dado é exibido com a nota "em confirmação" e não vira link.
   Atenção: o número tem 8 dígitos depois do DDD; celulares atuais têm 9. */
export const WHATSAPP: ContactChannel = {
  label: "WhatsApp",
  display: "+55 (48) 9973-4469",
  href: null,
};

export const EMAIL: ContactChannel = {
  label: "E-mail",
  display: "contato@saletebrocca.com",
  href: null,
};

/** Local e horários de atendimento: null até a cliente confirmar (a página oculta a linha). */
export const CLINIC_CITY: string | null = null;
export const CLINIC_HOURS: string | null = null;

export const CONTACT_SUBJECTS = ["Marcar avaliação", "Cursos", "Outro assunto"] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
