import Image from "next/image";
import { Button } from "@/components/ui/Button";
import styles from "./Hero.module.css";

/* Hero da referência: foto grande em P&B fundida ao azul (soft-light), título à esquerda,
   fio ciano e CTA fantasma. Um único slide por enquanto: os indicadores do carrossel
   só aparecem quando houver mais de um slide real. */
export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-surface="photo">
      <Image
        src="/images/hero/crianca-escrevendo.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.photo}
      />
      <div className={styles.inner}>
        <h1 id="hero-title" className={styles.title}>
          Conheça nossos cursos
        </h1>
        <span className={`rule ${styles.rule}`} aria-hidden="true" />
        <p className={styles.text}>
          Formação, conhecimento e ferramentas para compreender as dificuldades de aprendizagem.
        </p>
        <Button href="/cursos" variant="ghost">
          Explorar cursos
        </Button>
      </div>
    </section>
  );
}
