import type { Testimonial as TestimonialData } from "@/types/content";
import { EvaluationForm } from "./EvaluationForm";
import { Testimonial } from "./Testimonial";
import styles from "./EvaluationSection.module.css";

interface EvaluationSectionProps {
  testimonial: TestimonialData;
}

/* Duas colunas assimétricas da referência: avaliação (branco, 48%) e depoimento (navy, 52%). */
export function EvaluationSection({ testimonial }: EvaluationSectionProps) {
  return (
    <section className={styles.section} id="avaliacao" aria-label="Avaliação e depoimento">
      <div className={styles.form}>
        <EvaluationForm />
      </div>
      <div className={styles.testimonial} data-surface="dark">
        <Testimonial testimonial={testimonial} />
      </div>
    </section>
  );
}
