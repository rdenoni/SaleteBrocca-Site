import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/CourseCard";
import { PageBanner } from "@/components/layout/PageBanner";
import { FaqList } from "@/components/ui/FaqList";
import { getCourses } from "@/lib/content/courses";
import { FAQ_SECTION_ID, FAQ_TITLE, getCourseFaq } from "@/lib/content/faq";
import styles from "./cursos.module.css";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos de Maria Salete Brocca Denoni para pais, professores e profissionais que acompanham crianças em idade escolar.",
};

/* Catálogo: só cursos reais. Filtros entram quando houver mais de um curso. */
export default function CoursesPage() {
  const courses = getCourses();
  const faqCourse = courses.length === 1 ? courses[0] : undefined;
  return (
    <>
      <PageBanner
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
      {/* Um curso só, por enquanto: as dúvidas completas dele ficam aqui (a Home mostra um recorte e aponta para cá). */}
      {faqCourse && (
        <section id={FAQ_SECTION_ID} className={styles.faq} aria-labelledby="duvidas-titulo">
          <div className={`container ${styles.faqLayout}`}>
            <header className={styles.faqHead}>
              <h2 id="duvidas-titulo" className={styles.title}>
                {FAQ_TITLE}
              </h2>
              <span className="rule" aria-hidden="true" />
            </header>
            <FaqList items={getCourseFaq(faqCourse)} />
          </div>
        </section>
      )}
    </>
  );
}
