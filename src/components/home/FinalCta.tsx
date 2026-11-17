import Image from "next/image";
import { Button } from "@/components/ui/Button";
import styles from "./FinalCta.module.css";

/* Chamada final em fundo branco com as peças da marca (o footer é navy:
   nunca duas seções navy seguidas). Texto proposto — validar com a cliente. */
export function FinalCta() {
  return (
    <section className={styles.section} aria-labelledby="cta-titulo">
      <Image
        src="/brand/patterns/grafismo-pecas.png"
        alt=""
        width={1921}
        height={1081}
        className={styles.pieces}
        sizes="(max-width: 767px) 120vw, 60vw"
      />
      <div className={`container ${styles.inner}`}>
        <h2 id="cta-titulo" className={styles.title}>
          Marque uma avaliação
        </h2>
        <p className={styles.text}>Converse com a Salete sobre as dificuldades de aprendizagem.</p>
        <div className={styles.actions}>
          <Button href="/avaliacao" variant="primary">
            Marcar avaliação
          </Button>
          <Button href="/cursos" variant="outline">
            Explorar cursos
          </Button>
        </div>
      </div>
    </section>
  );
}
