"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { COOKIE_CATEGORIES } from "@/lib/content/privacy";
import { CONSENT_OPEN_EVENT } from "@/lib/consent-constants";
import { readConsent, saveConsent, type ConsentChoice } from "@/lib/consent";
import styles from "./CookieConsent.module.css";

const NO_OPTIONAL: ConsentChoice = { analytics: false, marketing: false };

/* Aviso de cookies: não bloqueia a página, não prende o foco (não é diálogo modal) e só aparece no navegador depois
   da hidratação. Hoje o site só usa cookies necessários; as categorias opcionais existem para o dia em que
   alguma ferramenta for ligada (ver src/lib/consent.ts). "Personalizar" abre o painel dentro do próprio aviso. */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  /* Já existe uma escolha salva: o painel reaberto pode ser fechado sem mudar nada. */
  const [canDismiss, setCanDismiss] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice>(NO_OPTIONAL);
  const regionRef = useRef<HTMLElement>(null);
  const focusOnOpen = useRef(false);
  /* Quem reabriu o painel (botão do rodapé ou da política): recebe o foco de volta quando o aviso fecha. */
  const returnFocus = useRef<HTMLElement | null>(null);
  const panelId = useId();

  /* Primeira visita (ou versão nova do aviso): mostra, sem tirar o foco de onde a pessoa está. */
  useEffect(() => {
    if (!readConsent()) setOpen(true);
  }, []);

  /* Reabertura pelo botão do rodapé ou da política: abre o painel já com a escolha atual e leva o foco ao aviso. */
  useEffect(() => {
    function reopen() {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const current = readConsent();
      setChoice(current ? { analytics: current.analytics, marketing: current.marketing } : NO_OPTIONAL);
      setCustomizing(true);
      setCanDismiss(current !== null);
      focusOnOpen.current = true;
      setOpen(true);
    }
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      regionRef.current?.focus();
    }
  }, [open]);

  /* Fecha o aviso; se ele foi reaberto por um botão, devolve o foco a esse botão (sem isso o foco cai no <body>). */
  const close = useCallback(() => {
    setOpen(false);
    setCustomizing(false);
    const target = returnFocus.current;
    returnFocus.current = null;
    if (target?.isConnected) target.focus();
  }, []);

  const commit = useCallback(
    (next: ConsentChoice) => {
      saveConsent(next);
      close();
    },
    [close],
  );

  if (!open) return null;

  return (
    <section
      ref={regionRef}
      role="region"
      aria-label="Aviso de cookies"
      tabIndex={-1}
      className={styles.banner}
      data-surface="dark"
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.title}>Sua privacidade</p>
          <p>
            Hoje este site usa apenas cookies necessários ao funcionamento, como o do login da Área do Aluno. Não
            usamos medição de audiência nem cookies de marketing; se isso mudar, vamos pedir a sua escolha antes.{" "}
            <Link href="/privacidade#cookies">Saiba mais na política de privacidade</Link>.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => commit({ analytics: true, marketing: true })}>
            Aceitar todos
          </button>
          <button type="button" className={`${styles.button} ${styles.outline}`} onClick={() => commit(NO_OPTIONAL)}>
            Recusar opcionais
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.ghost}`}
            aria-expanded={customizing}
            aria-controls={panelId}
            onClick={() => setCustomizing((value) => !value)}
          >
            Personalizar
          </button>
        </div>

        {customizing && (
          <form
            id={panelId}
            className={styles.panel}
            onSubmit={(event) => {
              event.preventDefault();
              commit(choice);
            }}
          >
            <ul className={styles.categories}>
              {COOKIE_CATEGORIES.map((category) => {
                const inputId = `${panelId}-${category.id}`;
                const optional = !category.required;
                return (
                  <li key={category.id} className={styles.category}>
                    <label htmlFor={inputId} className={styles.categoryLabel}>
                      <input
                        id={inputId}
                        type="checkbox"
                        className={styles.toggle}
                        checked={optional ? choice[category.id as keyof ConsentChoice] : true}
                        disabled={!optional}
                        onChange={(event) => {
                          if (optional) setChoice((current) => ({ ...current, [category.id]: event.target.checked }));
                        }}
                      />
                      <span className={styles.categoryName}>
                        {category.label}
                        {!optional && <span className={styles.always}> (sempre ativos)</span>}
                      </span>
                    </label>
                    <p className={styles.categoryText}>
                      {category.description} <strong>Hoje:</strong> {category.today}
                    </p>
                  </li>
                );
              })}
            </ul>
            <div className={styles.panelActions}>
              <button type="submit" className={`${styles.button} ${styles.primary}`}>
                Salvar preferências
              </button>
              {canDismiss && (
                <button type="button" className={`${styles.button} ${styles.outline}`} onClick={close}>
                  Fechar sem mudar
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
