import Image from "next/image";
import { Button } from "@/components/ui/Button";
import styles from "./AboutPreview.module.css";

/* Texto real (FAZER.txt e Paleta.txt da cliente). Retrato provisório em 384px. */
export function AboutPreview() {
  return (
    <section className={styles.section} aria-labelledby="sobre-titulo">
      <div className={`container ${styles.grid}`}>
        <div className={styles.photo}>
          <Image
            src="/images/about/salete-retrato.jpg"
            alt="Maria Salete Brocca Denoni sorrindo, ao ar livre"
            width={384}
            height={384}
            sizes="(max-width: 1099px) 80vw, 400px"
          />
        </div>
        <div className={styles.text}>
          <p className="eyebrow">Sobre</p>
          <h2 id="sobre-titulo" className={styles.title}>
            Maria Salete Brocca Denoni
          </h2>
          <span className={`rule ${styles.rule}`} aria-hidden="true" />
          <p className={styles.body}>Sou fonoaudióloga clínica e tenho especialização em dificuldade de aprendizagem.</p>
          <p className={styles.body}>
            Comecei minha carreira como educadora, atuando em diversas unidades escolares. Formei-me em fonoaudiologia
            em 1998 e, em 2001, concluí o curso complementar de neurofisiologia.
          </p>
          <Button href="/sobre" variant="outline">
            Conheça minha trajetória
          </Button>
        </div>
      </div>
    </section>
  );
}
