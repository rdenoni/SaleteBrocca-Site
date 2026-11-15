import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Play } from "lucide-react";
import { CompleteLessonButton } from "@/components/student/CompleteLessonButton";
import { LessonTabs } from "@/components/student/LessonTabs";
import { StudentModuleList } from "@/components/student/StudentModuleList";
import { StudentShell } from "@/components/student/StudentShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  findLesson,
  getEnrolledCourse,
  getEnrolledCourses,
  getLessonRefs,
  getLessonStatus,
  lessonHref,
} from "@/lib/content/student";
import styles from "./player.module.css";

interface LessonPageProps {
  params: Promise<{ slug: string; aula: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string; aula: string }[] {
  return getEnrolledCourses().flatMap((course) =>
    getLessonRefs(course).map((lesson) => ({ slug: course.slug, aula: lesson.slug })),
  );
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, aula } = await params;
  const course = getEnrolledCourse(slug);
  const location = course ? findLesson(course, aula) : undefined;
  return location ? { title: `${location.lesson.title} | Área do Aluno` } : {};
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, aula } = await params;
  const course = getEnrolledCourse(slug);
  const location = course ? findLesson(course, aula) : undefined;
  if (!course || !location) notFound();

  const { lesson, previous, next } = location;
  const position = `Módulo ${lesson.moduleNumber} · Aula ${lesson.numberInModule}`;

  return (
    <StudentShell eyebrow={position} title={lesson.title} active="cursos" activeIsAncestor>
      <Link href={`/area-do-aluno/cursos/${course.slug}`} className={styles.back}>
        <ChevronLeft aria-hidden="true" />
        Voltar ao curso
      </Link>

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* Placeholder do vídeo: o serviço de vídeo ainda não foi definido. */}
          <figure className={styles.player} data-surface="dark">
            <span className={styles.play} aria-hidden="true">
              <Play />
            </span>
            <figcaption className={styles.screenText}>O vídeo desta aula será exibido aqui.</figcaption>
          </figure>

          <div className={styles.actions}>
            {previous ? (
              <Button href={lessonHref(course.slug, previous)} variant="outline">
                Aula anterior
              </Button>
            ) : (
              <span />
            )}
            <CompleteLessonButton initialCompleted={getLessonStatus(course.slug, lesson.code) === "completed"} />
            {next ? (
              <Button href={lessonHref(course.slug, next)} variant="primary">
                Próxima aula
              </Button>
            ) : (
              <span />
            )}
          </div>
          <p className={styles.saveNote}>O progresso será salvo automaticamente quando a Área do Aluno estiver ativa.</p>

          <LessonTabs
            label="Sobre a aula"
            tabs={[
              {
                id: "descricao",
                label: "Descrição",
                content: (
                  <>
                    <p>
                      Esta aula faz parte do <strong>Módulo {lesson.moduleNumber}: {lesson.moduleTitle}</strong>.
                    </p>
                    {lesson.moduleSummary && <p>No módulo: {lesson.moduleSummary}</p>}
                  </>
                ),
              },
              {
                id: "materiais",
                label: "Materiais da aula",
                content: (
                  <EmptyState
                    icon={<FileText aria-hidden="true" />}
                    title="Nenhum material nesta aula"
                    text="Quando houver arquivos de apoio, eles aparecerão aqui."
                  />
                ),
              },
              {
                id: "anotacoes",
                label: "Anotações",
                content: (
                  <p>
                    Espaço para as suas anotações durante a aula. <span className="pending">A confirmar</span>
                  </p>
                ),
              },
            ]}
          />
        </div>

        <aside className={styles.sidebar} aria-labelledby="lista-aulas">
          <h2 id="lista-aulas" className={styles.sidebarTitle}>
            Aulas do curso
          </h2>
          <StudentModuleList course={course} currentSlug={lesson.slug} compact />
        </aside>
      </div>
    </StudentShell>
  );
}
