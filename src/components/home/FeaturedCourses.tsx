import { DrawRule } from "@/motion/DrawRule";
import { CourseTrail } from "@/motion/gsap/CourseTrail";
import { Reveal } from "@/motion/Reveal";
import { TextReveal } from "@/motion/TextReveal";
import { isCourseAvailable } from "@/lib/content/courses";
import { HOME_COURSES, HOME_SECTION_IDS } from "@/lib/content/home";
import type { Course } from "@/types/content";
import { CourseCard } from "./CourseCard";
import styles from "./FeaturedCourses.module.css";

const TRAIL_TITLE_ID = "trilha-titulo";

interface FeaturedCoursesProps {
  courses: readonly Course[];
}

/* Cursos em destaque: o card do curso e, logo abaixo, a trilha dos módulos (GSAP, scrub; ver CourseTrail).
   A banda da trilha é navy (a trilha usa texto branco) e NÃO tem nenhum ancestral com transform:
   o ScrollTrigger mede e fixa elementos, e um transform no ancestral quebraria isso. */
export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  /* A trilha usa o primeiro curso DISPONÍVEL; cursos "em breve" só ganham o card desabilitado. */
  const featured = courses.find(isCourseAvailable);
  if (!featured) return null;

  return (
    <section id={HOME_SECTION_IDS.courses} className={styles.section} aria-labelledby="cursos-titulo">
      <div className={`container ${styles.top}`}>
        <header className={styles.head}>
          <TextReveal as="h2" id="cursos-titulo" className={styles.title} text={HOME_COURSES.sectionTitle} />
        </header>
        <div className={styles.list}>
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </div>

      <div className={styles.trailBand} data-surface="dark">
        <div className={`container ${styles.trailHead}`}>
          <Reveal>
            <h3 id={TRAIL_TITLE_ID} className={styles.trailTitle}>
              Os {featured.modules.length} módulos do curso
            </h3>
          </Reveal>
          <DrawRule className={styles.trailRule} />
        </div>
        <CourseTrail cardHeadingLevel="h4" labelledBy={TRAIL_TITLE_ID} />
      </div>
    </section>
  );
}
