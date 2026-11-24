import type { Article, ArticleBlock, ArticleCategory } from "@/types/content";
import {
  DIFICULDADE_BODY,
  DISLEXIA_BODY,
  FAMILIA_ESCOLA_BODY,
  FUNCOES_EXECUTIVAS_BODY,
  IRLEN_BODY,
  LEITURA_BODY,
} from "./articles-aprendizagem";

/* Categorias PROPOSTAS a partir dos temas dos artigos (as três primeiras vêm do site de referência).
   Validar nomes e organização com a cliente. */
const CATEGORIES: readonly ArticleCategory[] = [
  { slug: "audicao", label: "Audição" },
  { slug: "degluticao", label: "Deglutição" },
  { slug: "fala-e-fluencia", label: "Fala e fluência" },
  { slug: "aprendizagem", label: "Aprendizagem" },
  { slug: "leitura-e-escrita", label: "Leitura e escrita" },
];

/* PAC, Disfagia e Gagueira: textos revisados pela autora (SAIDA/ARTIGOS/ARTIGOS_PAC_DISFAGIA_GAGUEIRA_REVISAO.md).
   Foto da Gagueira: Pexels (Werner Pfennig), provisória. */
const PAC_BODY: ArticleBlock[] = [
  {
    type: "paragraph",
    text: "Muitas famílias chegam com a mesma queixa: “ele escuta, mas parece que não entende”. A criança passou no exame de audição, mas tem dificuldade para acompanhar as explicações em sala, confunde palavras parecidas ou se perde quando há barulho ao redor. Nesses casos, uma das hipóteses que podem ser investigadas é uma alteração no processamento auditivo central.",
  },
  { type: "heading", text: "Ouvir não é o mesmo que processar" },
  {
    type: "paragraph",
    text: "A audição periférica é a capacidade de detectar os sons nas intensidades esperadas, e é isso que o exame de audição verifica. O processamento auditivo central diz respeito ao que o sistema nervoso auditivo faz com esses sons: como ele os organiza, diferencia e utiliza.",
  },
  {
    type: "paragraph",
    text: "Por isso, uma criança pode ter a audição periférica normal e, mesmo assim, ter dificuldade em situações de escuta mais exigentes.",
  },
  {
    type: "paragraph",
    text: "Luria descreveu as atividades mentais como sistemas funcionais, formados pela participação conjunta de diferentes regiões do cérebro. De forma simplificada, o lobo temporal costuma ser relacionado ao processamento auditivo. Essas regiões, porém, trabalham de maneira integrada: escutar uma explicação exige atenção, percepção, memória e linguagem ao mesmo tempo.",
  },
  { type: "heading", text: "Sinais que merecem atenção" },
  {
    type: "list",
    items: [
      "dificuldade para compreender a fala em ambientes com ruído;",
      "dificuldade para distinguir sons ou palavras parecidas;",
      "dificuldade para acompanhar instruções orais longas ou com várias etapas;",
      "dificuldade para localizar de onde vem um som;",
      "pedidos frequentes para que as pessoas repitam o que disseram.",
    ],
  },
  {
    type: "paragraph",
    text: "Nenhum desses sinais confirma, sozinho, uma alteração. Eles mostram onde vale a pena investigar.",
  },
  { type: "heading", text: "Como é feita a avaliação" },
  {
    type: "paragraph",
    text: "O primeiro passo é confirmar que a audição periférica está dentro do esperado. Só depois faz sentido investigar o processamento auditivo central.",
  },
  {
    type: "paragraph",
    text: "A avaliação do processamento auditivo central é feita por um fonoaudiólogo habilitado. Ela utiliza uma bateria de tarefas auditivas, escolhidas de acordo com a idade, o histórico e as queixas de cada pessoa.",
  },
  {
    type: "paragraph",
    text: "Não existe um número fixo de sessões. A duração varia conforme o protocolo, a tolerância da criança, a necessidade de repetir alguma tarefa e a participação de outras avaliações.",
  },
  { type: "heading", text: "O que a avaliação mostra e o que ela não mostra" },
  {
    type: "paragraph",
    text: "A avaliação do processamento auditivo central não investiga todas as funções cognitivas. Ela também não determina, sozinha, se a criança tem dislexia, TDAH ou outro transtorno da aprendizagem.",
  },
  {
    type: "paragraph",
    text: "Atenção, memória e linguagem podem interferir nos resultados. Por isso, o profissional analisa se a dificuldade está ligada especificamente ao processamento auditivo central ou se pode ser explicada, total ou parcialmente, por outros fatores.",
  },
  { type: "heading", text: "E a leitura?" },
  {
    type: "paragraph",
    text: "Perceber e manipular os sons da fala, a chamada consciência fonêmica, é um dos componentes com mais evidências no ensino da leitura, segundo o National Reading Panel (2000). Castles, Rastle e Nation (2018) mostram que a leitura se desenvolve de forma progressiva e depende do ensino explícito da relação entre letras e sons, integrada à linguagem e à compreensão.",
  },
  {
    type: "paragraph",
    text: "Uma dificuldade de escuta pode, portanto, repercutir na leitura e na escrita. Mas o caminho inverso não vale: uma dificuldade de leitura tem várias origens possíveis e não indica, por si só, uma alteração do processamento auditivo.",
  },
  {
    type: "paragraph",
    text: "Autores clássicos como Johnson e Myklebust, e Vítor da Fonseca na tradição em língua portuguesa, já descreviam dificuldades ligadas à forma como a criança recebe e integra as informações auditivas, visuais e de linguagem. Esses perfis continuam úteis para pensar o caso, mas hoje não são usados como diagnósticos fechados.",
  },
  {
    type: "quote",
    text: "O erro observado orienta a investigação; ele não revela sozinho qual função está prejudicada.",
  },
  { type: "heading", text: "O que a família e a escola podem fazer" },
  {
    type: "list",
    items: [
      "observar e anotar em que situações a dificuldade aparece: com ruído, com instruções longas, ao telefone;",
      "falar de frente para a criança, com instruções curtas e uma etapa por vez;",
      "reduzir o ruído de fundo nos momentos de explicação;",
      "conferir se a mensagem foi compreendida, em vez de apenas repeti-la;",
      "procurar uma avaliação audiológica e fonoaudiológica quando as queixas persistirem.",
    ],
  },
  { type: "heading", text: "Referências" },
  {
    type: "list",
    items: [
      "American Speech-Language-Hearing Association (ASHA). Central Auditory Processing Disorder. Practice Portal.",
      "Castles, A.; Rastle, K.; Nation, K. Ending the Reading Wars: Reading Acquisition From Novice to Expert. Psychological Science in the Public Interest, 19(1), 5-51, 2018.",
      "Fonseca, V. da. Uma introdução às dificuldades de aprendizagem. Lisboa: Editorial Notícias, 1984.",
      "Johnson, D. J.; Myklebust, H. R. Learning Disabilities: Educational Principles and Practices. New York: Grune & Stratton, 1967.",
      "Luria, A. R. The Working Brain: An Introduction to Neuropsychology. New York: Basic Books, 1973.",
      "National Reading Panel. Teaching Children to Read. NICHD, 2000.",
    ],
  },
];

const DISFAGIA_BODY: ArticleBlock[] = [
  {
    type: "paragraph",
    text: "Disfagia é o nome dado à dificuldade para engolir. Ela pode envolver alimentos sólidos, líquidos ou a própria saliva e, em alguns casos, vem acompanhada de dor. Pode acontecer em qualquer idade, embora seja mais comum em pessoas idosas.",
  },
  {
    type: "paragraph",
    text: "Quando engolir fica difícil, comer deixa de ser um momento tranquilo. Também pode ficar difícil ingerir calorias e líquidos suficientes.",
  },
  { type: "heading", text: "Por que ela acontece" },
  {
    type: "paragraph",
    text: "Na maioria das vezes, a disfagia é consequência de outra condição. Entre as causas mais conhecidas estão:",
  },
  {
    type: "list",
    items: [
      "alterações neurológicas, como a doença de Parkinson e a paralisia cerebral;",
      "acidente vascular cerebral (AVC);",
      "lesões na cabeça ou na medula espinhal;",
      "problemas no esôfago, como o refluxo gastroesofágico;",
      "câncer de cabeça, pescoço ou esôfago.",
    ],
  },
  { type: "heading", text: "Sinais de alerta" },
  {
    type: "list",
    items: [
      "tosse ou engasgo durante ou logo depois das refeições;",
      "voz “molhada” ou ruído na garganta depois de engolir;",
      "pigarro frequente ao beber ou ao engolir;",
      "refeições muito demoradas ou mastigação muito lenta;",
      "sensação de alimento parado na garganta ou no peito;",
      "perda de peso sem explicação;",
      "em crianças, recusa persistente de alimentos ou dificuldade para avançar nas texturas.",
    ],
  },
  {
    type: "paragraph",
    text: "Tosse, febre ou falta de ar associadas às refeições são motivo para procurar atendimento. Esses sinais podem indicar que alimento ou líquido está seguindo para as vias respiratórias.",
  },
  { type: "heading", text: "Como é feita a avaliação" },
  {
    type: "paragraph",
    text: "A avaliação costuma envolver o médico e o fonoaudiólogo. O fonoaudiólogo levanta o histórico, observa as estruturas e os movimentos da boca e acompanha como a pessoa lida com diferentes consistências de alimento.",
  },
  {
    type: "paragraph",
    text: "Quando a equipe considera necessário, a avaliação é complementada por exames como a videofluoroscopia da deglutição ou exames endoscópicos.",
  },
  { type: "heading", text: "Como tratar" },
  {
    type: "paragraph",
    text: "O tratamento depende da causa e de como a deglutição está alterada. Ele pode incluir:",
  },
  {
    type: "list",
    items: [
      "o tratamento da condição de base, com medicamentos ou, em alguns casos, cirurgia;",
      "terapia fonoaudiológica da deglutição;",
      "ajustes na consistência dos alimentos e dos líquidos;",
      "posturas específicas de cabeça e pescoço durante a refeição;",
      "em casos graves, uma via alternativa de alimentação, como a sonda.",
    ],
  },
  { type: "quote", text: "A disfagia tem tratamento, e ele começa por identificar a causa." },
  { type: "heading", text: "Cuidados na hora da refeição" },
  {
    type: "paragraph",
    text: "Estes cuidados são gerais. As orientações de cada pessoa vêm da avaliação.",
  },
  {
    type: "list",
    items: [
      "comer sentado, com o tronco o mais ereto possível;",
      "oferecer porções pequenas e respeitar o tempo de cada um;",
      "manter um ambiente calmo e evitar conversar enquanto a pessoa engole;",
      "não mudar a consistência dos alimentos ou dos líquidos por conta própria.",
    ],
  },
  { type: "heading", text: "Referências" },
  {
    type: "list",
    items: ["MedlinePlus (U.S. National Library of Medicine). Swallowing Disorders. Atualizado em 3 dez. 2025."],
  },
];

const GAGUEIRA_BODY: ArticleBlock[] = [
  {
    type: "paragraph",
    text: "É comum que crianças pequenas repitam palavras ou “travem” de vez em quando enquanto aprendem a falar. Isso faz parte do desenvolvimento da linguagem. A gagueira é diferente: a pessoa sabe o que quer dizer, mas tem dificuldade para produzir a fala com fluência.",
  },
  { type: "heading", text: "Como a gagueira aparece" },
  {
    type: "list",
    items: [
      "repetição de sons, sílabas ou palavras (“pa-pa-pato”);",
      "prolongamento de sons (“ssssapo”);",
      "bloqueios: momentos em que a fala para e o som não sai.",
    ],
  },
  {
    type: "paragraph",
    text: "Às vezes surgem também sinais de esforço, como piscar rápido os olhos ou tremor nos lábios. Os sintomas variam ao longo do dia. Falar em público ou ao telefone pode piorar a gagueira, enquanto cantar ou falar em coro com outra pessoa costuma reduzi-la temporariamente.",
  },
  { type: "heading", text: "Por que ela acontece" },
  {
    type: "paragraph",
    text: "Os mecanismos ainda não são totalmente conhecidos. A forma mais comum é a gagueira do desenvolvimento, que surge na infância, enquanto a criança desenvolve a fala e a linguagem. A explicação mais aceita é que resulta da interação de vários fatores, entre eles diferenças no funcionamento cerebral e uma contribuição genética: a gagueira pode ocorrer em várias pessoas da mesma família.",
  },
  {
    type: "paragraph",
    text: "Existe também a gagueira neurogênica, que pode aparecer depois de um AVC, de um traumatismo ou de outra lesão cerebral.",
  },
  {
    type: "paragraph",
    text: "Durante muito tempo se acreditou que a gagueira tinha origem emocional. Hoje se sabe que a gagueira causada por trauma emocional é rara. Isso não significa que as emoções não importem: a ansiedade diante de situações de fala costuma fazer parte do quadro e também é tratada.",
  },
  { type: "heading", text: "O que os números mostram" },
  {
    type: "paragraph",
    text: "Segundo o NIDCD, instituto dos Institutos Nacionais de Saúde dos EUA:",
  },
  {
    type: "list",
    items: [
      "a gagueira aparece com mais frequência entre os 2 e os 6 anos;",
      "cerca de 5% a 10% das crianças gaguejam em algum período da vida, por semanas ou anos;",
      "meninos têm de 2 a 3 vezes mais chance de gaguejar do que meninas;",
      "cerca de 75% das crianças deixam de gaguejar; nos outros 25%, a gagueira pode persistir.",
    ],
  },
  { type: "heading", text: "Quando procurar avaliação" },
  { type: "paragraph", text: "Recomenda-se avaliação quando a criança:" },
  {
    type: "list",
    items: [
      "gagueja há 3 a 6 meses ou mais;",
      "mostra sinais de esforço ou tensão ao falar;",
      "tem histórico de gagueira ou de outras alterações de comunicação na família.",
    ],
  },
  {
    type: "paragraph",
    text: "A avaliação é feita pelo fonoaudiólogo. Ela inclui o histórico (quando e em que situações a gagueira começou), a análise da fala, a avaliação da fala e da linguagem como um todo e o impacto da gagueira na vida da pessoa. Nas crianças pequenas, o profissional também procura estimar se a gagueira tende a desaparecer ou a persistir.",
  },
  { type: "heading", text: "Como tratar" },
  {
    type: "paragraph",
    text: "Não existe cura, mas existem tratamentos, e o tratamento precoce pode evitar que a gagueira do desenvolvimento se torne permanente. Com crianças, a terapia costuma envolver os pais, que aprendem a apoiar a fala da criança no dia a dia. Com adolescentes e adultos, a terapia trabalha a velocidade da fala, a respiração e a ansiedade nas situações de comunicação.",
  },
  {
    type: "paragraph",
    text: "Não há medicamento aprovado especificamente para gagueira pela agência reguladora dos EUA (FDA).",
  },
  { type: "quote", text: "A criança precisa ser ouvida pelo que diz, e não pela forma como diz." },
  { type: "heading", text: "Como a família pode ajudar" },
  {
    type: "list",
    items: [
      "oferecer um ambiente tranquilo, com muitas oportunidades de conversa;",
      "prestar atenção ao conteúdo da mensagem;",
      "não interromper nem completar as frases da criança;",
      "falar de forma um pouco mais lenta e tranquila;",
      "conversar abertamente sobre a gagueira quando a criança tocar no assunto.",
    ],
  },
  { type: "heading", text: "Referências" },
  {
    type: "list",
    items: [
      "National Institute on Deafness and Other Communication Disorders (NIDCD/NIH). Stuttering. Atualizado em 6 mar. 2017.",
    ],
  },
];

/* Publicados em 24/11/2026, depois da revisão da autora. */
const PUBLISHED_AT = "2026-11-24";

const ARTICLES: readonly Article[] = [
  {
    slug: "pac-avaliacao-do-processamento-auditivo",
    keyword: "PAC:",
    title: "Como é feita a avaliação do processamento auditivo?",
    category: "audicao",
    image: "/images/articles/pac-processamento-auditivo.jpg",
    imageAlt: "Menino com fone de ouvido durante uma avaliação auditiva",
    imagePosition: "68% center",
    publishedAt: PUBLISHED_AT,
    body: PAC_BODY,
  },
  {
    slug: "disfagia-sintomas-e-tratamento",
    keyword: "Disfagia:",
    title: "Quais os sintomas e como tratá‑la?",
    category: "degluticao",
    image: "/images/articles/disfagia.jpg",
    imageAlt: "Criança de boca aberta durante exame com espátula",
    imagePosition: "40% center",
    publishedAt: PUBLISHED_AT,
    body: DISFAGIA_BODY,
  },
  {
    slug: "gagueira-quando-procurar-avaliacao",
    keyword: "Gagueira:",
    title: "Quando a criança precisa de avaliação?",
    category: "fala-e-fluencia",
    image: "/images/articles/gagueira.jpg",
    imageAlt: "Criança sorrindo segura um cartão com as letras T maiúscula e minúscula",
    imagePosition: "50% 30%",
    publishedAt: PUBLISHED_AT,
    body: GAGUEIRA_BODY,
  },
  /* Seis textos novos (articles-aprendizagem.ts), aprovados pela autora e publicados em 24/11/2026.
     Fotos: Pexels, provisórias. */
  {
    slug: "dificuldade-ou-transtorno-de-aprendizagem",
    keyword: "Aprendizagem:",
    title: "Dificuldade ou transtorno: qual é a diferença?",
    category: "aprendizagem",
    image: "/images/articles/dificuldade-ou-transtorno.jpg",
    imageAlt: "Menina de tranças debruçada sobre o caderno, escrevendo com caneta vermelha",
    imagePosition: "40% center",
    publishedAt: PUBLISHED_AT,
    body: DIFICULDADE_BODY,
  },
  {
    slug: "dislexia-sinais-na-leitura",
    keyword: "Dislexia:",
    title: "Quais sinais merecem atenção na leitura?",
    category: "leitura-e-escrita",
    image: "/images/articles/dislexia.jpg",
    imageAlt: "Duas crianças organizam cartões com letras sobre uma mesa amarela",
    imagePosition: "60% center",
    publishedAt: PUBLISHED_AT,
    body: DISLEXIA_BODY,
  },
  {
    slug: "leitura-decodificacao-fluencia-compreensao",
    keyword: "Leitura:",
    title: "Ler rápido é o mesmo que ler bem?",
    category: "leitura-e-escrita",
    image: "/images/articles/leitura-fluencia.jpg",
    imageAlt: "Menino em pé na sala de aula folheando um livro ilustrado",
    imagePosition: "58% center",
    publishedAt: PUBLISHED_AT,
    body: LEITURA_BODY,
  },
  {
    slug: "funcoes-executivas-na-escola",
    keyword: "Funções executivas:",
    title: "Como elas aparecem nas tarefas escolares?",
    category: "aprendizagem",
    image: "/images/articles/funcoes-executivas.jpg",
    imageAlt: "Menino concentrado segurando um cubo mágico colorido",
    imagePosition: "45% center",
    publishedAt: PUBLISHED_AT,
    body: FUNCOES_EXECUTIVAS_BODY,
  },
  {
    slug: "sindrome-de-irlen-queixas-visuais-na-leitura",
    keyword: "Síndrome de Irlen:",
    title: "O que se sabe sobre as queixas visuais na leitura?",
    category: "leitura-e-escrita",
    image: "/images/articles/queixas-visuais-leitura.jpg",
    imageAlt: "Livro aberto sobre uma mesa de madeira, com uma criança ao fundo",
    imagePosition: "40% center",
    publishedAt: PUBLISHED_AT,
    body: IRLEN_BODY,
  },
  {
    slug: "familia-e-escola-como-conversar",
    keyword: "Família e escola:",
    title: "Como conversar sobre uma dificuldade de aprendizagem?",
    category: "aprendizagem",
    image: "/images/articles/familia-e-escola.jpg",
    imageAlt: "Mãos de um adulto e de uma criança movem as argolas coloridas de um ábaco",
    imagePosition: "35% center",
    publishedAt: PUBLISHED_AT,
    body: FAMILIA_ESCOLA_BODY,
  },
];

export const ARTICLE_AUTHOR = "Maria Salete Brocca Denoni";

/* true deixa a seção como exemplo de layout: etiqueta "Artigo de exemplo" e fora dos buscadores e do sitemap. */
export const ARTICLES_ARE_EXAMPLES = false;

export function getArticleCategories(): readonly ArticleCategory[] {
  return CATEGORIES;
}

export function getArticleCategory(slug: string): ArticleCategory | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getArticles(categorySlug?: string): readonly Article[] {
  return categorySlug ? ARTICLES.filter((article) => article.category === categorySlug) : ARTICLES;
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

/* Mesma categoria primeiro, depois os demais, sem repetir o artigo atual. */
export function getRelatedArticles(article: Article, limit: number): readonly Article[] {
  const others = ARTICLES.filter((item) => item.slug !== article.slug);
  const sameCategory = others.filter((item) => item.category === article.category);
  const rest = others.filter((item) => item.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function getFeaturedArticles(): readonly Article[] {
  return ARTICLES.slice(0, 3);
}

export function articleTitle(article: Article): string {
  return `${article.keyword} ${article.title}`;
}
