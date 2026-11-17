import type { Testimonial } from "@/types/content";

/* O primeiro é o único depoimento REAL (texto do site de referência), sempre em destaque e sem etiqueta.
   Pendente: autorização de uso e redação final com a cliente.
   Os três seguintes são SIMULADOS: a cliente aprovou a publicação deles para ativar o carrossel da Home enquanto
   não chegam depoimentos reais (textos copiados do laboratório de movimento, genéricos, sem números, diagnósticos
   ou promessas). Por isso ficam sempre marcados: `simulated: true` mostra a etiqueta "Depoimento simulado" na
   interface, os nomes levam "(simulado/a)" e o avatar usa iniciais, sem foto. Nunca remover a marcação.
   REMOVER os três simulados quando chegarem depoimentos reais autorizados. */
const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "Júlia é uma criança que desde pequena tinha muita dificuldade em se comunicar. Com algumas indicações de amigos, a levamos para a Salete. Após alguns métodos adotados por ela, conseguimos perceber uma melhora significativa no aprendizado de Júlia.",
    author: "Daniele Schlichting Fusinato",
    role: "Mãe da paciente",
    photo: "/images/testimonials/daniele-schlichting-fusinato.jpg",
  },
  {
    quote:
      "Durante muito tempo a hora da leitura em casa era cansativa para todos nós. Com as orientações e o acompanhamento, a rotina de estudo ficou mais leve e meu filho passou a se sentir mais confiante diante dos livros.",
    author: "Responsável (simulado)",
    role: "Mãe de aluno",
    initials: "RS",
    avatarTone: "cyan",
    simulated: true,
  },
  {
    quote:
      "O curso me ajudou a olhar com mais atenção para as dificuldades que os alunos apresentam na sala de aula. Hoje consigo planejar as atividades com mais cuidado e conversar melhor com as famílias sobre cada passo.",
    author: "Professora (simulada)",
    role: "Professora do ensino fundamental",
    initials: "PS",
    avatarTone: "light",
    simulated: true,
  },
  {
    quote:
      "Nossa filha ficou mais segura para ler em voz alta e para contar o que aprende na escola. Foi importante sermos ouvidos e receber orientações claras e acolhedoras em cada etapa do acompanhamento.",
    author: "Responsável (simulado)",
    role: "Pai de paciente",
    initials: "RS",
    avatarTone: "cyan",
    simulated: true,
  },
];

/* Todos os depoimentos publicados, o real sempre primeiro. A Home trata 1 ou mais (com 2+ vira carrossel). */
export function getTestimonials(): readonly Testimonial[] {
  return TESTIMONIALS;
}
