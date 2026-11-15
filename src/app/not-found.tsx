import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

const SHORTCUTS = [
  { label: "Cursos", href: "/cursos" },
  { label: "Conteúdo", href: "/conteudo" },
  { label: "Contato", href: "/contato" },
] as const;

/* Usada por qualquer endereço inexistente e por notFound() nas rotas dinâmicas. */
export default function NotFound() {
  return (
    <>
      <PageBanner
        eyebrow="Erro 404"
        title="Página não encontrada"
        subtitle="O endereço pode ter mudado ou esta página ainda não existe."
        size="compact"
      />

      <div className={`container ${styles.page}`}>
        {/* Número gigante translúcido: o grafismo tipográfico da referência. */}
        <span className={styles.code} aria-hidden="true">
          404
        </span>
        <div className={styles.content}>
          <p className={styles.text}>Confira se o endereço foi digitado certo ou comece pela página inicial.</p>
          <Button href="/" variant="primary">
            Voltar para o início
          </Button>
          <nav className={styles.shortcuts} aria-label="Atalhos">
            <p className={styles.shortcutsTitle}>Ou vá direto para</p>
            <ul>
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.href}>
                  <Link href={shortcut.href}>{shortcut.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
