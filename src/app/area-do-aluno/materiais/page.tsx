import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCourse } from "@/lib/content/courses";
import { getMaterials, requireStudentSession } from "@/lib/content/student";
import styles from "./materiais.module.css";

export const metadata: Metadata = {
  title: "Materiais complementares",
};

export default async function MaterialsPage() {
  await requireStudentSession("/area-do-aluno/materiais");
  const materials = getMaterials();
  const courseTitle = (slug: string) => getCourse(slug)?.title ?? "";

  return (
    <StudentShell title="Materiais complementares" active="materiais">
      {materials.length === 0 ? (
        <EmptyState
          icon={<FileText aria-hidden="true" />}
          title="Nenhum material disponível por enquanto"
          text="Apostilas e arquivos de apoio das aulas aparecerão aqui assim que forem publicados."
        />
      ) : (
        <ul className={styles.list}>
          {materials.map((material) => (
            <li key={material.href} className={styles.item}>
              <FileText aria-hidden="true" className={styles.icon} />
              <span className={styles.info}>
                <span className={styles.title}>{material.title}</span>
                <span className={styles.meta}>
                  {courseTitle(material.courseSlug)} · {material.format}
                </span>
              </span>
              <a href={material.href} className={styles.download} download>
                <Download aria-hidden="true" />
                Baixar<span className="visually-hidden"> {material.title}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </StudentShell>
  );
}
