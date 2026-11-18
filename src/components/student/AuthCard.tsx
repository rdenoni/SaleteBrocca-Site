import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  title: string;
  lead: string;
  /** Formulário ou mensagem principal. */
  children?: ReactNode;
  /** Nota pequena abaixo do formulário. */
  note?: ReactNode;
  /** Rodapé do cartão, separado por uma linha (links de apoio). */
  footer?: ReactNode;
}

/* Cartão branco sobre azul-claro com as peças da marca (wireframe 3.12): login, recuperar e definir senha. */
export function AuthCard({ title, lead, children, note, footer }: AuthCardProps) {
  return (
    <section className={styles.page} aria-labelledby="page-title">
      <Image
        src="/brand/patterns/grafismo-pecas.png"
        alt=""
        width={1921}
        height={1081}
        priority
        className={styles.pieces}
        sizes="(max-width: 767px) 120vw, 60vw"
      />
      <div className={`container ${styles.inner}`}>
        <div className={styles.card}>
          <h1 id="page-title" className={styles.title}>
            {title}
          </h1>
          <span className="rule" aria-hidden="true" />
          <p className={styles.lead}>{lead}</p>
          {children}
          {note && <p className={styles.note}>{note}</p>}
          <p className={styles.privacy}>
            Veja como tratamos seus dados na <Link href="/privacidade">política de privacidade</Link>.
          </p>
          {footer && <p className={styles.alt}>{footer}</p>}
        </div>
      </div>
    </section>
  );
}
