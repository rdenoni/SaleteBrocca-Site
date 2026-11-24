import Link from "next/link";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { signOut } from "@/app/area-do-aluno/auth-actions";
import { isDemoMode } from "@/lib/content/student";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { afterBanner } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import styles from "./StudentShell.module.css";

export type StudentSection = "inicio" | "cursos" | "materiais" | "conta";

const SECTIONS: readonly { id: StudentSection; label: string; href: string }[] = [
  { id: "inicio", label: "Início", href: "/area-do-aluno" },
  { id: "cursos", label: "Meus cursos", href: "/area-do-aluno/cursos" },
  { id: "materiais", label: "Materiais", href: "/area-do-aluno/materiais" },
  { id: "conta", label: "Minha conta", href: "/area-do-aluno/conta" },
];

const { duration, stagger } = motionTokens;

/** Quando a barra de seções entra (s): com o subtítulo do banner já subindo. */
function barStart(title: string): number {
  return afterBanner(motionTokens, title);
}

/** Quando o conteúdo da página começa (s, ao montar): a barra de seções já está subindo (ordem de leitura).
    As páginas usam este valor como atraso do primeiro bloco; o resto entra por viewport e espera sozinho. */
export function studentContentStart(title: string): number {
  return barStart(title) + (SECTIONS.length - 1) * stagger.items + duration.quick;
}

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

/* Moldura das telas internas da Área do Aluno: banner, sub-navegação e aviso de demonstração (ou botão "Sair" com login real).
   Movimento (ordem de leitura): banner → barra de seções (abas da esquerda para a direita, depois o aviso ou "Sair") →
   conteúdo da página (começa em studentContentStart). */
export function StudentShell({
  title,
  eyebrow = "Área do Aluno",
  subtitle,
  active,
  activeIsAncestor = false,
  children,
}: StudentShellProps) {
  const demo = isDemoMode();
  const start = barStart(title);
  return (
    <>
      <PageBanner eyebrow={eyebrow} title={title} subtitle={subtitle} size="compact" />
      <div className={`container ${styles.shell}`}>
        <Reveal variant="fade" trigger="mount" delay={start} className={styles.bar}>
          <nav aria-label="Seções da Área do Aluno" className={styles.nav}>
            <Stagger as="ul" trigger="mount" delay={start}>
              {SECTIONS.map((section) => (
                <StaggerItem as="li" variant="fade" key={section.id}>
                  <Link
                    href={section.href}
                    className={styles.tab}
                    aria-current={section.id === active ? (activeIsAncestor ? "true" : "page") : undefined}
                  >
                    {section.label}
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </nav>
          {demo ? (
            <Reveal variant="fade" trigger="mount" delay={start + SECTIONS.length * stagger.items}>
              <p className={styles.demo} role="note">
                <Info aria-hidden="true" />
                <span>
                  <strong>Demonstração.</strong> O login ainda não está ativo e o progresso mostrado é um exemplo.
                </span>
              </p>
            </Reveal>
          ) : (
            <Reveal variant="fade" trigger="mount" delay={start + SECTIONS.length * stagger.items} className={styles.signOut}>
              <form action={signOut}>
                <MotionButton type="submit" variant="outline">
                  Sair
                </MotionButton>
              </form>
            </Reveal>
          )}
        </Reveal>
        {children}
      </div>
    </>
  );
}
