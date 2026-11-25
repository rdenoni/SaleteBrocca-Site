import { Skeleton } from "@/components/ui/Skeleton";
import styles from "@/components/ui/Skeleton.module.css";

export default function ContentFeedLoading() {
  return (
    <div className={styles.pageWrap} aria-busy="true" aria-label="Carregando conteúdos e artigos">
      <div className={styles.headerRow}>
        <Skeleton width={140} height={20} variant="pill" />
        <Skeleton width="44%" height={40} />
        <Skeleton width="66%" height={18} />
      </div>
      <div className={styles.cardGrid}>
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className={styles.cardShell}>
            <Skeleton width="100%" height={200} variant="card" />
            <Skeleton width="42%" height={14} variant="pill" />
            <Skeleton width="86%" height={22} />
            <Skeleton width="70%" height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
