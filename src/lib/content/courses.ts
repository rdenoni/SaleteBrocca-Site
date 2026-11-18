import type { Course } from "@/types/content";

/* Estrutura oficial: ROTEIRO_MESTRE_TEXTO_CORRIDO_COMPLETO_ATUALIZADO_21_AULAS.md
   (6 módulos, 21 aulas). Não acrescentar preço, carga horária ou certificado sem confirmação. */
const COURSES: readonly Course[] = [
  {
    slug: "dificuldades-na-aprendizagem",
    title: "Dificuldades na Aprendizagem",
    status: "available",
    audience:
      "Para pais, professores, pedagogos, psicopedagogos, fonoaudiólogos e outros profissionais que acompanham crianças em idade escolar.",
    description: [
      "Ao longo das aulas, vamos estudar dificuldades que podem aparecer na leitura, na escrita, na matemática e em outras atividades acadêmicas.",
      "Também vamos compreender como atenção, memória, linguagem, percepção, processamento fonológico, funções executivas e outros processos participam da aprendizagem.",
      "Meu objetivo é oferecer conhecimento técnico em uma linguagem clara, preservando a individualidade da criança e valorizando a colaboração entre escola, família e profissionais.",
    ],
    outcomes: [
      "Reconhecer sinais que merecem atenção",
      "Registrar observações de maneira organizada",
      "Compreender alguns dos processos envolvidos na aprendizagem",
      "Diferenciar dificuldades pedagógicas de manifestações que podem exigir avaliação especializada",
      "Realizar encaminhamentos com mais responsabilidade, sem rótulos ou conclusões antecipadas",
    ],
    notice:
      "O objetivo deste curso não é transformar professores, familiares ou outros profissionais em responsáveis por estabelecer diagnósticos fora de sua área de atuação. Observar uma dificuldade não significa diagnosticar um transtorno.",
    image: "/images/courses/dificuldades-na-aprendizagem.jpg",
    imageAlt: "Menina concentrada lendo um livro",
    commercial: { price: "R$ 598,00", workload: null, certificate: null, access: null },
    /* Produto "Dificuldades na Aprendizagem" na Kiwify (loja da conta Rafael Denoni). Ver docs/08-VENDAS-KIWIFY.md. */
    kiwify: {
      checkoutUrl: "https://pay.kiwify.com.br/49R1AdE",
      productId: "44c49520-e2e8-11f1-9987-25084670ad29",
    },
    modules: [
      {
        number: 0,
        title: "Orientação",
        summary: "Trajetória profissional da Salete, proposta do curso, público e objetivos.",
        lessons: [
          { code: "M00_A01", title: "Apresentação da Maria Salete" },
          { code: "M00_A02", title: "Introdução, público e objetivos do curso" },
        ],
      },
      {
        number: 1,
        title: "Fundamentos",
        summary:
          "O que significa apresentar uma dificuldade na aprendizagem, a diferença para um transtorno específico da aprendizagem e como fatores pedagógicos e barreiras escolares interferem no desempenho da criança.",
        lessons: [
          { code: "M01_A01", title: "Dificuldades na aprendizagem: o que são e como observar" },
          { code: "M01_A02", title: "Transtornos específicos da aprendizagem" },
          { code: "M01_A03", title: "Fatores pedagógicos e barreiras escolares" },
        ],
      },
      {
        number: 2,
        title: "Condições relacionadas à aprendizagem",
        summary: "Condições relacionadas à leitura, à escrita e à matemática.",
        lessons: [
          { code: "M02_A01", title: "Alexia e alterações adquiridas da leitura" },
          { code: "M02_A02", title: "Disgrafia, disortografia e expressão escrita" },
          { code: "M02_A03", title: "Dificuldades na matemática e discalculia" },
          { code: "M02_A04", title: "Dislexia: história e definição atual" },
          { code: "M02_A05", title: "Perfis de dificuldade na leitura" },
          { code: "M02_A06", title: "Fluência, compreensão e linguagem interior" },
          { code: "M02_A07", title: "Síndrome de Irlen e alterações visuoperceptivas na leitura" },
          { code: "M02_A08", title: "Hiperlexia, compreensão leitora e autismo" },
        ],
      },
      {
        number: 3,
        title: "Bases neurocognitivas",
        summary: "Neurônios, sinapses, neurotransmissores, sistemas funcionais, genética, ambiente e outros fatores de risco.",
        lessons: [
          { code: "M03_A01", title: "Neurônios, sinapses e comunicação neural" },
          { code: "M03_A02", title: "Sistemas funcionais e aprendizagem" },
          { code: "M03_A03", title: "Genética, ambiente e fatores de risco" },
        ],
      },
      {
        number: 4,
        title: "Funções cognitivas",
        summary:
          "Atenção, conservação da informação, memória, funções executivas, linguagem, percepção, discriminação e integração das informações.",
        lessons: [
          { code: "M04_A01", title: "Introdução às funções cognitivas" },
          { code: "M04_A02", title: "Atenção, memória e funções executivas" },
          { code: "M04_A03", title: "Linguagem, percepção e processamento" },
        ],
      },
      {
        number: 5,
        title: "Caminho da leitura e encerramento",
        summary:
          "O caminho da leitura, da entrada visual e do reconhecimento das letras à decodificação, à fluência e à compreensão; limites de atuação, formas de apoio e critérios para um encaminhamento responsável.",
        lessons: [
          { code: "M05_A01", title: "O caminho da leitura" },
          { code: "M05_A02", title: "Síntese, limites de atuação e encerramento" },
        ],
      },
    ],
  },
  {
    slug: "alfabetizacao",
    title: "Alfabetização",
    status: "coming-soon",
    audience:
      "Para pais, professores e profissionais que acompanham crianças no início da alfabetização.",
    description: [
      "Este curso está em preparação e ainda não está disponível para inscrição.",
      "A proposta é conversar sobre o processo de alfabetização: consciência fonológica, relação entre letra e som e os primeiros passos da leitura e da escrita.",
    ],
    outcomes: [],
    notice: "Curso em preparação. Ainda não está disponível para inscrição.",
    image: "/images/hero/crianca-escrevendo.jpg",
    imageAlt: "Criança escrevendo em um caderno",
    commercial: { price: null, workload: null, certificate: null, access: null },
    kiwify: { checkoutUrl: null, productId: null },
    modules: [],
  },
];

/* Só cursos disponíveis alimentam rotas, compra, Área do Aluno, sitemap e Kiwify. Cursos "em breve" só aparecem no catálogo. */
export function isCourseAvailable(course: Course): boolean {
  return course.status === "available";
}

export function getCourses(): readonly Course[] {
  return COURSES.filter(isCourseAvailable);
}

export function getCourse(slug: string): Course | undefined {
  return getCourses().find((course) => course.slug === slug);
}

/* Catálogo completo: disponíveis primeiro, depois os "em breve". */
export function getCatalogCourses(): readonly Course[] {
  return [...COURSES.filter(isCourseAvailable), ...COURSES.filter((course) => !isCourseAvailable(course))];
}

export function getCatalogCourse(slug: string): Course | undefined {
  return COURSES.find((course) => course.slug === slug);
}

export function countLessons(course: Course): number {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}
