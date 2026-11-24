import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCourse } from "@/lib/content/courses";
import { getMaterials, requireStudentSession } from "@/lib/content/student";
import { Reveal } from "@/motion/Reveal";
import { Stagger, StaggerItem } from "@/motion/Stagger";
import styles from "./materiais.module.css";

export const metadata: Metadata = {
  title: "Materiais complementares",
};

const TITLE = "Materiais complementares";

/* Movimento (ordem de leitura): banner → barra de seções → aviso de vazio (ao montar) ou lista de materiais, linha a
   linha de cima para baixo (por viewport: a lista pode ser longa e o que está abaixo da dobra espera chegar). */
export default async function MaterialsPage() {
  await requireStudentSession("/area-do-aluno/materiais");
  const materials = getMaterials();
  const courseTitle = (slug: string) => getCourse(slug)?.title ?? "";

  return (
    <StudentShell title={TITLE} active="materiais">
      {materials.length === 0 ? (
        <Reveal trigger="mount" delay={studentContentStart(TITLE)}>
          <EmptyState
            icon={<FileText aria-hidden="true" />}
            title="Nenhum material disponível por enquanto"
            text="Apostilas e arquivos de apoio das aulas aparecerão aqui assim que forem publicados."
          />
        </Reveal>
      ) : (
        <Stagger as="ul" className={styles.list}>
          {materials.map((material) => (
            <StaggerItem as="li" key={material.href} className={styles.item}>
              <span className={styles.icon} aria-hidden="true">
                <FileText />
              </span>
              <span className={styles.info}>
                <span className={styles.title}>{material.title}</span>
                <span className={styles.meta}>
                  {courseTitle(material.courseSlug)} · {material.format}
                </span>
              </span>
              <a href={material.href} className={styles.download} download>
                <Download aria-hidden="true" size={18} />
                Baixar<span className="visually-hidden"> {material.title}</span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </StudentShell>
  );
}
