import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/student/LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar na Área do Aluno",
};

/* Cartão branco sobre azul-claro com as peças da marca (wireframe 3.12). */
export default function LoginPage() {
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
            Área do Aluno
          </h1>
          <span className="rule" aria-hidden="true" />
          <p className={styles.lead}>Entre com o e-mail usado na inscrição.</p>
          <LoginForm />
          <p className={styles.note}>
            Recuperação de senha e criação de conta serão ativadas junto com o login.
          </p>
          <p className={styles.alt}>
            Ainda não é aluno? <Link href="/cursos">Conheça os cursos</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
