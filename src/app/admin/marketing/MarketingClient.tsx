"use client";

import { CheckCircle2, Clock, Save } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { AdminActionState } from "@/app/admin/hero/actions";
import { saveMarketingChecklistAction } from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

interface MarketingProps {
  environment: string;
  pixelIdConfigured: boolean;
  capiConfigured: boolean;
  hasAttributionInDb: boolean;
  manualChecks: {
    pixelCreated: boolean;
    autoEventsDisabled: boolean;
  };
}

interface BrowserChecks {
  fbqAvailable: boolean;
  pageViewFired: boolean;
  utmCaptured: boolean;
  completeRegFired: boolean;
  purchaseNotOnFrontend: boolean;
}

export function MarketingClient({
  environment,
  pixelIdConfigured,
  capiConfigured,
  hasAttributionInDb,
  manualChecks,
}: MarketingProps) {
  const [state, action, pending] = useActionState(saveMarketingChecklistAction, INITIAL_STATE);
  const [browserChecks, setBrowserChecks] = useState<BrowserChecks>({
    fbqAvailable: false,
    pageViewFired: false,
    utmCaptured: false,
    completeRegFired: false,
    purchaseNotOnFrontend: true,
  });

  useEffect(() => {
    const win = window as unknown as {
      fbq?: { loaded?: boolean; queue?: unknown[] };
      __sbPixelEvents?: string[];
    };
    const fbqAvailable = typeof win.fbq === "function";
    const events = Array.isArray(win.__sbPixelEvents) ? win.__sbPixelEvents : [];
    const utmRaw = window.localStorage.getItem("salete-brocca:utm") || window.localStorage.getItem("utm_params");

    setBrowserChecks({
      fbqAvailable,
      pageViewFired: fbqAvailable && (Boolean(win.fbq?.loaded) || events.includes("PageView")),
      utmCaptured: Boolean(utmRaw),
      completeRegFired: events.includes("CompleteRegistration"),
      purchaseNotOnFrontend: !events.includes("Purchase"),
    });
  }, []);

  const autoItems = [
    { label: "NEXT_PUBLIC_META_PIXEL_ID configurado", ok: pixelIdConfigured, kind: "auto" },
    { label: "fbq disponível no navegador", ok: browserChecks.fbqAvailable, kind: "auto" },
    { label: "PageView disparado nesta sessão", ok: browserChecks.pageViewFired, kind: "auto" },
    { label: "UTM capturada no localStorage", ok: browserChecks.utmCaptured, kind: "auto" },
    { label: "UTM salva em profiles.attribution", ok: hasAttributionInDb, kind: "auto" },
    { label: "CompleteRegistration disparado (quando aplicável)", ok: browserChecks.completeRegFired, kind: "auto" },
    { label: "Purchase NÃO disparado no frontend", ok: browserChecks.purchaseNotOnFrontend, kind: "auto" },
    {
      label: capiConfigured
        ? "Kiwify Purchase (backend / CAPI) — ativo"
        : "Kiwify Purchase (backend) — pendente sprint futuro",
      ok: capiConfigured,
      kind: "auto",
    },
  ];

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Marketing / Analytics</h1>
        <p className={styles.subtitle}>
          Diagnóstico interno do rastreamento. Itens com verificação automática mostram o status em tempo real; itens
          manuais servem como controle interno da implantação.
        </p>
        <div className={styles.badgeRow}>
          <span className={styles.pill}>Ambiente atual: {environment}</span>
          <span className={`${styles.pill} ${capiConfigured ? styles.pillActive : ""}`}>
            Meta Conversions API (CAPI): {capiConfigured ? "Ativa" : "Pendente"}
          </span>
          <span className={`${styles.pill} ${pixelIdConfigured ? styles.pillActive : ""}`}>
            Status do Meta Pixel: {pixelIdConfigured ? "Configurado" : "Não configurado"}
          </span>
        </div>
      </header>

      <section className={styles.panel} aria-labelledby="checklist-implantacao">
        <div className={styles.panelHead}>
          <h2 id="checklist-implantacao" className={styles.panelTitle}>
            Checklist de implantação
          </h2>
          <span className={styles.pill}>Auto + Manual</span>
        </div>

        <form action={action} className={styles.itemCard}>
          <h3 className={styles.itemTitle}>Itens manuais (controle interno)</h3>
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="pixelCreated" defaultChecked={manualChecks.pixelCreated} />
            <span>Meta Pixel criado (manual)</span>
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" name="autoEventsDisabled" defaultChecked={manualChecks.autoEventsDisabled} />
            <span>Eventos automáticos desativados na Meta (manual)</span>
          </label>
          {state.status !== "idle" ? (
            <p role="status" className={`${styles.feedback} ${state.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}>
              {state.message}
            </p>
          ) : null}
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={pending}>
              <Save size={15} aria-hidden="true" />
              <span>{pending ? "Salvando..." : "Salvar controles manuais"}</span>
            </button>
          </div>
        </form>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>Status em tempo real</th>
              </tr>
            </thead>
            <tbody>
              {autoItems.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>
                    <span className={styles.pill}>{item.kind}</span>
                  </td>
                  <td>
                    <span className={`${styles.pill} ${item.ok ? styles.pillActive : ""}`}>
                      {item.ok ? (
                        <>
                          <CheckCircle2 size={12} aria-hidden="true" style={{ marginRight: 4, verticalAlign: -2 }} />
                          OK
                        </>
                      ) : (
                        <>
                          <Clock size={12} aria-hidden="true" style={{ marginRight: 4, verticalAlign: -2 }} />
                          Pendente
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
