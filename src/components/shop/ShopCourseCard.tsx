import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { isCourseAvailable } from "@/lib/content/courses";
import type { Course } from "@/types/content";
import styles from "./ProductCard.module.css";

interface ShopCourseCardProps {
  course: Course;
}

/* Vitrine de curso na Loja: a compra fica em /cursos/[slug]. Curso "em breve" aparece desabilitado, sem link. */
export function ShopCourseCard({ course }: ShopCourseCardProps) {
  const available = isCourseAvailable(course);

  return (
    <article className={styles.card} data-status={available ? "available" : "coming-soon"}>
      <div className={styles.media}>
        <Image src={course.image} alt={course.imageAlt} fill sizes="(max-width: 767px) 100vw, 400px" />
        <span className={styles.badge}>Curso online</span>
        {!available && <span className={styles.statusBadge}>Em breve</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.summary}>{course.audience}</p>
        {available ? (
          course.commercial.price && (
            <p className={styles.price}>
              <span>Preço</span>
              <strong>{course.commercial.price}</strong>
            </p>
          )
        ) : (
          <p className={styles.unavailable}>Indisponível no momento</p>
        )}
        {available ? (
          <Button href={`/cursos/${course.slug}`} variant="primary" className={styles.cta}>
            Ver curso
          </Button>
        ) : (
          <Button variant="primary" className={styles.cta} disabled aria-disabled="true">
            Em breve
          </Button>
        )}
      </div>
    </article>
  );
}
