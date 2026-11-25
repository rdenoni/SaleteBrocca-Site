import { Skeleton } from "@/components/ui/Skeleton";
import styles from "@/components/ui/Skeleton.module.css";

export default function ShopCatalogLoading() {
  return (
    <div className={styles.pageWrap} aria-busy="true" aria-label="Carregando catálogo da loja">
      <div className={styles.headerRow}>
        <Skeleton width={120} height={20} variant="pill" />
        <Skeleton width="38%" height={40} />
        <Skeleton width="58%" height={18} />
      </div>
      <div className={styles.cardGrid}>
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className={styles.cardShell}>
            <Skeleton width="100%" height={220} variant="card" />
            <Skeleton width="36%" height={14} variant="pill" />
            <Skeleton width="80%" height={22} />
            <Skeleton width="45%" height={24} />
          </div>
        ))}
      </div>
    </div>
  );
}
