import { Award, CircleDollarSign, Clock, KeyRound, Layers, CirclePlay } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { countLessons } from "@/lib/content/courses";
import type { Course } from "@/types/content";
import styles from "./CommercialInfo.module.css";

interface CommercialInfoProps {
  course: Course;
}

interface Row {
  label: string;
  value: string | null;
  icon: ReactNode;
}

/* Valores comerciais ainda não confirmados aparecem como "A confirmar" — nunca inventados. */
export function CommercialInfo({ course }: CommercialInfoProps) {
  const rows: Row[] = [
    { label: "Módulos", value: String(course.modules.length), icon: <Layers aria-hidden="true" /> },
    { label: "Aulas", value: String(countLessons(course)), icon: <CirclePlay aria-hidden="true" /> },
    { label: "Carga horária", value: course.commercial.workload, icon: <Clock aria-hidden="true" /> },
    { label: "Certificado", value: course.commercial.certificate, icon: <Award aria-hidden="true" /> },
    { label: "Acesso", value: course.commercial.access, icon: <KeyRound aria-hidden="true" /> },
  ];

  return (
    <aside className={styles.card} aria-labelledby="info-comercial">
      <h2 id="info-comercial" className={styles.heading}>
        Informações do curso
      </h2>
      <span className="rule" aria-hidden="true" />
      <div className={styles.price}>
        <CircleDollarSign aria-hidden="true" />
        <span className={styles.priceLabel}>Investimento</span>
        {course.commercial.price ? (
          <strong className={styles.priceValue}>{course.commercial.price}</strong>
        ) : (
          <span className="pending">A confirmar</span>
        )}
      </div>
      <dl className={styles.rows}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt>
              {row.icon}
              {row.label}
            </dt>
            <dd>{row.value ?? <span className="pending">A confirmar</span>}</dd>
          </div>
        ))}
      </dl>
      <Button href={`/cursos/${course.slug}/compra`} variant="primary" className={styles.cta}>
        Quero me inscrever
      </Button>
    </aside>
  );
}
