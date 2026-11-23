import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { isCourseAvailable } from "@/lib/content/courses";
import type { Course } from "@/types/content";
import styles from "./ProductCard.module.css";

interface ShopCourseCardProps {
  course: Course;
}

/* Vitrine de curso na Loja: a compra fica em /cursos/[slug]. Curso "em breve" aparece sem link, sem elevação. */
export function ShopCourseCard({ course }: ShopCourseCardProps) {
  const available = isCourseAvailable(course);

  return (
    <article
      className={styles.card}
      data-status={available ? "available" : "coming-soon"}
      data-linked={available ? "true" : undefined}
    >
      <div className={styles.media}>
        <Image src={course.image} alt={course.imageAlt} fill sizes="(max-width: 767px) 100vw, 400px" />
        {!available && <span className={styles.statusBadge}>Em breve</span>}
      </div>
      <div className={styles.body}>
        <span className={styles.chip}>Curso online</span>
        <h3 className={styles.title}>
          {available ? (
            <Link href={`/cursos/${course.slug}`} className={styles.cardLink}>
              {course.title}
            </Link>
          ) : (
            course.title
          )}
        </h3>
        <div className={styles.footer}>
          {available ? (
            <>
              <p className={styles.price}>
                {course.commercial.price ?? <span className="pending">A confirmar</span>}
              </p>
              <span className={styles.more} aria-hidden="true">
                Ver detalhes
                <ArrowRight size={16} />
              </span>
            </>
          ) : (
            <p className={styles.unavailable}>Indisponível no momento</p>
          )}
        </div>
      </div>
    </article>
  );
}
