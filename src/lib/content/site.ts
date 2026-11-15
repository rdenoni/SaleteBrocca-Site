import type { FooterColumn, NavItem, SocialLink } from "@/types/content";

export const SITE_NAME = "Salete Brocca";
export const SITE_DESCRIPTION =
  "Maria Salete Brocca Denoni, professora e fonoaudióloga clínica. Cursos, conteúdos e avaliação em dificuldades de aprendizagem.";

export const MAIN_NAV: readonly NavItem[] = [
  { label: "Cursos", href: "/cursos" },
  { label: "Sobre", href: "/sobre" },
  { label: "Conteúdo", href: "/conteudo" },
  { label: "Loja", href: "/loja" },
  { label: "Contato", href: "/contato" },
];

export const STUDENT_AREA: NavItem = { label: "Área do Aluno", href: "/area-do-aluno" };

/** Item do menu destacado com a gota ciano na Home (como na referência). */
export const HOME_FEATURED_NAV_HREF = "/cursos";

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Profissão",
    links: [
      { label: "História", href: "/sobre#historia" },
      { label: "Formação", href: "/sobre#formacao" },
      { label: "Atuação", href: "/sobre#atuacao" },
    ],
  },
  {
    title: "Cursos",
    links: [
      { label: "Catálogo", href: "/cursos" },
      { label: "Loja", href: "/loja" },
      { label: "Área do Aluno", href: "/area-do-aluno" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Artigos", href: "/conteudo" },
      { label: "Categorias", href: "/conteudo#categorias" },
    ],
  },
  {
    title: "Contato",
    links: [
      { label: "Agendamento", href: "/contato#agendamento" },
      { label: "WhatsApp", href: "/contato#whatsapp" },
      { label: "Formulário", href: "/contato#formulario" },
    ],
  },
];

/* Perfis oficiais ainda não confirmados pela cliente (href null): o rodapé só mostra a rede quando houver href. */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { network: "instagram", label: "Instagram", href: null },
  { network: "linkedin", label: "LinkedIn", href: null },
  { network: "whatsapp", label: "WhatsApp", href: null },
];

export const COPYRIGHT = `© ${new Date().getFullYear()} SaleteBrocca – Fonoaudiologia e curso online`;
