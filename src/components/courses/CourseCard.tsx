import Image from "next/image";
import { CirclePlay, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { countLessons } from "@/lib/content/courses";
import type { Course } from "@/types/content";
import styles from "./CourseCard.module.css";

interface CourseCardProps {
  course: Course;
}

/* Só metadados confirmados (módulos e aulas). Preço, carga horária e certificado ficam ocultos até a cliente confirmar. */
export function CourseCard({ course }: CourseCardProps) {
  const lessons = countLessons(course);
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image src={course.image} alt={course.imageAlt} fill sizes="(max-width: 767px) 100vw, 600px" />
        <span className={styles.badge}>Curso online</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.text}>{course.audience}</p>
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
        <Button href={`/cursos/${course.slug}`} variant="primary" className={styles.cta}>
          Ver curso
        </Button>
      </div>
    </article>
  );
}
