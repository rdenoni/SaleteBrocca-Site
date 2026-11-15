import type { Metadata } from "next";
import { FileText, GraduationCap, Receipt } from "lucide-react";
import { ContinueCard } from "@/components/student/ContinueCard";
import { ProgressBar } from "@/components/student/ProgressBar";
import { StudentShell } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { getCourseProgress, getEnrolledCourses, getMaterials } from "@/lib/content/student";
import styles from "./painel.module.css";

export const metadata: Metadata = {
  title: "Área do Aluno",
};

const LATEST_MATERIALS_LIMIT = 3;

export default function StudentDashboardPage() {
  const courses = getEnrolledCourses();
  const [mainCourse] = courses;
  const progress = mainCourse ? getCourseProgress(mainCourse) : undefined;
  const latestMaterials = getMaterials().slice(0, LATEST_MATERIALS_LIMIT);
  const courseTitle = (slug: string) => courses.find((course) => course.slug === slug)?.title ?? "";

  return (
    <StudentShell title="Olá!" subtitle="Retome suas aulas e acompanhe seu progresso." active="inicio">
      {mainCourse && <ContinueCard course={mainCourse} />}

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
              title="Nenhum curso em andamento"
              text="Você ainda não começou um curso."
            >
              <LinkArrow href="/area-do-aluno/cursos">Ver meus cursos</LinkArrow>
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
          <EmptyState
            icon={<Receipt aria-hidden="true" />}
            title="Nenhuma compra registrada"
            text="O histórico aparecerá aqui quando o pagamento online estiver ativo."
          />
          <LinkArrow href="/loja">Ver a loja</LinkArrow>
        </section>
      </div>
    </StudentShell>
  );
}
