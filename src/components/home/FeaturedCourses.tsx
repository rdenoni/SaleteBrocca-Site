import { CourseCard } from "@/components/courses/CourseCard";
import type { Course } from "@/types/content";
import styles from "./FeaturedCourses.module.css";

interface FeaturedCoursesProps {
  courses: readonly Course[];
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  return (
    <section className={styles.section} aria-labelledby="cursos-titulo">
      <div className="container">
        <header className={styles.head}>
          <h2 id="cursos-titulo" className={styles.title}>
            Cursos em destaque
          </h2>
        </header>
        <div className={styles.list}>
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
