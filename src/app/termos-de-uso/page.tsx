import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import styles from "./termos-de-uso.module.css";

/* Enquanto for só o aviso de "em preparação", fica fora dos buscadores (como o conteúdo de exemplo). */
export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de uso e de compra do site de Maria Salete Brocca Denoni.",
  robots: { index: false, follow: true },
};

/* Nenhuma cláusula nem prazo é escrito aqui: o texto jurídico é pendência da cliente.
   Marca honesta de informação pendente: nunca preencher com texto inventado. */
export default function TermsOfUsePage() {
  return (
    <>
      <PageBanner title="Termos de uso" size="compact" />

      <div className={`container ${styles.page}`}>
        <div className={styles.column}>
          <p className={styles.notice} role="note">
            <Info aria-hidden="true" />
            <span>Os termos de uso e de compra estão em preparação.</span>
            <span className="pending">A confirmar</span>
          </p>

          <p className={styles.contact}>
            Para saber como seus dados pessoais são tratados, leia a <Link href="/privacidade">política de privacidade</Link>.
            Enquanto os termos não saem, você pode falar com a Salete pela <Link href="/contato">página de contato</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
