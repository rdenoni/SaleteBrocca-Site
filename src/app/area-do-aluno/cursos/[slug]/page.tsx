import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProgressBar } from "@/components/student/ProgressBar";
import { StudentModuleList } from "@/components/student/StudentModuleList";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { COURSES_PATH } from "@/lib/auth-paths";
import { getCourse, getCourses } from "@/lib/content/courses";
import {
  getCourseProgress,
  getEnrolledCourse,
  getStudentProgress,
  lessonHref,
  requireStudentSession,
} from "@/lib/content/student";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import styles from "./curso-aluno.module.css";

const MODULES_TITLE = "Módulos e aulas";
const { duration, stagger } = motionTokens;

interface StudentCoursePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  /* Catálogo inteiro: a matrícula é conferida na página, a cada requisição. */
  return getCourses().map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: StudentCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return course ? { title: `${course.title} | Área do Aluno` } : {};
}

/* Movimento (ordem de leitura): banner (nome do curso) → barra de seções → resumo do progresso (ao montar: a base
   azul, depois "Seu progresso" e a contagem, a barra que cresce e "Continuar aula") → "Módulos e aulas" → módulos de
   cima para baixo, com as aulas do módulo aberto em cascata (por viewport: espera o topo). */
export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const { slug } = await params;
  if (!getCourse(slug)) notFound();
  await requireStudentSession(`/area-do-aluno/cursos/${slug}`);
  /* Sem matrícula ativa não há conteúdo do curso. */
  const course = await getEnrolledCourse(slug);
  if (!course) redirect(COURSES_PATH);

  const progressByCourse = await getStudentProgress();
  const progress = getCourseProgress(course, progressByCourse);
  const start = studentContentStart(course.title);
  /* A base azul se desvela primeiro; o texto começa com ela já subindo. */
  const bodyStart = start + duration.base;

  return (
    <StudentShell eyebrow="Meus cursos" title={course.title} active="cursos" activeIsAncestor>
      <Reveal
        as="section"
        variant="mask"
        trigger="mount"
        delay={start}
        className={styles.summary}
        aria-labelledby="progresso-curso"
      >
        <Stagger className={styles.summaryText} trigger="mount" delay={bodyStart}>
          <StaggerItem>
            <h2 id="progresso-curso" className={styles.summaryTitle}>
              Seu progresso
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className={styles.count}>
              <strong>{progress.completed}</strong> de {progress.total} aulas · {progress.percent}%
            </p>
          </StaggerItem>
        </Stagger>
        {/* StaggerItem (e não Reveal): o preenchimento da barra herda o atraso que o Stagger passa ao item. */}
        <Stagger trigger="mount" delay={bodyStart + 2 * stagger.items}>
          <StaggerItem>
            <ProgressBar percent={progress.percent} label={`Progresso em ${course.title}`} onTint />
          </StaggerItem>
        </Stagger>
        {progress.current && (
          <Reveal trigger="mount" delay={bodyStart + 3 * stagger.items} className={styles.cta}>
            <MotionButton href={lessonHref(course.slug, progress.current)} variant="primary">
              Continuar aula
            </MotionButton>
          </Reveal>
        )}
      </Reveal>

      <section aria-labelledby="modulos-aulas">
        <TextReveal as="h2" id="modulos-aulas" className={styles.heading} text={MODULES_TITLE} />
        <StudentModuleList
          course={course}
          progress={progressByCourse}
          openModule={progress.current?.moduleNumber}
          delay={afterTitle(motionTokens, MODULES_TITLE)}
        />
      </section>
    </StudentShell>
  );
}
