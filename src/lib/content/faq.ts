import type { Course, CourseCommercialInfo, FaqItem } from "@/types/content";
import { countLessons } from "./courses";
import { PROFILE_FORMATION, PROFILE_NAME } from "./profile";

/* Perguntas frequentes do curso. Regra do projeto: nenhuma resposta é escrita à mão com dado novo.
   Tudo vem do roteiro oficial (courses.ts) e do perfil (profile.ts); o que ainda não foi confirmado
   (valor, carga horária, certificado, acesso) aparece como "ainda não divulgado" e se atualiza sozinho
   quando a cliente preencher `commercial` em courses.ts. */

/** Âncora da seção de dúvidas (a mesma na Home, em /cursos e na página do curso). */
export const FAQ_SECTION_ID = "duvidas";

export const FAQ_TITLE = "Dúvidas frequentes";

/** Na Home: as perguntas de quem ainda está conhecendo o curso. As demais ficam em /cursos. */
const HOME_FAQ_IDS = ["para-quem", "diagnostico", "formato", "organizacao"] as const;

const COMMERCIAL_LABELS: Record<keyof CourseCommercialInfo, string> = {
  price: "Investimento",
  workload: "Carga horária",
  certificate: "Certificado",
  access: "Tempo de acesso",
};

const COMMERCIAL_ORDER: readonly (keyof CourseCommercialInfo)[] = ["price", "workload", "certificate", "access"];

function joinLabels(labels: readonly string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function lessonLabel(count: number): string {
  return count === 1 ? "1 aula" : `${count} aulas`;
}

/* Valor, carga horária, certificado e acesso: lista o que já foi confirmado e diz com clareza o que falta. */
function commercialItem(course: Course): FaqItem {
  const confirmed = COMMERCIAL_ORDER.filter((key) => course.commercial[key]);
  const missing = COMMERCIAL_ORDER.filter((key) => !course.commercial[key]).map((key) =>
    COMMERCIAL_LABELS[key].toLowerCase(),
  );
  const answer =
    missing.length > 0
      ? [
          `${capitalize(joinLabels(missing))} ${missing.length === 1 ? "ainda não foi divulgado" : "ainda não foram divulgados"}. Assim que estiverem definidos, aparecem na página do curso.`,
        ]
      : [];
  return {
    id: "valor",
    question: "Qual é o valor, a carga horária e há certificado?",
    answer,
    list: confirmed.map((key) => `${COMMERCIAL_LABELS[key]}: ${course.commercial[key]}`),
    link: missing.length > 0 ? { href: "/contato#formulario", label: "Perguntar pelo formulário de contato" } : undefined,
  };
}

function teacherItem(): FaqItem {
  const graduation = PROFILE_FORMATION.find((item) => item.title.includes("Graduação"));
  const specialization = PROFILE_FORMATION.find((item) => item.title.includes("Especialização"));
  const facts = [
    "começou na educação aos 16 anos",
    graduation?.year ? `formou-se em Fonoaudiologia em ${graduation.year}` : null,
    specialization ? "tem especialização em dificuldade de aprendizagem" : null,
  ].filter((fact): fact is string => fact !== null);

  return {
    id: "professora",
    question: "Quem ministra o curso?",
    answer: [`${PROFILE_NAME}, professora e fonoaudióloga clínica. ${capitalize(joinLabels(facts))}.`],
    link: { href: "/sobre", label: "Conheça a trajetória" },
  };
}

export interface CourseFaqOptions {
  /** Na página do próprio curso, o atalho para ela mesma não aparece. */
  onCoursePage?: boolean;
}

export function getCourseFaq(course: Course, { onCoursePage = false }: CourseFaqOptions = {}): FaqItem[] {
  const lessons = countLessons(course);
  const firstModule = course.modules[0];
  const lastModule = course.modules[course.modules.length - 1];

  const items: FaqItem[] = [
    {
      id: "para-quem",
      question: "Para quem é o curso?",
      answer: [course.audience],
    },
    {
      id: "diagnostico",
      question: "Depois do curso, vou poder fazer diagnósticos?",
      answer: [course.notice],
    },
    {
      id: "aprender",
      question: "O que vou aprender?",
      answer: ["Ao final do curso, você estará mais preparado para:"],
      list: course.outcomes,
    },
    {
      id: "formato",
      question: "Como o curso funciona?",
      answer: [
        `É um curso online, com ${course.modules.length} módulos e ${lessons} aulas. As aulas ficam na Área do Aluno deste site, que você acessa com o seu login.`,
      ],
      link: { href: "/area-do-aluno", label: "Ir para a Área do Aluno" },
    },
    {
      id: "organizacao",
      question: "Como os módulos estão organizados?",
      answer: [
        firstModule && lastModule
          ? `O curso começa pelo módulo ${firstModule.number} (${firstModule.title}) e termina no módulo ${lastModule.number} (${lastModule.title}).`
          : `O curso tem ${course.modules.length} módulos.`,
      ],
      list: course.modules.map(
        (module) => `Módulo ${module.number} · ${module.title} (${lessonLabel(module.lessons.length)})`,
      ),
      link: onCoursePage ? undefined : { href: `/cursos/${course.slug}#conteudo-curso`, label: "Ver todas as aulas" },
    },
    teacherItem(),
    commercialItem(course),
    {
      id: "contato",
      question: "Tenho outra dúvida. Como falo com você?",
      answer: ["Pelo formulário da página de contato. É só escrever a sua pergunta."],
      link: { href: "/contato#formulario", label: "Ir para o formulário" },
    },
  ];

  /* Uma pergunta sem resposta nenhuma não aparece. */
  return items.filter((item) => item.answer.length > 0 || (item.list?.length ?? 0) > 0);
}

/** Recorte da Home: as perguntas de quem está conhecendo o curso, na ordem de HOME_FAQ_IDS. */
export function getHomeFaq(course: Course): FaqItem[] {
  const all = getCourseFaq(course);
  return HOME_FAQ_IDS.map((id) => all.find((item) => item.id === id)).filter(
    (item): item is FaqItem => item !== undefined,
  );
}
