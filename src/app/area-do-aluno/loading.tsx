import { Skeleton } from "@/components/ui/Skeleton";
import styles from "@/components/ui/Skeleton.module.css";

export default function StudentAreaLoading() {
  return (
    <div className={styles.pageWrap} aria-busy="true" aria-label="Carregando Área do Aluno">
      <div className={styles.headerRow}>
        <Skeleton width={160} height={22} variant="pill" />
        <Skeleton width="48%" height={36} />
        <Skeleton width="62%" height={18} />
      </div>
      <div className={styles.cardShell}>
        <Skeleton width="35%" height={22} />
        <Skeleton width="100%" height={14} variant="pill" />
        <Skeleton width="78%" height={16} />
      </div>
      <div className={styles.cardGrid}>
        {[0, 1, 2].map((idx) => (
          <div key={idx} className={styles.cardShell}>
            <Skeleton width="100%" height={160} variant="card" />
            <Skeleton width="75%" height={20} />
            <Skeleton width="90%" height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
