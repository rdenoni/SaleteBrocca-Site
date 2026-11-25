import { Skeleton } from "@/components/ui/Skeleton";
import styles from "@/components/ui/Skeleton.module.css";

export default function AdminPanelLoading() {
  return (
    <div className={styles.adminWrap} aria-busy="true" aria-label="Carregando painel administrativo">
      <div className={styles.cardShell}>
        <Skeleton width="38%" height={28} />
        <Skeleton width="64%" height={16} />
      </div>
      <div className={styles.kpiGrid}>
        {[0, 1, 2, 3].map((idx) => (
          <div key={idx} className={styles.cardShell}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="42%" height={30} />
            <Skeleton width="72%" height={12} />
          </div>
        ))}
      </div>
      <div className={styles.listShell}>
        <Skeleton width="30%" height={20} />
        {[0, 1, 2, 3, 4].map((idx) => (
          <Skeleton key={idx} width="100%" height={46} />
        ))}
      </div>
    </div>
  );
}
