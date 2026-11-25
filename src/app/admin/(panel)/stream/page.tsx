import { requireAdmin } from "@/lib/admin/auth";
import { getAdminStreamSnapshot } from "@/lib/mux/admin-metrics";
import styles from "../cms.module.css";

export default async function AdminStreamPage() {
  await requireAdmin("/admin/stream");
  const snapshot = await getAdminStreamSnapshot();

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Stream (Mux)</h1>
        <p className={styles.subtitle}>
          Monitoramento de uso, minutos armazenados, reprodução e banda estimada pela Mux.
        </p>
        <div className={styles.badgeRow}>
          <span className={`${styles.pill} ${snapshot.muxPlaybackConfigured ? styles.pillActive : ""}`}>
            Signing Keys: {snapshot.muxPlaybackConfigured ? "Ativas" : "Pendentes"}
          </span>
          <span className={`${styles.pill} ${snapshot.muxApiConfigured ? styles.pillActive : ""}`}>
            Mux API (MUX_TOKEN_ID/SECRET): {snapshot.muxApiConfigured ? "Conectada" : "Pendente"}
          </span>
        </div>
      </header>

      {snapshot.errorMessage ? (
        <p role="alert" className={`${styles.feedback} ${styles.feedbackErr}`}>
          {snapshot.errorMessage}
        </p>
      ) : null}

      <section aria-label="Métricas de streaming Mux" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Vídeos / Assets</span>
          <p className={styles.kpiBoxValue}>{snapshot.totalAssets}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Minutos armazenados</span>
          <p className={styles.kpiBoxValue}>{snapshot.storedMinutes} min</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Views (30 dias)</span>
          <p className={styles.kpiBoxValue}>{snapshot.totalViews30d === null ? "—" : snapshot.totalViews30d}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Minutos entregues (30d)</span>
          <p className={styles.kpiBoxValue}>
            {snapshot.playingTimeMinutes30d === null ? "—" : `${snapshot.playingTimeMinutes30d} min`}
          </p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Banda estimada (30d)</span>
          <p className={styles.kpiBoxValue}>
            {snapshot.estimatedBandwidthGb === null ? "—" : `${snapshot.estimatedBandwidthGb} GB`}
          </p>
        </article>
      </section>

      <section className={styles.panel} aria-label="Catálogo de vídeos na Mux">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Assets e Aulas na Mux</h2>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Aula vinculada</th>
                <th>Status</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.assets.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    Configure <code>MUX_TOKEN_ID</code> e <code>MUX_TOKEN_SECRET</code> (somente leitura) para listar
                    assets, views e banda em tempo real pela Mux API.
                  </td>
                </tr>
              ) : (
                snapshot.assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <code>{asset.id}</code>
                    </td>
                    <td>{asset.lessonCode ?? "—"}</td>
                    <td>
                      <span className={`${styles.pill} ${asset.status === "ready" ? styles.pillActive : ""}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>{asset.durationMinutes} min</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
