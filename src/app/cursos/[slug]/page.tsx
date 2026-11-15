import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, CirclePlay, Info, Layers } from "lucide-react";
import { CommercialInfo } from "@/components/courses/CommercialInfo";
import { ModuleList } from "@/components/courses/ModuleList";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { countLessons, getCourse, getCourses } from "@/lib/content/courses";
import styles from "./curso.module.css";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: course.title, description: course.audience };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const lessons = countLessons(course);
  const purchaseHref = `/cursos/${course.slug}/compra`;

  return (
    <>
      <PageBanner eyebrow="Curso online" title={course.title} image={course.image} imagePosition="70% 30%">
        <div className={styles.bannerMeta}>
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
          <Button href={purchaseHref} variant="accent">
            Quero me inscrever
          </Button>
        </div>
      </PageBanner>

      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <CommercialInfo course={course} />
        </div>

        <div className={styles.main}>
          <section aria-labelledby="para-quem">
            <p className="eyebrow">Público</p>
            <h2 id="para-quem" className={styles.heading}>
              Para quem é
            </h2>
            <p className={styles.lead}>{course.audience}</p>
          </section>

          <section aria-labelledby="sobre-curso">
            <p className="eyebrow">Proposta</p>
            <h2 id="sobre-curso" className={styles.heading}>
              Sobre o curso
            </h2>
            {course.description.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className={styles.reading}>
                {paragraph}
              </p>
            ))}
            <aside className={styles.notice} aria-label="Importante">
              <Info aria-hidden="true" />
              <p>{course.notice}</p>
            </aside>
          </section>

          <section aria-labelledby="aprender">
            <p className="eyebrow">Ao final do curso</p>
            <h2 id="aprender" className={styles.heading}>
              Você estará mais preparado para
            </h2>
            <ul className={styles.outcomes}>
              {course.outcomes.map((outcome) => (
                <li key={outcome}>
                  <Check aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="conteudo-curso">
            <p className="eyebrow">Conteúdo</p>
            <h2 id="conteudo-curso" className={styles.heading}>
              Módulos e aulas
            </h2>
            <p className={styles.moduleSummary}>
              {course.modules.length} módulos · {lessons} aulas
            </p>
            <ModuleList modules={course.modules} openModule={0} />
          </section>

          <section className={styles.teacher} aria-labelledby="professora">
            <div className={styles.teacherFigure}>
              <Image
                src="/images/about/salete-retrato.jpg"
                alt="Maria Salete Brocca Denoni"
                width={384}
                height={384}
                sizes="120px"
                className={styles.teacherPhoto}
              />
            </div>
            <div>
              <p className="eyebrow">Professora</p>
              <h2 id="professora" className={styles.teacherName}>
                Maria Salete Brocca Denoni
              </h2>
              <p className={styles.teacherText}>
                Fonoaudióloga clínica, com especialização em dificuldade de aprendizagem.
              </p>
              <LinkArrow href="/sobre">Conheça a trajetória</LinkArrow>
            </div>
          </section>
        </div>
      </div>

      <StickyActionBar>
        <Button href={purchaseHref} variant="primary">
          Quero me inscrever
        </Button>
      </StickyActionBar>
    </>
  );
}
