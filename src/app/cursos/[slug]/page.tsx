import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, CirclePlay, Info, Layers } from "lucide-react";
import { CommercialInfo } from "@/components/courses/CommercialInfo";
import { ModuleList } from "@/components/courses/ModuleList";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageBanner } from "@/components/layout/PageBanner";
import { Button } from "@/components/ui/Button";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { FaqList } from "@/components/ui/FaqList";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { countLessons, getCourse, getCourses } from "@/lib/content/courses";
import { FAQ_SECTION_ID, FAQ_TITLE, getCourseFaq } from "@/lib/content/faq";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterBanner, afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
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
  const { stagger } = motionTokens;
  const ASIDE_START = afterBanner(motionTokens, course.title);
  const WHO_START = afterTitle(motionTokens, "Para quem é");
  const ABOUT_START = afterTitle(motionTokens, "Sobre o curso");
  const LEARN_START = afterTitle(motionTokens, "Você estará mais preparado para");
  const MODULES_START = afterTitle(motionTokens, "Módulos e aulas");
  const FAQ_START = afterTitle(motionTokens, FAQ_TITLE);

  return (
    <>
      <PageBanner eyebrow="Curso online" title={course.title}>
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

      <div className="container">
        <Breadcrumbs
          items={[
            { label: "Cursos", href: "/cursos" },
            { label: course.title, href: `/cursos/${course.slug}` },
          ]}
        />
      </div>

      <div className={`container ${styles.layout}`}>
        <Reveal as="div" trigger="mount" delay={ASIDE_START} className={styles.aside}>
          <CommercialInfo course={course} />
        </Reveal>

        <div className={styles.main}>
          <section aria-labelledby="para-quem">
            <TextReveal as="h2" id="para-quem" className={styles.heading} text="Para quem é" />
            <Reveal as="p" delay={WHO_START} className={styles.lead}>
              {course.audience}
            </Reveal>
          </section>

          <section aria-labelledby="sobre-curso">
            <TextReveal as="h2" id="sobre-curso" className={styles.heading} text="Sobre o curso" />
            {course.description.map((paragraph, index) => (
              <Reveal as="p" key={paragraph.slice(0, 32)} delay={ABOUT_START + index * stagger.items} className={styles.reading}>
                {paragraph}
              </Reveal>
            ))}
            <Reveal as="aside" delay={ABOUT_START + course.description.length * stagger.items} className={styles.notice} aria-label="Importante">
              <Info aria-hidden="true" />
              <p>{course.notice}</p>
            </Reveal>
          </section>

          <section aria-labelledby="aprender">
            <p className="eyebrow">Ao final do curso</p>
            <TextReveal as="h2" id="aprender" className={styles.heading} text="Você estará mais preparado para" />
            <Stagger as="ul" delay={LEARN_START} className={styles.outcomes}>
              {course.outcomes.map((outcome) => (
                <StaggerItem as="li" key={outcome}>
                  <Check aria-hidden="true" />
                  {outcome}
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          <section aria-labelledby="conteudo-curso">
            <TextReveal as="h2" id="conteudo-curso" className={styles.heading} text="Módulos e aulas" />
            <Reveal as="p" delay={MODULES_START} className={styles.moduleSummary}>
              {course.modules.length} módulos · {lessons} aulas
            </Reveal>
            <ModuleList modules={course.modules} openModule={0} />
          </section>

          <Reveal as="section" className={styles.teacher} aria-labelledby="professora">
            <Reveal variant="mask" trigger="parent" className={styles.teacherFigure}>
              <Image
                src="/images/about/salete-avatar.jpg"
                alt=""
                width={480}
                height={480}
                sizes="120px"
                className={styles.teacherPhoto}
              />
            </Reveal>
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
          </Reveal>

          {/* Wireframe §3.2: dúvidas frequentes no fim da página do curso, antes da barra de inscrição. */}
          <section id={FAQ_SECTION_ID} aria-labelledby="duvidas-titulo">
            <TextReveal as="h2" id="duvidas-titulo" className={styles.heading} text={FAQ_TITLE} />
            <FaqList items={getCourseFaq(course, { onCoursePage: true })} />
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
