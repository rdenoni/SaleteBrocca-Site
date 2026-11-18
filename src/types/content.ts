export interface NavItem {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

export interface Lesson {
  /** Código do roteiro oficial, ex.: "M01_A02". */
  code: string;
  title: string;
}

export interface Module {
  number: number;
  title: string;
  /** Resumo do módulo, do roteiro oficial (aula M00_A02). */
  summary?: string;
  lessons: Lesson[];
}

/** Informação comercial: null enquanto a cliente não confirmar. */
export interface CourseCommercialInfo {
  price: string | null;
  workload: string | null;
  certificate: string | null;
  access: string | null;
}

/** Venda pela Kiwify: null enquanto o produto não existir na Kiwify (preencher em courses.ts / shop.ts). */
export interface KiwifyLink {
  /** Link de checkout (https://pay.kiwify.com.br/...). */
  checkoutUrl: string | null;
  /** ID do produto na Kiwify; o webhook usa para descobrir qual curso liberar. */
  productId: string | null;
}

export interface Course {
  slug: string;
  title: string;
  /** Público-alvo, conforme o roteiro oficial do curso. */
  audience: string;
  /** Parágrafos de apresentação (texto do roteiro oficial). */
  description: string[];
  /** O que o aluno deverá saber ao final (texto do roteiro oficial). */
  outcomes: string[];
  /** Aviso sobre limites de atuação (texto do roteiro oficial). */
  notice: string;
  image: string;
  imageAlt: string;
  modules: Module[];
  commercial: CourseCommercialInfo;
  kiwify: KiwifyLink;
}

export interface ArticleCategory {
  slug: string;
  label: string;
}

/** Bloco do corpo do artigo: o texto vem da cliente, a tipografia é do site. */
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export interface Article {
  slug: string;
  /** Palavra-chave exibida em negrito antes do título (ex.: "Disfagia:"). */
  keyword: string;
  title: string;
  /** Slug de uma ArticleCategory. */
  category: string;
  image: string;
  imageAlt: string;
  /** Enquadramento da foto vertical do card (CSS object-position). */
  imagePosition?: string;
  /** Data ISO (AAAA-MM-DD); null enquanto não houver publicação. */
  publishedAt: string | null;
  /** null enquanto a cliente não enviar o texto. */
  body: ArticleBlock[] | null;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  /** Foto real da pessoa. Sem foto, o avatar usa `initials`. */
  photo?: string;
  initials?: string;
  avatarTone?: "cyan" | "light";
  /** Depoimento de exemplo (não é real): ganha a etiqueta "Depoimento simulado" na interface. */
  simulated?: boolean;
}

export interface FormationItem {
  /** null enquanto a cliente não confirmar o ano. */
  year: string | null;
  title: string;
}

export type ActivityIcon = "clinic" | "institution" | "courses" | "games";
export type ActivityTone = "light" | "cyan" | "blue" | "navy";

export interface Activity {
  title: string;
  text: string;
  icon: ActivityIcon;
  tone: ActivityTone;
  href?: string;
  /** Dado conhecido mas ainda não confirmado (ex.: cidade). */
  pending?: string;
}

/* Cursos não são produtos da Loja: vivem em /cursos. */
export type ProductCategory = "materiais" | "jogos";

export interface ProductCategoryInfo {
  id: ProductCategory;
  label: string;
  /** Texto do estado vazio enquanto a categoria não tiver produtos confirmados. */
  emptyText: string;
}

/** Linha da ficha do produto: value null enquanto a cliente não confirmar. */
export interface ProductFact {
  label: string;
  value: string | null;
}

export interface Product {
  slug: string;
  category: ProductCategory;
  /** Tipo exibido no selo do card (ex.: "Material de apoio"). */
  kind: string;
  title: string;
  summary: string;
  description: string[];
  image: string;
  imageAlt: string;
  /** null enquanto a cliente não confirmar. */
  price: string | null;
  facts: ProductFact[];
  /** Dados curtos e confirmados para o resumo do pedido. */
  highlights: string[];
  /** O que o comprador recebe. */
  includes: string[];
  kiwify: KiwifyLink;
}

export type LessonStatus = "completed" | "in-progress" | "not-started";

/** Aula localizada dentro do curso, para a Área do Aluno. */
export interface LessonRef {
  /** Segmento da URL, derivado do código (ex.: "m01-a02"). */
  slug: string;
  code: string;
  title: string;
  moduleNumber: number;
  moduleTitle: string;
  moduleSummary?: string;
  /** Posição da aula dentro do módulo, a partir de 1. */
  numberInModule: number;
}

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
  /** Aula a retomar; undefined quando o curso foi concluído. */
  current?: LessonRef;
}

export interface StudentMaterial {
  title: string;
  courseSlug: string;
  /** Ex.: "PDF". */
  format: string;
  href: string;
}

/** Canal de contato: href null enquanto a cliente não confirmar o dado. */
export interface ContactChannel {
  label: string;
  display: string;
  href: string | null;
}

export interface FaqLink {
  href: string;
  label: string;
}

/** Pergunta frequente. A resposta é montada a partir de dados confirmados (curso, perfil); nada é inventado. */
export interface FaqItem {
  /** Âncora estável (#duvida-<id>) e chave de lista. */
  id: string;
  question: string;
  /** Parágrafos da resposta. */
  answer: readonly string[];
  /** Lista opcional depois dos parágrafos (ex.: o que se aprende, módulos). */
  list?: readonly string[];
  link?: FaqLink;
}

export type SocialNetwork = "instagram" | "facebook" | "linkedin" | "whatsapp";

export interface SocialLink {
  network: SocialNetwork;
  label: string;
  /** null enquanto o perfil oficial não for confirmado pela cliente. */
  href: string | null;
}
