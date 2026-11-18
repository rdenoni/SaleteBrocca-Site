import type { PodcastEpisode } from "@/types/content";
import { getCourse } from "./courses";

export const PODCAST_NAME = "Podcast Aprender com a Salete";

/* Enquanto verdadeiro, os episódios são exemplos de pauta: o áudio ainda não foi gravado e os roteiros
   são rascunhos a revisar com a Salete. Trocar para false só com os áudios publicados e os textos aprovados. */
export const PODCASTS_ARE_SIMULATED = true;

const PRESENTER = "Apresentação";
const SALETE = "Salete";
const LISTENER = "Pergunta do ouvinte";
const COURSE_SLUG = "dificuldades-na-aprendizagem";

/* Temas e aulas vêm da estrutura oficial do curso (courses.ts). Sem dados, números ou durações inventados. */
const EPISODES: readonly PodcastEpisode[] = [
  {
    slug: "dificuldade-ou-transtorno",
    number: 1,
    title: "Dificuldade ou transtorno? Como observar sem rotular",
    summary:
      "Quem acompanha crianças na escola vê dificuldades todos os dias. Neste episódio, a diferença entre dificuldade na aprendizagem e transtorno específico, e como observar e encaminhar com responsabilidade.",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M01_A01", "M01_A02", "M01_A03"],
    topics: [
      "A diferença entre dificuldade na aprendizagem e transtorno específico",
      "Observar sem rotular",
      "Fatores pedagógicos e barreiras escolares",
      "Como registrar o que se observa",
      "Quando e como encaminhar com responsabilidade",
    ],
    script: [
      {
        speaker: PRESENTER,
        text: "Boas-vindas ao Podcast Aprender com a Salete. Neste episódio de exemplo, a conversa é sobre um cuidado importante para quem acompanha crianças na escola: observar uma dificuldade sem colocar um rótulo.",
      },
      {
        speaker: SALETE,
        text: "Obrigada. Gosto de começar separando duas ideias. Dificuldade na aprendizagem é o que vemos quando a criança encontra obstáculos para aprender algo. Transtorno específico da aprendizagem é uma condição que só pode ser reconhecida por uma avaliação especializada.",
      },
      {
        speaker: PRESENTER,
        text: "Então ter dificuldade não quer dizer que a criança tenha um transtorno?",
      },
      {
        speaker: SALETE,
        text: "Exatamente. Muitas dificuldades têm relação com a forma como o conteúdo foi ensinado, com o ambiente da escola ou com o momento da criança. Por isso, o primeiro passo é olhar também para as condições de ensino, e não só para a criança.",
      },
      {
        speaker: LISTENER,
        text: "Meu filho troca letras quando escreve. Isso já indica um transtorno?",
      },
      {
        speaker: SALETE,
        text: "Trocar letras pode aparecer em vários momentos do aprendizado e por motivos diferentes. Um sinal isolado não permite concluir nada. O que ajuda é observar com calma: em que situações acontece, com que frequência e o que melhora quando a criança recebe apoio.",
      },
      {
        speaker: PRESENTER,
        text: "E como registrar essa observação?",
      },
      {
        speaker: SALETE,
        text: "Com descrição, não com julgamento. Em vez de escrever que a criança é preguiçosa, anote o que ela fez: leu o texto em voz alta com muitas pausas e pediu ajuda em várias palavras. Assim, quem for ajudar depois tem informação de verdade.",
      },
      {
        speaker: PRESENTER,
        text: "E quando é hora de procurar ajuda?",
      },
      {
        speaker: SALETE,
        text: "Quando a dificuldade continua mesmo depois de a escola ajustar a forma de ensinar e de a família apoiar, vale conversar com profissionais. Quem observa, seja professor ou familiar, compartilha o que viu, sem anunciar uma conclusão. Esse encaminhamento é um pedido de avaliação, não um diagnóstico. Quem avalia e conclui é o profissional habilitado para isso.",
      },
      {
        speaker: PRESENTER,
        text: "E no dia a dia, que cuidados ajudam?",
      },
      {
        speaker: SALETE,
        text: "Evitar comparações com os colegas, não usar a palavra transtorno como explicação, valorizar o que a criança já consegue e manter escola, família e profissionais conversando entre si.",
      },
      {
        speaker: PRESENTER,
        text: "Para recapitular: observar, registrar com descrição, apoiar e encaminhar com responsabilidade. Fim deste episódio de exemplo.",
      },
    ],
    audioUrl: null,
    simulated: true,
  },
  {
    slug: "dislexia-o-que-e-e-o-que-nao-e",
    number: 2,
    title: "Dislexia: o que é e o que não é",
    summary:
      "A dislexia é um tema cercado de ideias equivocadas. Neste episódio, o que a definição atual descreve, o que a dislexia não é e por que só uma avaliação especializada pode concluir.",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M02_A04", "M02_A05"],
    topics: [
      "O que a definição atual de dislexia descreve",
      "Ideias equivocadas: o que a dislexia não é",
      "Por que ler devagar, sozinho, não permite concluir nada",
      "Perfis de dificuldade na leitura",
      "O papel de quem observa: registrar e encaminhar",
    ],
    script: [
      {
        speaker: PRESENTER,
        text: "Neste episódio de exemplo do Podcast Aprender com a Salete, o tema é a dislexia: o que ela é e também o que ela não é.",
      },
      {
        speaker: SALETE,
        text: "É um dos assuntos mais comentados e, ao mesmo tempo, um dos mais cercados de ideias equivocadas. A compreensão da dislexia mudou ao longo da história, e é por isso que, no curso, contamos essa história antes de chegar à definição atual.",
      },
      {
        speaker: PRESENTER,
        text: "E o que a definição atual diz?",
      },
      {
        speaker: SALETE,
        text: "Em linhas gerais, descreve uma dificuldade específica e persistente no reconhecimento das palavras e na escrita correta, que não se explica por falta de inteligência, por falta de oportunidade de ensino ou por falta de esforço.",
      },
      {
        speaker: PRESENTER,
        text: "Então, o que a dislexia não é?",
      },
      {
        speaker: SALETE,
        text: "Não é preguiça, não é falta de inteligência e não é falta de interesse. Também não se resume a ver as letras ao contrário: trocas e inversões aparecem em muitas crianças que estão aprendendo a ler e a escrever.",
      },
      {
        speaker: LISTENER,
        text: "Se a criança lê devagar, é dislexia?",
      },
      {
        speaker: SALETE,
        text: "Ler devagar é um sinal que merece atenção, mas pode ter várias origens: pouca prática de leitura, ensino que ainda não foi suficiente, dificuldades de atenção, de visão ou de audição. Só uma avaliação especializada consegue distinguir uma situação da outra.",
      },
      {
        speaker: PRESENTER,
        text: "O curso fala em perfis de dificuldade na leitura. O que isso quer dizer?",
      },
      {
        speaker: SALETE,
        text: "Que crianças com dificuldade na leitura não são todas iguais. Uma pode ter dificuldade para decodificar as palavras; outra decodifica, mas tem dificuldade para compreender o que leu. Conhecer os perfis ajuda a pensar em apoios diferentes.",
      },
      {
        speaker: PRESENTER,
        text: "E o que um professor ou um familiar pode fazer?",
      },
      {
        speaker: SALETE,
        text: "Observar e registrar como a criança lê e escreve, oferecer apoio e, se a dificuldade persistir, pedir uma avaliação com profissionais. Dar o nome dislexia não cabe a quem observa; cabe a quem avalia. E, quando existe uma avaliação, ela orienta os apoios. Mesmo assim, cada criança é única: uma avaliação não define quem ela é.",
      },
      {
        speaker: PRESENTER,
        text: "Fim deste episódio de exemplo. No curso, o tema é aprofundado nas aulas indicadas abaixo.",
      },
    ],
    audioUrl: null,
    simulated: true,
  },
  {
    slug: "atencao-memoria-funcoes-executivas",
    number: 3,
    title: "Atenção, memória e funções executivas na sala de aula",
    summary:
      "Aprender depende de várias funções trabalhando juntas. Neste episódio, o que são atenção, memória e funções executivas, o que pode atrapalhá-las e que apoios ajudam na sala de aula.",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M04_A01", "M04_A02"],
    topics: [
      "Atenção: selecionar e manter o foco",
      "Memória: guardar e usar a informação",
      "Funções executivas: planejar, organizar e ajustar",
      "Outros motivos para desatenção e esquecimento",
      "Apoios de ensino para a sala de aula",
      "Quando pedir uma avaliação",
    ],
    script: [
      {
        speaker: PRESENTER,
        text: "Boas-vindas a mais um episódio de exemplo do Podcast Aprender com a Salete. Hoje, o assunto é como atenção, memória e funções executivas aparecem na sala de aula.",
      },
      {
        speaker: SALETE,
        text: "Aprender depende de várias funções cognitivas trabalhando juntas. Vamos olhar para três delas, com exemplos do dia a dia escolar.",
      },
      {
        speaker: PRESENTER,
        text: "Começando pela atenção. O que é?",
      },
      {
        speaker: SALETE,
        text: "É a capacidade de selecionar o que importa e manter o foco durante a tarefa. Na sala de aula, a criança precisa deixar de lado o barulho, acompanhar a explicação e voltar ao que estava fazendo quando se distrai.",
      },
      {
        speaker: PRESENTER,
        text: "E a memória?",
      },
      {
        speaker: SALETE,
        text: "Para aprender, precisamos guardar a informação e depois usá-la. Uma parte importante é a memória de trabalho: manter na cabeça, por alguns instantes, o que acabou de ouvir, como as etapas de uma instrução, enquanto se executa a tarefa.",
      },
      {
        speaker: LISTENER,
        text: "Minha filha esquece o que a professora pede. É um problema de memória?",
      },
      {
        speaker: SALETE,
        text: "Esquecer instruções pode ter muitas causas: instrução longa demais, ambiente barulhento, cansaço, ansiedade, dificuldade de audição. Antes de pensar em memória, vale observar em que condições isso acontece.",
      },
      {
        speaker: PRESENTER,
        text: "E as funções executivas?",
      },
      {
        speaker: SALETE,
        text: "São as funções que ajudam a planejar, organizar, começar uma tarefa, acompanhar o que se está fazendo, mudar de estratégia quando algo não funciona e controlar impulsos. Podemos pensar nelas como quem coordena a tarefa do começo ao fim.",
      },
      {
        speaker: PRESENTER,
        text: "Que apoios ajudam na sala de aula?",
      },
      {
        speaker: SALETE,
        text: "Instruções em passos curtos, junto com apoio visual, como a lista das etapas na lousa; rotinas previsíveis; pedir que a criança explique com as próprias palavras o que vai fazer; e dividir tarefas longas em etapas. São apoios de ensino que ajudam muitas crianças. Se, mesmo com eles, as dificuldades persistirem e atrapalharem a aprendizagem, o caminho é registrar o que foi observado e pedir uma avaliação especializada. Quem observa não diagnostica.",
      },
      {
        speaker: PRESENTER,
        text: "Fim deste episódio de exemplo. As aulas do curso indicadas abaixo aprofundam cada um desses pontos.",
      },
    ],
    audioUrl: null,
    simulated: true,
  },
];

export function getPodcastEpisodes(): readonly PodcastEpisode[] {
  return EPISODES;
}

export function getPodcastEpisode(slug: string): PodcastEpisode | undefined {
  return EPISODES.find((episode) => episode.slug === slug);
}

export function podcastEpisodeHref(episode: Pick<PodcastEpisode, "slug">): string {
  return `/conteudo/podcast/${episode.slug}`;
}

export interface PodcastEpisodeNeighbors {
  previous?: PodcastEpisode;
  next?: PodcastEpisode;
}

export function getPodcastEpisodeNeighbors(slug: string): PodcastEpisodeNeighbors {
  const index = EPISODES.findIndex((episode) => episode.slug === slug);
  if (index === -1) return {};
  return { previous: EPISODES[index - 1], next: EPISODES[index + 1] };
}

export interface PodcastEpisodeLesson {
  code: string;
  title: string;
  moduleNumber: number;
  moduleTitle: string;
}

/** Aulas do curso ligadas ao episódio, com os títulos do roteiro oficial. Códigos desconhecidos são ignorados. */
export function getPodcastEpisodeLessons(episode: PodcastEpisode): PodcastEpisodeLesson[] {
  const course = getCourse(episode.courseSlug);
  if (!course) return [];

  return episode.lessonCodes.flatMap((code) => {
    for (const module of course.modules) {
      const lesson = module.lessons.find((candidate) => candidate.code === code);
      if (lesson) {
        return [{ code, title: lesson.title, moduleNumber: module.number, moduleTitle: module.title }];
      }
    }
    return [];
  });
}
