import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  /** Caminho do site ("/cursos"). O último item é a página atual: aparece sem link. */
  href: string;
}

interface BreadcrumbsProps {
  /** Do nível 1 até a página atual, sem o "Início" (ele entra sozinho). */
  items: readonly BreadcrumbItem[];
  className?: string;
}

const HOME: BreadcrumbItem = { label: "Início", href: "/" };

/* "<" escapado: o JSON vai dentro de <script> e um texto com "</script>" não pode fechar a tag. */
function toJsonLd(trail: readonly BreadcrumbItem[]): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(index < trail.length - 1 ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/* Trilha de navegação das páginas de nível 2 ou mais (Início › Cursos › Curso), com BreadcrumbList para os
   buscadores. A Área do Aluno não usa: ela tem as próprias abas e o "voltar ao curso". */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const trail = [HOME, ...items];
  const lastIndex = trail.length - 1;

  return (
    <nav className={[styles.trail, className].filter(Boolean).join(" ")} aria-label="Trilha de navegação">
      <ol>
        {trail.map((item, index) =>
          index === lastIndex ? (
            <li key={item.href} aria-current="page">
              {item.label}
            </li>
          ) : (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
              <ChevronRight aria-hidden="true" />
            </li>
          ),
        )}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(trail) }} />
    </nav>
  );
}
