import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { ContinueCard } from "@/components/student/ContinueCard";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkArrow } from "@/components/ui/LinkArrow";
import { COURSES_PATH } from "@/lib/auth-paths";
import { getEnrolledCourses, getStudentProgress, requireStudentSession } from "@/lib/content/student";
import { Reveal } from "@/motion/Reveal";
import { motionTokens } from "@/motion/tokens";
import styles from "./meus-cursos.module.css";

export const metadata: Metadata = {
  title: "Meus cursos",
};

const TITLE = "Meus cursos";
const { stagger } = motionTokens;

/* Movimento (ordem de leitura): banner → barra de seções → cursos (ao montar, um após o outro; cada card: selo,
   título, próxima aula, progresso, botões e a foto por último) → aviso de "nenhum outro curso" (por viewport:
   espera o card terminar, e no celular entra só quando chega à tela). */
export default async function MyCoursesPage() {
  await requireStudentSession(COURSES_PATH);
  const [courses, progress] = await Promise.all([getEnrolledCourses(), getStudentProgress()]);

  return (
    <StudentShell title={TITLE} active="cursos">
      <ul className={styles.list}>
        {courses.map((course, index) => (
          <li key={course.slug}>
            <ContinueCard
              course={course}
              progress={progress}
              variant="card"
              entranceDelay={studentContentStart(TITLE) + index * stagger.cards}
            />
          </li>
        ))}
        {/* Só faz sentido enquanto o aluno tiver no máximo um curso. */}
        {courses.length <= 1 && (
          <Reveal as="li">
            <EmptyState
              icon={<GraduationCap aria-hidden="true" />}
              title={courses.length === 0 ? "Você ainda não tem cursos" : "Você ainda não tem outros cursos"}
              text={
                courses.length === 0
                  ? "Assim que a compra for confirmada, o curso aparece aqui. Se você acabou de comprar, aguarde alguns minutos."
                  : "Quando novos cursos forem lançados, eles aparecerão no catálogo."
              }
            >
              <LinkArrow href="/cursos">{courses.length === 0 ? "Conhecer os cursos" : "Ver o catálogo"}</LinkArrow>
            </EmptyState>
          </Reveal>
        )}
      </ul>
    </StudentShell>
  );
}
