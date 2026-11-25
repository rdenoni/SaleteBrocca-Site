"use client";

import { KeyRound, Save, Sparkles, Trash2 } from "lucide-react";
import { useActionState } from "react";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import type { IntegrationFieldStatus } from "@/lib/admin/secrets";
import { saveIntegrationVarAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL: AdminActionState = { status: "idle", message: "" };

function VariableRow({ field }: { field: IntegrationFieldStatus }) {
  const [state, action, pending] = useActionState(saveIntegrationVarAction, INITIAL);

  return (
    <article className={styles.itemCard}>
      <div className={styles.panelHead}>
        <div>
          <h3 className={styles.itemTitle}>{field.label}</h3>
          <p className={styles.hint}>
            <code>{field.key}</code> · {field.help}
          </p>
        </div>
        <span className={`${styles.pill} ${field.source !== "none" ? styles.pillActive : ""}`}>
          {field.source === "env"
            ? "Ativa (Netlify Env)"
            : field.source === "panel"
              ? "Ativa (Painel)"
              : "Pendente"}
        </span>
      </div>

      {field.preview ? (
        <p className={styles.hint}>
          Valor atual: <code>{field.preview}</code>
        </p>
      ) : null}

      <form action={action} className={styles.toolbar}>
        <input type="hidden" name="key" value={field.key} />
        <input
          className={styles.searchInput}
          type={field.secret ? "password" : "text"}
          name="value"
          placeholder={field.placeholder}
          aria-label={field.label}
          autoComplete="off"
          defaultValue={!field.secret && field.source === "panel" ? field.preview : ""}
        />
        <button type="submit" name="mode" value="save" className={styles.primaryBtn} disabled={pending}>
          <Save size={15} aria-hidden="true" />
          <span>{pending ? "Salvando..." : "Salvar"}</span>
        </button>
        {field.generatable ? (
          <button type="submit" name="mode" value="generate" className={styles.secondaryBtn} disabled={pending}>
            <Sparkles size={15} aria-hidden="true" />
            <span>Gerar chave</span>
          </button>
        ) : null}
        {field.source === "panel" ? (
          <button type="submit" name="mode" value="clear" className={styles.dangerBtn} disabled={pending}>
            <Trash2 size={15} aria-hidden="true" />
            <span>Limpar</span>
          </button>
        ) : null}
      </form>

      {state.status !== "idle" ? (
        <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
          {state.message}
        </p>
      ) : null}
    </article>
  );
}

export function IntegracoesClient({ fields }: { fields: readonly IntegrationFieldStatus[] }) {
  const groups = Array.from(new Set(fields.map((f) => f.group)));
  const configuredCount = fields.filter((f) => f.source !== "none").length;

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Variáveis & Chaves de Integração</h1>
        <p className={styles.subtitle}>
          Configure ou edite diretamente pelo painel as chaves pendentes de Hotmart, Mux, Backup AES-256-GCM, GitHub
          privado, Meta Pixel/CAPI e Resend. Segredos são gravados criptografados com AES-256-GCM no banco e nunca
          retornam em texto aberto ao navegador.
        </p>
        <div className={styles.badgeRow}>
          <span className={`${styles.pill} ${configuredCount > 0 ? styles.pillActive : ""}`}>
            <KeyRound size={12} aria-hidden="true" style={{ marginRight: 5 }} />
            {configuredCount} de {fields.length} configuradas
          </span>
        </div>
      </header>

      {groups.map((group) => (
        <section key={group} className={styles.panel} aria-label={group}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>{group}</h2>
          </div>
          <div className={styles.itemList}>
            {fields
              .filter((f) => f.group === group)
              .map((field) => (
                <VariableRow key={field.key} field={field} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
