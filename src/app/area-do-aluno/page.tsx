import type { Metadata } from "next";
import { FileText, GraduationCap, Receipt } from "lucide-react";
import { ContinueCard } from "@/components/student/ContinueCard";
import { ProgressBar } from "@/components/student/ProgressBar";
import { StudentShell } from "@/components/student/StudentShell";
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
import styles from "./painel.module.css";

export const metadata: Metadata = {
  title: "Área do Aluno",
};

const LATEST_MATERIALS_LIMIT = 3;

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
    <StudentShell title="Olá!" subtitle="Retome suas aulas e acompanhe seu progresso." active="inicio">
      {mainCourse && <ContinueCard course={mainCourse} progress={progressByCourse} />}

      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.progress}`} aria-labelledby="progresso-titulo">
          <h2 id="progresso-titulo" className={styles.panelTitle}>
            Progresso
          </h2>
          {mainCourse && progress ? (
            <>
              <p className={styles.percent}>{progress.percent}%</p>
              <ProgressBar percent={progress.percent} label="Progresso geral" onTint />
              <p className={styles.text}>
                {progress.completed} de {progress.total} aulas concluídas em {mainCourse.title}.
              </p>
              <LinkArrow href={`/area-do-aluno/cursos/${mainCourse.slug}`}>Ver módulos e aulas</LinkArrow>
            </>
          ) : (
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
          )}
        </section>

        <section className={styles.panel} aria-labelledby="materiais-titulo">
          <h2 id="materiais-titulo" className={styles.panelTitle}>
            Últimos materiais
          </h2>
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
          <LinkArrow href="/area-do-aluno/materiais">Ir para materiais</LinkArrow>
        </section>

        <section className={styles.panel} aria-labelledby="compras-titulo">
          <h2 id="compras-titulo" className={styles.panelTitle}>
            Compras recentes
          </h2>
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
          <LinkArrow href="/loja">Ver a loja</LinkArrow>
        </section>
      </div>
    </StudentShell>
  );
}
