import { PROFILE_INTRO, PROFILE_NAME, PROFILE_QUOTE, PROFILE_ROLE } from "./profile";

/* Textos da Home que não pertencem a outro conteúdo do site. Tudo aqui vem dos componentes da Home aprovados
   (FAZER.txt e Paleta.txt da cliente); nada foi inventado. Depoimentos, artigos e cursos vêm dos módulos próprios. */

/* Âncoras das seções. `avaliacao` é linkada de fora (política de privacidade); o scroll-padding-top do <html>
   (globals.css) deixa o header fixo longe do título. */
export const HOME_SECTION_IDS = {
  evaluation: "avaliacao",
  content: "conteudos",
  about: "sobre",
  courses: "cursos",
  concept: "frase-conceito",
} as const;

export const HOME_HERO = {
  title: "Conheça nossos cursos",
  text: "Formação, conhecimento e ferramentas para compreender as dificuldades de aprendizagem.",
  cta: { label: "Explorar cursos", href: "/cursos" },
  image: "/images/hero/crianca-escrevendo.jpg",
} as const;

/* Formulário de avaliação conectado ao CRM (/api/leads). */
export const HOME_EVALUATION = {
  titleLines: ["Quer marcar", "uma avaliação?"],
  nameLabel: "Nome completo",
  namePlaceholder: "Nome completo…",
  phoneLabel: "Telefone com DDD",
  phonePlaceholder: "Telefone com DDD…",
  submit: "Pedir avaliação",
  privacyBefore: "Saiba como seus dados são tratados na ",
  privacyLink: { label: "política de privacidade", href: "/privacidade" },
  success: "Pedido de avaliação enviado com sucesso! Nossa equipe entrará em contato em breve.",
} as const;

/* Marcação dos depoimentos simulados (src/lib/content/testimonials.ts). A nota só aparece enquanto houver
   algum depoimento simulado; sai junto com eles. */
export const HOME_TESTIMONIALS = {
  simulatedTag: "Depoimento simulado",
  simulatedNote: "Depoimentos 2 a 4 são simulados para demonstrar a troca.",
} as const;

/* Aviso mostrado enquanto ARTICLES_ARE_EXAMPLES for true. */
export const HOME_ARTICLES_NOTE = {
  strong: "Conteúdo de exemplo.",
  text: "Os artigos definitivos serão publicados em breve.",
} as const;

/* Foto oficial em plano médio (recorte 4:5), a mesma da página Sobre. */
export const HOME_ABOUT = {
  title: PROFILE_NAME,
  paragraphs: [
    PROFILE_INTRO,
    "Comecei minha carreira como educadora, atuando em diversas unidades escolares. Formei-me em fonoaudiologia em 1998 e, em 2001, concluí o curso complementar de neurofisiologia.",
  ],
  cta: { label: "Conheça minha trajetória", href: "/sobre" },
  image: "/images/about/salete-perfil.jpg",
  imageAlt:
    "Maria Salete Brocca Denoni, de blazer azul-marinho e óculos, em seu escritório diante de uma estante de livros",
} as const;

export const HOME_COURSES = {
  sectionTitle: "Cursos em destaque",
  badge: "Curso online",
  cta: "Ver curso",
  soonBadge: "Em breve",
  soonCta: "Em breve",
  soonNote: "Curso em preparação. Ainda não está disponível para inscrição.",
} as const;

/* Frase-conceito do Manual da Marca (PROFILE_QUOTE), antes do rodapé. */
export const HOME_CONCEPT = {
  ariaLabel: "Frase-conceito",
  quote: PROFILE_QUOTE,
  author: PROFILE_NAME,
  role: PROFILE_ROLE,
  primary: { label: "Explorar cursos", href: "/cursos" },
  secondary: { label: "Falar com a Salete", href: "/contato" },
} as const;
