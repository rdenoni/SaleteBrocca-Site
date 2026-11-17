import type { Testimonial } from "@/types/content";

/* Único depoimento com texto real disponível (site de referência).
   Pendente: autorização de uso e redação final com a cliente. */
const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "Júlia é uma criança que desde pequena tinha muita dificuldade em se comunicar. Com algumas indicações de amigos, a levamos para a Salete. Após alguns métodos adotados por ela, conseguimos perceber uma melhora significativa no aprendizado de Júlia.",
    author: "Daniele Schlichting Fusinato",
    role: "Mãe da paciente",
    photo: "/images/testimonials/daniele-schlichting-fusinato.jpg",
  },
];

/* Todos os depoimentos reais, o destaque sempre primeiro. Hoje há só um; a Home trata 1 ou mais. */
export function getTestimonials(): readonly Testimonial[] {
  return TESTIMONIALS;
}
