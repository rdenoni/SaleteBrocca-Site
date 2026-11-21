import Image from "next/image";
import { CirclePlay, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { countLessons, isCourseAvailable } from "@/lib/content/courses";
import type { Course } from "@/types/content";
import styles from "./CourseCard.module.css";

interface CourseCardProps {
  course: Course;
}

/* Só metadados confirmados (módulos e aulas). Preço, carga horária e certificado ficam ocultos até a cliente confirmar. */
export function CourseCard({ course }: CourseCardProps) {
  const available = isCourseAvailable(course);
  const lessons = countLessons(course);
  return (
    <article id={`curso-${course.slug}`} className={`${styles.card} ${available ? "" : styles.soon}`}>
      <div className={styles.media}>
        <Image src={course.image} alt={course.imageAlt} fill sizes="(max-width: 767px) 100vw, 600px" />
        <span className={styles.badge}>{available ? "Curso online" : "Em breve"}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.text}>{course.audience}</p>
        {available ? (
          <>
            <ul className={styles.meta}>
              <li>
                <Layers aria-hidden="true" />
                {course.modules.length} módulos
              </li>
              <li>
                <CirclePlay aria-hidden="true" />
                {lessons} aulas
              </li>
            </ul>
            <Button href={`/cursos/${course.slug}`} variant="primary" className={styles.cta} aria-label={`Ver curso: ${course.title}`}>
              Ver curso
            </Button>
          </>
        ) : (
          <>
            <p className={styles.soonNote}>Curso em preparação. Ainda não está disponível para inscrição.</p>
            <button type="button" className={styles.disabled} disabled>
              Em breve
            </button>
          </>
        )}
      </div>
    </article>
  );
}
