import type { FooterColumn, NavItem } from "@/types/content";
import { getArticleCategories } from "./articles";
import { STUDENT_AREA } from "./site";

/* Rodapé: 4 colunas enxutas, cada uma com no máximo 3 linhas.
   As categorias saem dos dados reais do site. */
export function getFooterColumns(): FooterColumn[] {
  const categoryLinks: NavItem[] = getArticleCategories().map((category) => ({
    label: category.label,
    href: `/conteudo/categoria/${category.slug}`,
  }));

  return [
    {
      title: "Atendimento",
      links: [
        { label: "Marcar avaliação", href: "/avaliacao" },
        { label: "Sobre a Salete", href: "/sobre" },
        { label: "Contato", href: "/contato" },
      ],
    },
    {
      title: "Cursos",
      links: [
        { label: "Catálogo", href: "/cursos" },
        { label: "Dúvidas frequentes", href: "/cursos#duvidas" },
        STUDENT_AREA,
      ],
    },
    {
      title: "Conteúdo",
      links: [
        { label: "Todos os conteúdos", href: "/conteudo" },
        { label: "Podcast", href: "/conteudo/podcast" },
        ...categoryLinks.slice(0, 1),
      ],
    },
    {
      title: "Loja e temas",
      links: [{ label: "Loja", href: "/loja" }, ...categoryLinks.slice(1, 3)],
    },
  ];
}
