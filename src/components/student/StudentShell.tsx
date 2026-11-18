import Link from "next/link";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { signOut } from "@/app/area-do-aluno/auth-actions";
import { Button } from "@/components/ui/Button";
import { isDemoMode } from "@/lib/content/student";
import styles from "./StudentShell.module.css";

export type StudentSection = "inicio" | "cursos" | "materiais";

const SECTIONS: readonly { id: StudentSection; label: string; href: string }[] = [
  { id: "inicio", label: "Início", href: "/area-do-aluno" },
  { id: "cursos", label: "Meus cursos", href: "/area-do-aluno/cursos" },
  { id: "materiais", label: "Materiais", href: "/area-do-aluno/materiais" },
];

interface StudentShellProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  /** Seção destacada na sub-navegação. */
  active?: StudentSection;
  /** A página atual é filha da seção ativa (ex.: uma aula dentro de Meus cursos): aria-current="true", não "page". */
  activeIsAncestor?: boolean;
  children: ReactNode;
}

/* Moldura das telas internas da Área do Aluno: banner, sub-navegação e aviso de demonstração (ou botão "Sair" com login real). */
export function StudentShell({
  title,
  eyebrow = "Área do Aluno",
  subtitle,
  active,
  activeIsAncestor = false,
  children,
}: StudentShellProps) {
  const demo = isDemoMode();
  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} subtitle={subtitle} size="compact" />
      <div className={`container ${styles.shell}`}>
        <div className={styles.bar}>
          <nav aria-label="Seções da Área do Aluno" className={styles.nav}>
            <ul>
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className={styles.tab}
                    aria-current={section.id === active ? (activeIsAncestor ? "true" : "page") : undefined}
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {demo ? (
            <p className={styles.demo} role="note">
              <Info aria-hidden="true" />
              <span>
                <strong>Demonstração.</strong> O login ainda não está ativo e o progresso mostrado é um exemplo.
              </span>
            </p>
          ) : (
            <form action={signOut} className={styles.signOut}>
              <Button type="submit" variant="outline">
                Sair
              </Button>
            </form>
          )}
        </div>
        {children}
      </div>
    </>
  );
}
