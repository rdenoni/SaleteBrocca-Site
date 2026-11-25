import type { NavItem, SocialLink } from "@/types/content";
import { WHATSAPP } from "./contact";

export const SITE_NAME = "Salete Brocca";
export const SITE_DESCRIPTION =
  "Maria Salete Brocca Denoni, professora e fonoaudióloga clínica. Cursos, conteúdos e avaliação em dificuldades de aprendizagem.";

/* Menu aprovado pela cliente sem a Loja; a Loja voltou ao cabeçalho a pedido do desenvolvedor (confirmar com a cliente). */
export const MAIN_NAV: readonly NavItem[] = [
  { label: "Cursos", href: "/cursos" },
  { label: "Loja", href: "/loja" },
  { label: "Avaliação", href: "/avaliacao" },
  { label: "Conteúdo", href: "/conteudo" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export const STUDENT_AREA: NavItem = { label: "Área do Aluno", href: "/area-do-aluno" };

/** Item do menu destacado com a gota ciano na Home (como na referência). */
export const HOME_FEATURED_NAV_HREF = "/cursos";

/* Perfis oficiais ainda não confirmados pela cliente (href null): o rodapé mostra todas as redes; sem href o ícone
   é um botão que avisa "Endereço em confirmação", com href vira link externo.
   Nunca inventar endereço: preencher só com o que a cliente confirmar. */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { network: "instagram", label: "Instagram", href: null },
  { network: "facebook", label: "Facebook", href: null },
  { network: "linkedin", label: "LinkedIn", href: null },
  { network: "whatsapp", label: "WhatsApp", href: WHATSAPP.href },
];

export const LEGAL_LINKS: readonly NavItem[] = [
  { label: "Política de privacidade", href: "/privacidade" },
  { label: "Termos de uso", href: "/termos-de-uso" },
];

/* O ano vem do servidor (layout) como prop: um `new Date()` no módulo do cliente congelaria o ano do build
   e poderia divergir entre servidor e navegador na hidratação. */
export function copyrightLine(year: number): string {
  return `© ${year} SaleteBrocca – Fonoaudiologia e curso online`;
}
