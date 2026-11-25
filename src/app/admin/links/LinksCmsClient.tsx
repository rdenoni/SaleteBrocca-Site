"use client";

import { Save } from "lucide-react";
import { useActionState } from "react";
import type { AdminActionState } from "@/app/admin/hero/actions";
import type { AdminSiteLinks } from "@/lib/admin/cms";
import { saveSiteLinksAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

export function LinksCmsClient({ links }: { links: AdminSiteLinks }) {
  const [state, action, pending] = useActionState(saveSiteLinksAction, INITIAL_STATE);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Links & Contato</h1>
        <p className={styles.subtitle}>
          Atualize os endereços oficiais das redes sociais, o telefone/WhatsApp e os dados de contato exibidos no
          rodapé e na página Contato.
        </p>
      </header>

      <form action={action} className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Redes Sociais</h2>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Instagram</span>
            <input
              className={styles.input}
              type="url"
              name="instagram"
              placeholder="https://instagram.com/..."
              defaultValue={links.social.instagram}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Facebook</span>
            <input
              className={styles.input}
              type="url"
              name="facebook"
              placeholder="https://facebook.com/..."
              defaultValue={links.social.facebook}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>LinkedIn</span>
            <input
              className={styles.input}
              type="url"
              name="linkedin"
              placeholder="https://linkedin.com/in/..."
              defaultValue={links.social.linkedin}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>WhatsApp (ícone do rodapé)</span>
            <input
              className={styles.input}
              type="url"
              name="whatsapp"
              placeholder="https://wa.me/5548..."
              defaultValue={links.social.whatsapp}
            />
          </label>
        </div>

        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Telefone, E-mail e Atendimento</h2>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Telefone / WhatsApp (texto exibido)</span>
            <input
              className={styles.input}
              name="whatsappDisplay"
              placeholder="+55 (48) 99999-9999"
              defaultValue={links.whatsappDisplay}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Link do Telefone / WhatsApp</span>
            <input
              className={styles.input}
              name="whatsappHref"
              placeholder="https://wa.me/5548... ou tel:+5548..."
              defaultValue={links.whatsappHref}
            />
            <p className={styles.hint}>Deixe vazio para exibir com aviso “em confirmação”.</p>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>E-mail público (texto exibido)</span>
            <input
              className={styles.input}
              name="emailDisplay"
              placeholder="contato@saletebrocca.com"
              defaultValue={links.emailDisplay}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Link do E-mail</span>
            <input
              className={styles.input}
              name="emailHref"
              placeholder="mailto:contato@saletebrocca.com"
              defaultValue={links.emailHref}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Cidade / Local de atendimento (opcional)</span>
            <input className={styles.input} name="clinicCity" defaultValue={links.clinicCity} />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Horário de atendimento (opcional)</span>
            <input className={styles.input} name="clinicHours" defaultValue={links.clinicHours} />
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
            <span>{pending ? "Salvando..." : "Salvar links e telefone"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
