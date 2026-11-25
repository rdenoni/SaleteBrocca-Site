"use client";

import { CloudUpload, Download, Lock, Upload } from "lucide-react";
import { useActionState } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import type { AdminBackupSnapshot } from "@/lib/admin/backup";
import { importEncryptedBackupAction, pushGithubBackupAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function BackupClient({ snapshot }: { snapshot: AdminBackupSnapshot }) {
  const [importState, importAction, importPending] = useActionState(importEncryptedBackupAction, INITIAL_STATE);
  const [ghState, ghAction, ghPending] = useActionState(pushGithubBackupAction, INITIAL_STATE);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Backup Completo do Sistema</h1>
        <p className={styles.subtitle}>
          Exporta e importa todos os dados de todas as {snapshot.tablesCount} tabelas do banco — perfis, pagamentos,
          licenças, suporte, sessões, logs e muito mais. O arquivo é criptografado com <strong>AES-256-GCM</strong> e
          só pode ser restaurado nesta mesma instância.
        </p>
        <div className={styles.badgeRow}>
          <span className={`${styles.pill} ${snapshot.encryptionReady ? styles.pillActive : ""}`}>
            AES-256-GCM: {snapshot.encryptionReady ? "Chave ativa" : "BACKUP_ENCRYPTION_KEY pendente"}
          </span>
          <span className={`${styles.pill} ${snapshot.githubReady ? styles.pillActive : ""}`}>
            GitHub privado: {snapshot.githubReady ? snapshot.githubRepo : "GITHUB_BACKUP_TOKEN / REPO pendentes"}
          </span>
        </div>
      </header>

      <section className={styles.panel} aria-label="Exportar e enviar para o GitHub">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Exportar & Backup no GitHub</h2>
          <Lock size={18} aria-hidden="true" />
        </div>
        <div className={styles.formActions}>
          <a href="/api/admin/backup/export" className={styles.primaryBtn}>
            <Download size={16} aria-hidden="true" />
            <span>Exportar backup (.sbbak.enc)</span>
          </a>

          <form action={ghAction}>
            <button type="submit" className={styles.secondaryBtn} disabled={ghPending}>
              <CloudUpload size={16} aria-hidden="true" />
              <span>{ghPending ? "Enviando..." : "Enviar backup no GitHub privado"}</span>
            </button>
          </form>
        </div>
        <p className={styles.hint}>
          Segurança: configure <code>GITHUB_BACKUP_REPO</code> apontando sempre para um repositório{" "}
          <strong>privado</strong> dedicado (nunca o repositório público do site).
        </p>
        {ghState.status !== "idle" ? (
          <p role="status" className={`${styles.feedback} ${ghState.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
            {ghState.message}
          </p>
        ) : null}
      </section>

      <section className={styles.panel} aria-label="Restaurar backup criptografado">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Importar / Restaurar Backup (AES-256-GCM)</h2>
        </div>
        <form action={importAction} className={styles.form}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Arquivo criptografado (.sbbak.enc) *</span>
              <input className={styles.input} type="file" name="backupFile" accept=".enc,.json" required />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Confirmação (digite RESTAURAR) *</span>
              <input className={styles.input} name="confirmWord" placeholder="RESTAURAR" required />
            </label>
          </div>
          {importState.status !== "idle" ? (
            <p role="status" className={`${styles.feedback} ${importState.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
              {importState.message}
            </p>
          ) : null}
          <div className={styles.formActions}>
            <button type="submit" className={styles.dangerBtn} disabled={importPending}>
              <Upload size={16} aria-hidden="true" />
              <span>{importPending ? "Restaurando..." : "Validar e restaurar backup"}</span>
            </button>
          </div>
        </form>
      </section>

      <section className={styles.panel} aria-label="Histórico de backups">
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Histórico recente</h2>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Tipo</th>
                <th>Tabelas / Registros</th>
                <th>Tamanho</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.history.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhum backup registrado ainda.</td>
                </tr>
              ) : (
                snapshot.history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code>{item.filename}</code>
                    </td>
                    <td>
                      <span className={styles.pill}>{item.destination}</span>
                    </td>
                    <td>
                      {item.tablesCount} tabelas · {item.rowsCount} registros
                    </td>
                    <td>{formatBytes(item.sizeBytes)}</td>
                    <td>{item.createdByEmail}</td>
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
