import type { Activity, FormationItem } from "@/types/content";

/* Fontes: Manual da Marca TCC (p. 3, "História, valores e voz") e FAZER.txt / Paleta.txt da cliente.
   Nada aqui foi inventado; dados ausentes ficam null (ou em `pending`) e ficam ocultos na página até a cliente confirmar. */

export const PROFILE_NAME = "Maria Salete Brocca Denoni";
export const PROFILE_ROLE = "Professora e fonoaudióloga clínica";

export const PROFILE_INTRO =
  "Sou fonoaudióloga clínica e tenho especialização em dificuldade de aprendizagem.";

export const PROFILE_HISTORY: readonly string[] = [
  "Nasci em São Simão, uma pequena localidade de Criciúma, onde vivi até os 32 anos.",
  "Comecei na educação aos 16 anos, em 1960, numa escola multisseriada, onde cheguei ao cargo de direção.",
  "Aos 32 anos, mudei-me para o Rio de Janeiro e segui como educadora em diversas unidades escolares, até me formar em fonoaudiologia, em 1998. Em 2001, concluí o curso complementar de neurofisiologia.",
  "Desde então, atendo pacientes em consultório e em instituições que precisam da minha presença, como a APAE.",
];

export const PROFILE_FORMATION: readonly FormationItem[] = [
  { year: "1998", title: "Graduação em Fonoaudiologia" },
  { year: "2001", title: "Curso complementar de Neurofisiologia" },
  { year: null, title: "Especialização em Dificuldade de Aprendizagem" },
];

/** Número do registro profissional: null até a cliente confirmar. */
export const PROFILE_CRFA: string | null = null;

export const PROFILE_ACTIVITIES: readonly Activity[] = [
  {
    title: "Consultório particular",
    text: "Atendimento a crianças com dificuldade na aprendizagem, mais especificamente dislexia.",
    icon: "clinic",
    tone: "light",
    pending: "Cidade a confirmar",
  },
  {
    title: "APAE de Cocal do Sul",
    text: "Atendimento a crianças com deficiência intelectual e outras comorbidades, incluindo síndromes raras.",
    icon: "institution",
    tone: "cyan",
  },
  {
    title: "Cursos",
    text: "Cursos presenciais e online para professores e profissionais da área.",
    icon: "courses",
    tone: "blue",
    href: "/cursos",
  },
  {
    title: "Jogos e softwares",
    text: "Projetos paralelos de jogos e softwares que auxiliam a criança no processo de alfabetização.",
    icon: "games",
    tone: "navy",
  },
];

/** Frase-conceito do Manual da Marca TCC. */
export const PROFILE_QUOTE = "Toda criança, independente da dificuldade, tem a capacidade de ler e escrever.";
