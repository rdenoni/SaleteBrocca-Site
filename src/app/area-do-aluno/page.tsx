import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FileText, GraduationCap, Receipt } from "lucide-react";
import { ContinueCard } from "@/components/student/ContinueCard";
import { ProgressBar } from "@/components/student/ProgressBar";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { STUDENT_HOME } from "@/lib/auth-paths";
import {
  ENROLLMENT_STATUS_LABEL,
  getCourseProgress,
  getEnrolledCourses,
  getEnrollments,
  getMaterials,
  getStudentProgress,
  isDemoMode,
  requireStudentSession,
} from "@/lib/content/student";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import { motionTokens } from "@/motion/tokens";
import styles from "./painel.module.css";

export const metadata: Metadata = {
  title: "Área do Aluno",
};

const LATEST_MATERIALS_LIMIT = 3;
const TITLE = "Olá!";
const { duration } = motionTokens;
/* Painéis lado a lado: um começa quando o anterior já está subindo (esquerda para a direita). */
const PANEL_GAP = duration.base;

interface PanelProps {
  id: string;
  title: string;
  /** Posição na fileira: define o atraso (esquerda para a direita). */
  index: number;
  className?: string;
  /** Cada filho deve ser um StaggerItem. */
  children: ReactNode;
}

/* Painel do início. A base (o bloco azul, quando há) surge primeiro; depois o título e o conteúdo, em cascata. */
function Panel({ id, title, index, className, children }: PanelProps) {
  const start = index * PANEL_GAP;
  return (
    <Reveal as="section" variant="fade" delay={start} className={className} aria-labelledby={id}>
      <Stagger className={styles.panel} delay={start + duration.quick}>
        <StaggerItem>
          <h2 id={id} className={styles.panelTitle}>
            {title}
          </h2>
        </StaggerItem>
        {children}
      </Stagger>
    </Reveal>
  );
}

/* Movimento (ordem de leitura): banner → barra de seções → "Continuar assistindo" (ao montar: selo, título, aula,
   progresso, botões e, por último, a foto) → os três painéis, da esquerda para a direita (por viewport: o que já
   estiver na tela ao abrir espera o topo). Dentro de cada painel: título → texto → barra/lista → link. */
export default async function StudentDashboardPage() {
  await requireStudentSession(STUDENT_HOME);
  const demo = isDemoMode();
  const [courses, progressByCourse, enrollments] = await Promise.all([
    getEnrolledCourses(),
    getStudentProgress(),
    getEnrollments(),
  ]);
  const [mainCourse] = courses;
  const progress = mainCourse ? getCourseProgress(mainCourse, progressByCourse) : undefined;
  const latestMaterials = getMaterials().slice(0, LATEST_MATERIALS_LIMIT);
  const courseTitle = (slug: string) => courses.find((course) => course.slug === slug)?.title ?? "";

  return (
    <StudentShell title={TITLE} subtitle="Retome suas aulas e acompanhe seu progresso." active="inicio">
      {mainCourse && (
        <ContinueCard course={mainCourse} progress={progressByCourse} entranceDelay={studentContentStart(TITLE)} />
      )}

      <div className={styles.grid}>
        <Panel id="progresso-titulo" title="Progresso" index={0} className={styles.progress}>
          {mainCourse && progress ? (
            <>
              <StaggerItem>
                <p className={styles.percent}>{progress.percent}%</p>
              </StaggerItem>
              <StaggerItem className={styles.stretch}>
                <ProgressBar percent={progress.percent} label="Progresso geral" onTint />
              </StaggerItem>
              <StaggerItem>
                <p className={styles.text}>
                  {progress.completed} de {progress.total} aulas concluídas em {mainCourse.title}.
                </p>
              </StaggerItem>
              <StaggerItem>
                <LinkArrow href={`/area-do-aluno/cursos/${mainCourse.slug}`}>Ver módulos e aulas</LinkArrow>
              </StaggerItem>
            </>
          ) : (
            <StaggerItem className={styles.stretch}>
              <EmptyState
                icon={<GraduationCap aria-hidden="true" />}
                title={demo ? "Nenhum curso em andamento" : "Você ainda não tem cursos"}
                text={
                  demo
                    ? "Você ainda não começou um curso."
                    : "Assim que a compra for confirmada, o curso aparece aqui. Se você acabou de comprar, aguarde alguns minutos."
                }
              >
                <LinkArrow href={demo ? "/area-do-aluno/cursos" : "/cursos"}>
                  {demo ? "Ver meus cursos" : "Conhecer os cursos"}
                </LinkArrow>
              </EmptyState>
            </StaggerItem>
          )}
        </Panel>

        <Panel id="materiais-titulo" title="Últimos materiais" index={1}>
          <StaggerItem className={styles.stretch}>
            {latestMaterials.length === 0 ? (
              <EmptyState
                icon={<FileText aria-hidden="true" />}
                title="Nenhum material ainda"
                text="Os materiais complementares das aulas aparecerão aqui."
              />
            ) : (
              <ul className={styles.materialList}>
                {latestMaterials.map((material) => (
                  <li key={material.href} className={styles.materialItem}>
                    <span className={styles.materialTitle}>{material.title}</span>
                    <span className={styles.materialMeta}>
                      {courseTitle(material.courseSlug)} · {material.format}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </StaggerItem>
          <StaggerItem>
            <LinkArrow href="/area-do-aluno/materiais">Ir para materiais</LinkArrow>
          </StaggerItem>
        </Panel>

        <Panel id="compras-titulo" title="Compras recentes" index={2}>
          <StaggerItem className={styles.stretch}>
            {enrollments.length === 0 ? (
              <EmptyState
                icon={<Receipt aria-hidden="true" />}
                title="Nenhuma compra registrada"
                text={
                  demo
                    ? "O histórico aparecerá aqui quando o pagamento online estiver ativo."
                    : "As compras confirmadas aparecerão aqui."
                }
              />
            ) : (
              <ul className={styles.materialList}>
                {enrollments.map((enrollment) => (
                  <li key={`${enrollment.courseSlug}-${enrollment.createdAt}`} className={styles.materialItem}>
                    <span className={styles.materialTitle}>{enrollment.courseTitle}</span>
                    <span className={styles.materialMeta}>{ENROLLMENT_STATUS_LABEL[enrollment.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </StaggerItem>
          <StaggerItem>
            <LinkArrow href="/loja">Ver a loja</LinkArrow>
          </StaggerItem>
        </Panel>
      </div>
    </StudentShell>
  );
}
