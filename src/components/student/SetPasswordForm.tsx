"use client";

import { useActionState, useState } from "react";
import { CircleAlert } from "lucide-react";
import { updatePassword } from "@/app/area-do-aluno/auth-actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

const FIELD_IDS = { email: "", senha: "definir-senha", confirmacao: "definir-confirmacao" } as const;
const MIN_PASSWORD_LENGTH = 8;

/* Nova senha de quem chegou pelo link do e-mail (convite ou recuperação). */
export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, INITIAL_AUTH_STATE);
  const [showPassword, setShowPassword] = useState(false);
  useFocusFirstError(state, FIELD_IDS, ["senha", "confirmacao"]);
  const type = showPassword ? "text" : "password";

  return (
    <form className={styles.form} action={formAction} noValidate aria-labelledby="page-title">
      <Field
        id="definir-senha"
        name="senha"
        type={type}
        label="Nova senha"
        hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
        autoComplete="new-password"
        error={state.fieldErrors?.senha}
      />
      <Field
        id="definir-confirmacao"
        name="confirmacao"
        type={type}
        label="Repita a nova senha"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmacao}
      />
      <label className={styles.toggle}>
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
        Mostrar senhas
      </label>

      <Button type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
        {pending ? "Salvando…" : "Salvar senha"}
      </Button>

      <div className={styles.status} role="alert">
        {state.error && (
          <p className={styles.alert}>
            <CircleAlert aria-hidden="true" />
            <span>{state.error}</span>
          </p>
        )}
      </div>
    </form>
  );
}
