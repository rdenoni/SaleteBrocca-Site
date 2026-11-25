import type { ContactChannel } from "@/types/content";

/* Número oficial do WhatsApp (editável também em /admin/links). E-mail segue aguardando confirmação
   enquanto href for null. */
export const WHATSAPP: ContactChannel = {
  label: "WhatsApp",
  display: "+55 (48) 9973-4469",
  href: "https://wa.me/554899734469",
};

export const EMAIL: ContactChannel = {
  label: "E-mail",
  display: "contato@saletebrocca.com",
  href: null,
};

/** Local e horários de atendimento: null até a cliente confirmar (a página oculta a linha). */
export const CLINIC_CITY: string | null = null;
export const CLINIC_HOURS: string | null = null;

/* "Privacidade e dados pessoais (LGPD)" é o canal para a pessoa exercer os direitos do art. 18 da LGPD
   (a política de privacidade aponta para /contato#formulario enquanto o e-mail do encarregado não é confirmado). */
export const PRIVACY_SUBJECT = "Privacidade e dados pessoais (LGPD)";
export const CONTACT_SUBJECTS = ["Cursos", PRIVACY_SUBJECT, "Outro assunto"] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
