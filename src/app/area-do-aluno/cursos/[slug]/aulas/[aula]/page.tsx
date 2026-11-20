import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, FileText, Play } from "lucide-react";
import { CompleteLessonButton } from "@/components/student/CompleteLessonButton";
import { LessonTabs } from "@/components/student/LessonTabs";
import { StudentModuleList } from "@/components/student/StudentModuleList";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { COURSES_PATH } from "@/lib/auth-paths";
import { getCourse, getCourses } from "@/lib/content/courses";
import {
  findLesson,
  getEnrolledCourse,
  getLessonRefs,
  getLessonStatus,
  getStudentProgress,
  isDemoMode,
  lessonHref,
  requireStudentSession,
} from "@/lib/content/student";
import { MotionButton } from "@/motion/MotionButton";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { TextReveal } from "@/motion/TextReveal";
import { afterTitle } from "@/motion/timeline";
import { motionTokens } from "@/motion/tokens";
import styles from "./player.module.css";

const SIDEBAR_TITLE = "Aulas do curso";
const { duration, stagger } = motionTokens;

interface LessonPageProps {
  params: Promise<{ slug: string; aula: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string; aula: string }[] {
  /* Catálogo inteiro: a matrícula é conferida na página, a cada requisição. */
  return getCourses().flatMap((course) =>
    getLessonRefs(course).map((lesson) => ({ slug: course.slug, aula: lesson.slug })),
  );
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, aula } = await params;
  const course = getCourse(slug);
  const location = course ? findLesson(course, aula) : undefined;
  return location ? { title: `${location.lesson.title} | Área do Aluno` } : {};
}

/* Movimento (ordem de leitura): banner (nome da aula) → barra de seções → "Voltar ao curso" → player (ao montar; só
   uma entrada de opacidade curta, o player nunca fica escondido nem esperando) → a lista de aulas à direita (por
   viewport: já está na tela no desktop e espera o topo; no celular entra quando chega) → abaixo da dobra: botões
   (anterior, concluir, próxima), aviso, abas. Dentro da lista: título → módulos → aulas do módulo aberto. */
export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, aula } = await params;
  const catalogCourse = getCourse(slug);
  if (!catalogCourse || !findLesson(catalogCourse, aula)) notFound();
  await requireStudentSession(`/area-do-aluno/cursos/${slug}/aulas/${aula}`);
  /* Sem matrícula ativa não há conteúdo de aula. */
  const course = await getEnrolledCourse(slug);
  const location = course ? findLesson(course, aula) : undefined;
  if (!course || !location) redirect(COURSES_PATH);
  const progress = await getStudentProgress();

  const { lesson, previous, next } = location;
  const start = studentContentStart(lesson.title);
  const position = `Módulo ${lesson.moduleNumber} · Aula ${lesson.numberInModule}`;

  return (
    <StudentShell eyebrow={position} title={lesson.title} active="cursos" activeIsAncestor>
      <Reveal trigger="mount" delay={start}>
        <Link href={`/area-do-aluno/cursos/${course.slug}`} className={styles.back}>
          <ChevronLeft aria-hidden="true" size={18} />
          Voltar ao curso
        </Link>
      </Reveal>

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* Placeholder do vídeo: o serviço de vídeo ainda não foi definido. */}
          <Reveal
            as="figure"
            variant="fade"
            trigger="mount"
            delay={start + stagger.cards}
            className={styles.player}
            data-surface="dark"
          >
            <span className={styles.play} aria-hidden="true">
              <Play />
            </span>
            <figcaption className={styles.screenText}>O vídeo desta aula será exibido aqui.</figcaption>
          </Reveal>

          <Stagger className={styles.actions} pace="items">
            <StaggerItem>
              {previous ? (
                <MotionButton href={lessonHref(course.slug, previous)} variant="outline">
                  Aula anterior
                </MotionButton>
              ) : null}
            </StaggerItem>
            <StaggerItem>
              <CompleteLessonButton
                key={lesson.code}
                courseSlug={course.slug}
                lessonCode={lesson.code}
                initialCompleted={getLessonStatus(course.slug, lesson.code, progress) === "completed"}
                persist={!isDemoMode()}
              />
            </StaggerItem>
            <StaggerItem>
              {next ? (
                <MotionButton href={lessonHref(course.slug, next)} variant="primary">
                  Próxima aula
                </MotionButton>
              ) : null}
            </StaggerItem>
          </Stagger>
          <Reveal as="p" delay={stagger.items * 3} className={styles.saveNote}>
            {isDemoMode()
              ? "O progresso será salvo automaticamente quando a Área do Aluno estiver ativa."
              : "Seu progresso é salvo automaticamente."}
          </Reveal>

          <Reveal delay={stagger.items * 3 + duration.quick}>
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
          </Reveal>
        </div>

        <Reveal as="aside" variant="fade" className={styles.sidebar} aria-labelledby="lista-aulas">
          <TextReveal
            as="h2"
            id="lista-aulas"
            className={styles.sidebarTitle}
            text={SIDEBAR_TITLE}
            delay={duration.quick}
          />
          <StudentModuleList
            course={course}
            progress={progress}
            currentSlug={lesson.slug}
            compact
            delay={duration.quick + afterTitle(motionTokens, SIDEBAR_TITLE)}
          />
        </Reveal>
      </div>
    </StudentShell>
  );
}
