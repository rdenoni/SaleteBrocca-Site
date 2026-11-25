"use client";

import { Save } from "lucide-react";
import { useActionState } from "react";
import type { AdminActionState } from "@/app/admin/hero/actions";
import type { RegistrationControlSnapshot } from "@/lib/admin/users";
import { saveRegistrationControlAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

export function RegistrationClient({ snapshot }: { snapshot: RegistrationControlSnapshot }) {
  const [state, action, pending] = useActionState(saveRegistrationControlAction, INITIAL_STATE);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Cadastro & Capacidade</h1>
        <p className={styles.subtitle}>
          Acompanhe o total de contas, assinaturas ativas e gerencie o teto máximo de vagas disponíveis em relação ao
          plano do Supabase.
        </p>
      </header>

      <section aria-label="Indicadores de cadastro" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Total de contas</span>
          <p className={styles.kpiBoxValue}>{snapshot.totalAccounts}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Assinaturas ativas</span>
          <p className={styles.kpiBoxValue}>{snapshot.activeSubscriptions}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Ativações pendentes</span>
          <p className={styles.kpiBoxValue}>{snapshot.pendingActivations}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Contas bloqueadas</span>
          <p className={styles.kpiBoxValue}>{snapshot.blockedAccounts}</p>
        </article>
      </section>

      <section className={styles.panel} aria-labelledby="capacidade-supabase">
        <div className={styles.panelHead}>
          <h2 id="capacidade-supabase" className={styles.panelTitle}>
            Capacidade utilizada (Supabase)
          </h2>
          <span className={`${styles.pill} ${styles.pillActive}`}>
            {snapshot.availableSlots} vagas disponíveis
          </span>
        </div>

        <div className={styles.progressTrack} role="progressbar" aria-valuenow={snapshot.usedPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className={styles.progressFill} style={{ width: `${snapshot.usedPercent}%` }} />
        </div>
        <p className={styles.itemDesc}>
          <strong>{snapshot.usedPercent}% utilizado</strong> — {snapshot.totalAccounts} de {snapshot.maxAccounts} contas
          no teto configurado ({snapshot.availableSlots} vagas disponíveis).
        </p>

        <form action={action} className={styles.form}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Teto máximo de contas</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                name="maxAccounts"
                defaultValue={snapshot.maxAccounts}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Capacidade de referência do plano Supabase</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                name="supabaseCapacity"
                defaultValue={snapshot.supabaseCapacity}
              />
            </label>
            <label className={`${styles.checkboxRow} ${styles.fieldFull}`}>
              <input type="checkbox" name="enabled" defaultChecked={snapshot.registrationEnabled} />
              <span>Permitir novos cadastros / ativações enquanto houver vagas</span>
            </label>
          </div>

          {state.status !== "idle" ? (
            <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
              {state.message}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={pending}>
              <Save size={16} aria-hidden="true" />
              <span>{pending ? "Salvando..." : "Salvar controle de cadastro"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
