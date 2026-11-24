import type { Metadata } from "next";
import { CourseCard } from "@/components/courses/CourseCard";
import { PageBanner } from "@/components/layout/PageBanner";
import { FaqList } from "@/components/ui/FaqList";
import { DrawRule } from "@/motion/DrawRule";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterBanner, afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import { getCatalogCourses, getCourses } from "@/lib/content/courses";
import { FAQ_SECTION_ID, FAQ_TITLE, getCourseFaq } from "@/lib/content/faq";
import styles from "./cursos.module.css";

export const metadata: Metadata = {
  title: "Cursos",
  description:
    "Cursos de Maria Salete Brocca Denoni para pais, professores e profissionais que acompanham crianças em idade escolar.",
  /* Canônico fixo: evita duplicatas quando a página é aberta com query string. */
  alternates: { canonical: "/cursos" },
};

const CATALOG_TITLE = "Nossos cursos";
const CATALOG_START = afterBanner(motionTokens, "Cursos");
const FAQ_START = afterTitle(motionTokens, FAQ_TITLE);

/* Catálogo: só cursos reais. Filtros entram quando houver mais de um curso. */
export default function CoursesPage() {
  const courses = getCourses();
  const catalog = getCatalogCourses();
  const comingSoon = catalog.length - courses.length;
  const faqCourse = courses.length === 1 ? courses[0] : undefined;
  return (
    <>
      <PageBanner
        title="Cursos"
        subtitle="Para pais, professores e profissionais que acompanham crianças em idade escolar."
      />
      <section className={styles.section} aria-labelledby="catalogo-titulo">
        <div className="container">
          <header className={styles.head}>
            <TextReveal as="h2" id="catalogo-titulo" className={styles.title} text={CATALOG_TITLE} />
            <Reveal as="p" delay={CATALOG_START} className={styles.count}>
              {courses.length === 1 ? "1 curso disponível" : `${courses.length} cursos disponíveis`}
              {comingSoon > 0 && ` · ${comingSoon} em breve`}
            </Reveal>
          </header>
          <Stagger className={styles.list} pace="cards" delay={CATALOG_START + motionTokens.stagger.items}>
            {catalog.map((course) => (
              <StaggerItem key={course.slug}>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      {/* Um curso só, por enquanto: as dúvidas completas dele ficam aqui (a Home mostra um recorte e aponta para cá). */}
      {faqCourse && (
        <section id={FAQ_SECTION_ID} className={styles.faq} aria-labelledby="duvidas-titulo">
          <div className={`container ${styles.faqLayout}`}>
            <header className={styles.faqHead}>
              <TextReveal as="h2" id="duvidas-titulo" className={styles.title} text={FAQ_TITLE} />
              <DrawRule delay={FAQ_START} />
            </header>
            <FaqList items={getCourseFaq(faqCourse)} />
          </div>
        </section>
      )}
    </>
  );
}
