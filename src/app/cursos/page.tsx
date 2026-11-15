import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/CourseCard";
import { PageBanner } from "@/components/layout/PageBanner";
import { getCourses } from "@/lib/content/courses";
import styles from "./cursos.module.css";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos de Maria Salete Brocca Denoni para pais, professores e profissionais que acompanham crianças em idade escolar.",
};

/* Catálogo: só cursos reais. Filtros entram quando houver mais de um curso. */
export default function CoursesPage() {
  const courses = getCourses();
  return (
    <>
      <PageBanner
        eyebrow="Formação"
        title="Cursos"
        subtitle="Para pais, professores e profissionais que acompanham crianças em idade escolar."
        image="/images/hero/crianca-escrevendo.jpg"
        imagePosition="60% 40%"
      />
      <section className={styles.section} aria-labelledby="catalogo-titulo">
        <div className="container">
          <header className={styles.head}>
            <h2 id="catalogo-titulo" className={styles.title}>
              Cursos disponíveis
            </h2>
            <p className={styles.count}>
              {courses.length === 1 ? "1 curso" : `${courses.length} cursos`}
            </p>
          </header>
          <div className={styles.list}>
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
