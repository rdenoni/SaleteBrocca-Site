"use client";

import { Ban, Trash2, XCircle } from "lucide-react";
import type { AdminSessionsSnapshot } from "@/lib/admin/sessions";
import { blockSessionIpAction, cleanupOldSessionsAction, revokeSessionAction } from "./actions";
import styles from "../cms.module.css";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const STATUS_LABEL: Record<string, string> = {
  active: "Online",
  idle: "Ocioso",
  revoked: "Encerrada",
};

export function SessionsClient({ snapshot }: { snapshot: AdminSessionsSnapshot }) {
  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Sessões Ativas</h1>
        <p className={styles.subtitle}>
          Rastreamento de sessões via heartbeat (<code>/api/session/heartbeat</code>) com IP, dispositivo, localização e
          coordenadas aproximadas via cabeçalho nativo da Netlify.
        </p>
      </header>

      <section aria-label="Resumo de sessões" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Online agora</span>
          <p className={styles.kpiBoxValue}>{snapshot.activeCount}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Ociosas</span>
          <p className={styles.kpiBoxValue}>{snapshot.idleCount}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Total registradas</span>
          <p className={styles.kpiBoxValue}>{snapshot.totalCount}</p>
        </article>
      </section>

      <section className={styles.panel} aria-label="Tabela de sessões">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Sessões no site</h2>
          <form action={cleanupOldSessionsAction}>
            <button type="submit" className={styles.secondaryBtn}>
              <Trash2 size={15} aria-hidden="true" />
              <span>Limpar sessões &gt; 30 dias</span>
            </button>
          </form>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Usuário</th>
                <th>IP</th>
                <th>Dispositivo</th>
                <th>Localização</th>
                <th>Coordenadas</th>
                <th>Última Atividade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.sessions.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    {snapshot.mode === "demo"
                      ? "Conecte o Supabase para monitorar sessões ativas em tempo real."
                      : "Nenhuma sessão registrada ainda."}
                  </td>
                </tr>
              ) : (
                snapshot.sessions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={`${styles.pill} ${item.status === "active" ? styles.pillActive : ""}`}>
                        {STATUS_LABEL[item.status] ?? item.status}
                      </span>
                    </td>
                    <td>{item.userEmail}</td>
                    <td>
                      <code>{item.ipAddress}</code>
                    </td>
                    <td>{item.deviceLabel}</td>
                    <td>{item.location}</td>
                    <td>
                      <code>{item.coordinates}</code>
                    </td>
                    <td>{formatDateTime(item.lastSeenAt)}</td>
                    <td>
                      <div className={styles.actionRow}>
                        {item.status !== "revoked" ? (
                          <form action={revokeSessionAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className={styles.miniBtn}>
                              <XCircle size={13} aria-hidden="true" />
                              <span>Encerrar</span>
                            </button>
                          </form>
                        ) : null}
                        <form action={blockSessionIpAction}>
                          <input type="hidden" name="ipAddress" value={item.ipAddress} />
                          <button type="submit" className={`${styles.miniBtn} ${styles.miniBtnDanger}`}>
                            <Ban size={13} aria-hidden="true" />
                            <span>Bloquear IP</span>
                          </button>
                        </form>
                      </div>
                    </td>
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
