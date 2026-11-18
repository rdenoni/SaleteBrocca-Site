"use client";

import { useActionState } from "react";
import { CircleAlert, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/area-do-aluno/auth-actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

const FIELD_IDS = { email: "recuperar-email", senha: "", confirmacao: "" } as const;

/* Pede o link de nova senha. A confirmação é sempre a mesma, exista a conta ou não. */
export function RecoverPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, INITIAL_AUTH_STATE);
  useFocusFirstError(state, FIELD_IDS, ["email"]);

  return (
    <form className={styles.form} action={formAction} noValidate aria-labelledby="page-title">
      <Field
        id="recuperar-email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />

      <Button type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
        {pending ? "Enviando…" : "Enviar link"}
      </Button>

      <div className={styles.status} role="status" aria-live="polite">
        {state.success && (
          <p>
            <MailCheck aria-hidden="true" />
            <span>{state.success}</span>
          </p>
        )}
        {state.error && (
          <p className={styles.alert} role="alert">
            <CircleAlert aria-hidden="true" />
            <span>{state.error}</span>
          </p>
        )}
      </div>
    </form>
  );
}
