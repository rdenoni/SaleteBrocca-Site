import type { PodcastEpisode } from "@/types/content";
import { getCourse } from "./courses";

export const PODCAST_NAME = "Podcast Aprender com a Salete";

/* Episódios publicados com áudio real em public/audio/podcasts/. */
export const PODCASTS_ARE_SIMULATED = false;

const COURSE_SLUG = "dificuldades-na-aprendizagem";

/* Temas e aulas ligados à estrutura oficial do curso (courses.ts). Sem durações ou falas inventadas. */
const EPISODES: readonly PodcastEpisode[] = [
  {
    slug: "como-a-hiperlexia-faz-ler-sem-entender",
    number: 1,
    title: "Como a hiperlexia faz ler sem entender",
    summary:
      "Decodificar palavras com facilidade não garante compreender o que se lê. Neste episódio, o que caracteriza a hiperlexia e como observar a compreensão leitora com atenção.",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M02_A04", "M02_A05"],
    topics: [
      "Diferença entre decodificar palavras e compreender o texto",
      "O que caracteriza a hiperlexia na leitura",
      "Perfis distintos de dificuldade na leitura",
      "O que observar no dia a dia escolar e familiar",
    ],
    script: [],
    audioUrl: "/audio/podcasts/como-a-hiperlexia-faz-ler-sem-entender.m4a",
    simulated: false,
  },
  {
    slug: "lentes-coloridas-na-sindrome-de-irlen",
    number: 2,
    title: "Lentes coloridas na Síndrome de Irlen",
    summary:
      "Queixas visuais na leitura geram muitas dúvidas em famílias e escolas. Uma conversa direta sobre a Síndrome de Irlen, o uso de lentes coloridas e o que considerar na avaliação.",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M03_A01", "M03_A02"],
    topics: [
      "Queixas visuais que aparecem durante a leitura",
      "O que se discute sobre a Síndrome de Irlen",
      "O uso de lentes e lâminas coloridas",
      "Importância de encaminhar para avaliação especializada",
    ],
    script: [],
    audioUrl: "/audio/podcasts/lentes-coloridas-na-sindrome-de-irlen.m4a",
    simulated: false,
  },
  {
    slug: "o-treino-de-processamento-auditivo-realmente-funciona",
    number: 3,
    title: "O treino de processamento auditivo realmente funciona?",
    summary:
      "Ouvir bem não significa processar o som com facilidade em ambientes ruidosos. Entenda o papel da avaliação e do treino do processamento auditivo central (PAC).",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M03_A03", "M03_A04"],
    topics: [
      "O que é o processamento auditivo central (PAC)",
      "Como o ruído na sala de aula interfere na compreensão",
      "O papel do treino auditivo no acompanhamento fonoaudiológico",
      "Quando observar sinais e buscar avaliação auditiva",
    ],
    script: [],
    audioUrl: "/audio/podcasts/o-treino-de-processamento-auditivo-realmente-funciona.m4a",
    simulated: false,
  },
  {
    slug: "sinapses-e-redes-neurais-no-aprendizado",
    number: 4,
    title: "Sinapses e redes neurais no aprendizado",
    summary:
      "Como o cérebro constrói e fortalece conexões quando a criança aprende a ler e escrever. Uma explicação acessível sobre sinapses, redes neurais e aprendizagem.",
    courseSlug: COURSE_SLUG,
    lessonCodes: ["M01_A01", "M04_A01"],
    topics: [
      "Como funcionam as sinapses e as redes neurais",
      "Por que a prática orientada fortalece a aprendizagem",
      "Relação entre atenção, memória e consolidação do aprendizado",
      "O papel do ambiente escolar e familiar nesse processo",
    ],
    script: [],
    audioUrl: "/audio/podcasts/sinapses-e-redes-neurais-no-aprendizado.m4a",
    simulated: false,
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
