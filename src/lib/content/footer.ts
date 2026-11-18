import type { FooterColumn, NavItem } from "@/types/content";
import { getArticleCategories } from "./articles";
import { getCourses } from "./courses";
import { STUDENT_AREA } from "./site";

/* Rodapé aprovado: três colunas, sem âncoras (#). Os links de curso e de categoria saem dos dados do site,
   então um curso ou uma categoria nova aparece aqui sozinho. Curso "em breve" não tem página: fica de fora do
   rodapé (só links reais) e aparece desabilitado no catálogo (/cursos), na Home e na Loja.
   Módulo separado de site.ts de propósito: site.ts é importado por componentes de cliente (cabeçalho, menu, rodapé)
   e os getters de conteúdo vão virar assíncronos com o CMS. Só o layout (servidor) importa este arquivo e passa as
   colunas prontas ao Footer por props. */
export function getFooterColumns(): FooterColumn[] {
  const courseLinks: NavItem[] = getCourses().map((course) => ({
    label: course.title,
    href: `/cursos/${course.slug}`,
  }));
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
      links: [{ label: "Catálogo", href: "/cursos" }, ...courseLinks, { label: "Loja", href: "/loja" }, STUDENT_AREA],
    },
    {
      title: "Conteúdo",
      links: [{ label: "Todos os conteúdos", href: "/conteudo" }, ...categoryLinks],
    },
  ];
}
