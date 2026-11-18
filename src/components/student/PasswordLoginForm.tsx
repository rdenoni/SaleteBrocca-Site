"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CircleAlert } from "lucide-react";
import { signIn } from "@/app/area-do-aluno/auth-actions";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { RECOVER_PATH } from "@/lib/auth-paths";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

interface PasswordLoginFormProps {
  /** Destino depois do login (já validado no servidor pela página; validado de novo na Server Action). */
  next: string;
  /** Aviso vindo da página (ex.: link de e-mail inválido), mostrado até o primeiro envio. */
  notice?: string;
}

const FIELD_IDS = { email: "login-email", senha: "login-senha", confirmacao: "" } as const;

/* Login real (Supabase Auth). A mensagem de credencial errada é única, sem revelar se o e-mail existe. */
export function PasswordLoginForm({ next, notice }: PasswordLoginFormProps) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_AUTH_STATE);
  const [showPassword, setShowPassword] = useState(false);
  useFocusFirstError(state, FIELD_IDS, ["email", "senha"]);

  return (
    <form className={styles.form} action={formAction} noValidate aria-labelledby="page-title">
      <input type="hidden" name="next" value={next} />
      <Field
        id="login-email"
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <Field
        id="login-senha"
        name="senha"
        type={showPassword ? "text" : "password"}
        label="Senha"
        autoComplete="current-password"
        error={state.fieldErrors?.senha}
      />
      <label className={styles.toggle}>
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
        Mostrar senha
      </label>

      <Button type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>

      <div className={styles.status} role="alert">
        {(state.error ?? notice) && (
          <p className={styles.alert}>
            <CircleAlert aria-hidden="true" />
            <span>{state.error ?? notice}</span>
          </p>
        )}
      </div>

      <Link href={RECOVER_PATH} className={styles.link}>
        Esqueci minha senha
      </Link>
    </form>
  );
}
