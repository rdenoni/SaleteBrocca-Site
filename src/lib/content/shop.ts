import { getCatalogCourses, isCourseAvailable } from "@/lib/content/courses";
import type {
  AvailabilityStatus,
  Course,
  Product,
  ProductCategory,
  ProductCategoryInfo,
  ProductDelivery,
  ShopCategoryId,
} from "@/types/content";

/* Ordem fixa pedida pela cliente: Cursos, Aplicativos, Jogos educativos, Kits personalizados, Materiais em PDF.
   Cursos são vitrine: a compra continua em /cursos/[slug] (courses.ts). Os demais são produtos avulsos. */
export const PRODUCT_CATEGORIES: readonly ProductCategoryInfo[] = [
  {
    id: "cursos",
    label: "Cursos",
    emptyText: "Os cursos da Salete serão apresentados aqui assim que forem publicados.",
  },
  {
    id: "aplicativos",
    label: "Aplicativos",
    emptyText: "Os aplicativos desenvolvidos pela Salete ainda serão cadastrados nesta loja.",
  },
  {
    id: "jogos",
    label: "Jogos educativos",
    emptyText: "Os jogos educativos físicos ainda serão cadastrados nesta loja.",
  },
  {
    id: "kits",
    label: "Kits personalizados",
    emptyText: "Os kits personalizados ainda serão cadastrados nesta loja.",
  },
  {
    id: "materiais",
    label: "Materiais em PDF",
    emptyText: "Os materiais em PDF ainda serão cadastrados nesta loja.",
  },
];

/* Escolha provisória do produto em destaque na vitrine: confirmar com a cliente. null = sem destaque. */
export const SHOP_FEATURED_SLUG: string | null = "brinqueletrando-box";

/* Resumo da entrega para a faixa "Sobre a compra"; deve acompanhar PDF_DELIVERY, CORREIOS_DELIVERY e FREE_SHIPPING. */
export const SHOP_DELIVERY_SUMMARY =
  "Materiais em PDF por e-mail; jogos e kits pelos Correios, com frete grátis para todo o Brasil.";

const NO_KIWIFY = { checkoutUrl: null, productId: null } as const;

const PDF_DELIVERY = "Por e-mail após a confirmação do pagamento";
const DOWNLOAD_DELIVERY = "Download direto no site após a confirmação do pagamento";
const CORREIOS_DELIVERY = "Envio pelos Correios após a confirmação do pagamento";
const FREE_SHIPPING = "Grátis para todo o Brasil";
const CORREIOS_ETA = "Entrega no prazo dos Correios para o seu CEP, com código de rastreio por e-mail";
/* Kits são personalizados: o prazo de postagem inclui a produção. */
const KIT_SHIPPING_FACTS = [
  { label: "Entrega", value: CORREIOS_DELIVERY },
  { label: "Frete", value: FREE_SHIPPING },
  { label: "Prazo", value: `Produção e postagem em até 7 dias úteis. ${CORREIOS_ETA}` },
] as const;

/* Preços, frete e prazos definidos pela cliente. Páginas, dimensões e demais detalhes ainda não confirmados ficam
   `null` (a interface mostra "A confirmar"). Preencher aqui, com dados reais, junto do link https://pay.kiwify.com.br/... e do ID do produto
   quando existirem na Kiwify (ver docs/08-VENDAS-KIWIFY.md). `image: null` até haver foto real do produto. */
const STANDALONE_PRODUCTS: readonly Product[] = [
  {
    slug: "brinqueletrando-app",
    category: "aplicativos",
    status: "coming-soon",
    kind: "Aplicativo",
    title: "Brinqueletrando",
    summary: "Aplicativo educativo para brincar com a alfabetização. Ainda está em desenvolvimento.",
    description: [
      "O Brinqueletrando será um aplicativo educativo para brincar com letras, sons e palavras no início da alfabetização.",
      "Ele ainda está em desenvolvimento e não está disponível para compra nem para download. Quando houver novidades, elas serão divulgadas aqui na loja.",
    ],
    image: "/images/products/brinqueletrando-app.jpg",
    imageAlt: "Tablet exibindo a tela do aplicativo educativo Brinqueletrando com a carta da letra G e a ilustração do gato",
    gallery: [
      {
        src: "/images/products/brinqueletrando-app.jpg",
        alt: "Tablet exibindo a tela do aplicativo educativo Brinqueletrando",
      },
      {
        src: "/images/products/brinqueletrando-carta-gato.jpg",
        alt: "Carta da letra G com a ilustração do gato e palavras para treino de leitura",
      },
      {
        src: "/images/products/brinqueletrando-carta-gralha.jpg",
        alt: "Carta do encontro consonantal G+R com a ilustração da gralha azul",
      },
      {
        src: "/images/products/brinqueletrando-verso.png",
        alt: "Identidade visual e verso das cartas do Brinqueletrando",
      },
    ],
    price: "R$ 39,90",
    delivery: "download",
    facts: [
      { label: "Tipo", value: "Aplicativo educativo" },
      { label: "Plataformas", value: null },
      { label: "Faixa etária", value: null },
      { label: "Entrega", value: DOWNLOAD_DELIVERY },
    ],
    highlights: ["Aplicativo educativo", "Em desenvolvimento", "Download direto no site"],
    includes: ["Brincadeiras com letras, sons e palavras", "Apoio ao início da leitura e da escrita"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "brinqueletrando-box",
    category: "jogos",
    status: "available",
    kind: "Jogo educativo",
    title: "Brinqueletrando Box",
    summary: "A versão física do Brinqueletrando, para brincar com letras, sons e palavras longe da tela.",
    description: [
      "O Brinqueletrando Box é o jogo educativo físico do Brinqueletrando, pensado para tornar a alfabetização uma brincadeira que a criança pode viver com o corpo, as mãos e a companhia de quem a acompanha.",
      "Pode ser usado por famílias, professores e profissionais que acompanham crianças no início da leitura e da escrita. Faixa etária, componentes e dimensões serão informados assim que forem confirmados.",
    ],
    image: "/images/products/brinqueletrando-box.jpg",
    imageAlt: "Cartas físicas do jogo educativo Brinqueletrando Box: G+R Gralha Azul, G Gato e verso com a marca Salete Brocca",
    gallery: [
      {
        src: "/images/products/brinqueletrando-box.jpg",
        alt: "Cartas do jogo educativo Brinqueletrando Box dispostas em leque",
      },
      {
        src: "/images/products/brinqueletrando-carta-gato.jpg",
        alt: "Detalhe da carta G — Gato com palavras para treino fonológico",
      },
      {
        src: "/images/products/brinqueletrando-carta-gralha.jpg",
        alt: "Detalhe da carta G+R — Gralha Azul com palavras de encontro consonantal",
      },
      {
        src: "/images/products/brinqueletrando-verso.png",
        alt: "Verso das cartas do jogo Brinqueletrando com logo Salete Brocca",
      },
    ],
    price: "R$ 399,00",
    delivery: "correios",
    facts: [
      { label: "Tipo", value: "Jogo educativo físico" },
      { label: "Faixa etária", value: null },
      { label: "Componentes", value: null },
      { label: "Dimensões", value: null },
      { label: "Entrega", value: CORREIOS_DELIVERY },
      { label: "Frete", value: FREE_SHIPPING },
      { label: "Prazo", value: `Postagem em até 5 dias úteis. ${CORREIOS_ETA}` },
    ],
    highlights: ["Jogo educativo físico", "Versão física do Brinqueletrando", "Entrega pelos Correios"],
    includes: ["O jogo Brinqueletrando Box"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "caneca-personalizada",
    category: "kits",
    status: "available",
    kind: "Kit personalizado",
    title: "Caneca personalizada",
    summary: "Caneca personalizada para presentear ou para acompanhar o dia a dia de quem trabalha com educação.",
    description: [
      "Uma caneca personalizada, para o café da sala dos professores, o consultório ou o escritório de estudos.",
      "Material, capacidade e opções de personalização serão informados assim que forem confirmados.",
    ],
    image: "/images/products/caneca-personalizada.png",
    imageAlt: "Caneca personalizada branca com interior azul-marinho, letras minimalistas e marca Salete Brocca",
    gallery: [
      {
        src: "/images/products/caneca-personalizada.png",
        alt: "Caneca personalizada branca com interior azul-marinho e logo Salete Brocca",
      },
      {
        src: "/images/products/xicara-personalizada.jpg",
        alt: "Versão xícara com pires Salete Brocca sobre fundo ciano",
      },
    ],
    price: "R$ 59,90",
    delivery: "correios",
    facts: [
      { label: "Material", value: null },
      { label: "Capacidade", value: null },
      { label: "Personalização", value: null },
      ...KIT_SHIPPING_FACTS,
    ],
    highlights: ["Kit personalizado", "Caneca"],
    includes: ["Caneca personalizada"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "agenda-pedagogica-personalizada",
    category: "kits",
    status: "available",
    kind: "Kit personalizado",
    title: "Agenda pedagógica personalizada",
    summary: "Agenda personalizada para organizar o planejamento, as observações e os compromissos da rotina educacional.",
    description: [
      "Uma agenda pensada para quem acompanha crianças em fase escolar e precisa registrar observações, planejar atividades e organizar a rotina em um só lugar.",
      "Formato, número de páginas e opções de personalização serão informados assim que forem confirmados.",
    ],
    image: "/images/products/agenda-pedagogica.jpg",
    imageAlt: "Agenda pedagógica personalizada azul ciano com logo Salete Brocca acompanhada do bloco de anotações branco",
    gallery: [
      {
        src: "/images/products/agenda-pedagogica.jpg",
        alt: "Agenda pedagógica azul ciano com marca Salete Brocca e bloco de anotações",
      },
      {
        src: "/images/products/agenda-pedagogica-angulo2.png",
        alt: "Segundo ângulo da agenda pedagógica personalizada com bloco de anotações branco",
      },
    ],
    price: "R$ 89,90",
    delivery: "correios",
    facts: [
      { label: "Formato", value: null },
      { label: "Páginas", value: null },
      { label: "Personalização", value: null },
      ...KIT_SHIPPING_FACTS,
    ],
    highlights: ["Kit personalizado", "Agenda"],
    includes: ["Agenda pedagógica personalizada"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "kit-educador",
    category: "kits",
    status: "available",
    kind: "Kit personalizado",
    title: "Kit Educador",
    summary: "Caneca, agenda e bloco de anotações personalizados, reunidos em um único kit.",
    description: [
      "O Kit Educador reúne os itens personalizados da loja para quem ensina, acompanha ou cuida de crianças: caneca, agenda e bloco de anotações.",
      "É uma boa opção de presente para profissionais e equipes da educação. Detalhes de cada item serão informados assim que forem confirmados.",
    ],
    image: "/images/products/kit-educador.jpg",
    imageAlt: "Kit Educador Salete Brocca completo: caneca personalizada branca com interior azul-marinho, agenda ciano e bloco de anotações branco",
    gallery: [
      {
        src: "/images/products/kit-educador.jpg",
        alt: "Kit Educador completo com caneca, agenda ciano e bloco de anotações",
      },
      {
        src: "/images/products/caneca-personalizada.png",
        alt: "Detalhe da caneca personalizada incluída no Kit Educador",
      },
      {
        src: "/images/products/agenda-pedagogica.jpg",
        alt: "Detalhe da agenda pedagógica e do bloco de anotações incluídos no Kit Educador",
      },
      {
        src: "/images/products/agenda-pedagogica-angulo2.png",
        alt: "Segundo ângulo da agenda pedagógica e do bloco de anotações",
      },
    ],
    price: "R$ 139,90",
    delivery: "correios",
    facts: [
      { label: "Itens", value: "Caneca, agenda e bloco de anotações" },
      { label: "Personalização", value: null },
      { label: "Embalagem", value: null },
      ...KIT_SHIPPING_FACTS,
    ],
    highlights: ["Kit personalizado", "Caneca, agenda e bloco de anotações"],
    includes: ["Caneca personalizada", "Agenda pedagógica personalizada", "Bloco de anotações personalizado"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "ficha-observacao-leitura-escrita",
    category: "materiais",
    status: "available",
    kind: "Material em PDF",
    title: "Ficha de observação da leitura e da escrita",
    summary: "Ficha para registrar, de forma organizada, o que se observa na leitura e na escrita da criança.",
    description: [
      "Registrar observações com clareza é um dos pontos centrais do curso Dificuldades na Aprendizagem. Esta ficha ajuda a anotar o que a criança faz ao ler e ao escrever, sem rótulos nem conclusões antecipadas.",
      "É um material de apoio para a observação. Ele não faz diagnóstico e não substitui a avaliação de um profissional habilitado.",
    ],
    image: null,
    imageAlt: "Grafismo da marca representando a ficha de observação",
    price: "R$ 9,90",
    delivery: "email",
    facts: [
      { label: "Formato", value: "PDF" },
      { label: "Páginas", value: null },
      { label: "Entrega", value: PDF_DELIVERY },
    ],
    highlights: ["Material em PDF", "Entrega por e-mail"],
    includes: ["Ficha de observação em PDF"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "guia-familias-sinais-de-atencao",
    category: "materiais",
    status: "available",
    kind: "Material em PDF",
    title: "Guia para famílias: sinais que merecem atenção",
    summary: "Guia em linguagem simples para as famílias reconhecerem sinais que merecem atenção na aprendizagem.",
    description: [
      "Um guia para pais e responsáveis, escrito em linguagem clara, sobre sinais que podem merecer atenção ao longo da vida escolar e sobre como conversar com a escola e com os profissionais.",
      "Observar uma dificuldade não significa diagnosticar um transtorno. O guia é um material de apoio e não substitui a avaliação de um profissional habilitado.",
    ],
    image: null,
    imageAlt: "Grafismo da marca representando o guia para famílias",
    price: "R$ 9,90",
    delivery: "email",
    facts: [
      { label: "Formato", value: "PDF" },
      { label: "Páginas", value: null },
      { label: "Entrega", value: PDF_DELIVERY },
    ],
    highlights: ["Material em PDF", "Entrega por e-mail"],
    includes: ["Guia para famílias em PDF"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "caderno-consciencia-fonologica",
    category: "materiais",
    status: "available",
    kind: "Material em PDF",
    title: "Caderno de atividades de consciência fonológica",
    summary: "Caderno de atividades para trabalhar sons, sílabas e rimas com crianças no início da alfabetização.",
    description: [
      "A consciência fonológica é um dos temas estudados no curso e faz parte do caminho da leitura. Este caderno reúne atividades para brincar com os sons da fala.",
      "As atividades são um apoio pedagógico e podem ser usadas por famílias, professores e profissionais que acompanham a criança.",
    ],
    image: null,
    imageAlt: "Grafismo da marca representando o caderno de atividades",
    price: "R$ 9,90",
    delivery: "email",
    facts: [
      { label: "Formato", value: "PDF" },
      { label: "Páginas", value: null },
      { label: "Entrega", value: PDF_DELIVERY },
    ],
    highlights: ["Material em PDF", "Entrega por e-mail"],
    includes: ["Caderno de atividades em PDF"],
    kiwify: NO_KIWIFY,
  },
  {
    slug: "roteiro-encaminhamento-responsavel",
    category: "materiais",
    status: "available",
    kind: "Material em PDF",
    title: "Roteiro para um encaminhamento responsável",
    summary: "Roteiro para organizar as informações e conversar com a família e os profissionais antes de um encaminhamento.",
    description: [
      "Encaminhar com responsabilidade é um dos objetivos do curso. Este roteiro ajuda a reunir o que foi observado e a preparar a conversa com a família e com os profissionais envolvidos.",
      "O roteiro é um material de apoio e não estabelece diagnósticos nem conclusões antecipadas.",
    ],
    image: null,
    imageAlt: "Grafismo da marca representando o roteiro de encaminhamento",
    price: "R$ 9,90",
    delivery: "email",
    facts: [
      { label: "Formato", value: "PDF" },
      { label: "Páginas", value: null },
      { label: "Entrega", value: PDF_DELIVERY },
    ],
    highlights: ["Material em PDF", "Entrega por e-mail"],
    includes: ["Roteiro em PDF"],
    kiwify: NO_KIWIFY,
  },
];

export function isProductAvailable(product: Product): boolean {
  return product.status === "available";
}

/** Como o produto chega ao comprador (definido produto a produto em `delivery`). */
export function getProductDelivery(product: Product): ProductDelivery {
  return product.delivery;
}

export function getProducts(category?: ProductCategory): readonly Product[] {
  return category ? STANDALONE_PRODUCTS.filter((product) => product.category === category) : STANDALONE_PRODUCTS;
}

/* Todo produto cadastrado, inclusive "coming-soon": a página existe para dizer que está indisponível. */
export function getProduct(slug: string): Product | undefined {
  return getProducts().find((product) => product.slug === slug);
}

export function getCategory(id: string | undefined): ProductCategoryInfo | undefined {
  return PRODUCT_CATEGORIES.find((category) => category.id === id);
}

export function getCheckoutHref(product: Product): string {
  return `/loja/checkout?produto=${encodeURIComponent(product.slug)}`;
}

/** Item exibido na vitrine: produto avulso ou curso (a compra do curso vive em /cursos/[slug]). */
export type ShopEntry =
  | { type: "course"; key: string; status: AvailabilityStatus; course: Course }
  | { type: "product"; key: string; status: AvailabilityStatus; product: Product };

export function getShopEntries(category: ShopCategoryId): readonly ShopEntry[] {
  if (category === "cursos") {
    return getCatalogCourses().map((course) => ({
      type: "course" as const,
      key: `curso-${course.slug}`,
      status: isCourseAvailable(course) ? ("available" as const) : ("coming-soon" as const),
      course,
    }));
  }
  return getProducts(category).map((product) => ({
    type: "product" as const,
    key: product.slug,
    status: product.status,
    product,
  }));
}
