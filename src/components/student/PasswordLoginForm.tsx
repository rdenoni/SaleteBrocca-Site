"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useActionState, useState } from "react";
import { CircleAlert } from "lucide-react";
import { signIn } from "@/app/area-do-aluno/auth-actions";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { MotionButton } from "@/motion/MotionButton";
import { RECOVER_PATH } from "@/lib/auth-paths";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import { useAuthCascade } from "./AuthCard";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

interface PasswordLoginFormProps {
  /** Destino depois do login (já validado no servidor pela página; validado de novo na Server Action). */
  next: string;
  /** Aviso vindo da página (ex.: link de e-mail inválido), mostrado até o primeiro envio. */
  notice?: string;
}

const FIELD_IDS = { email: "login-email", senha: "login-senha", confirmacao: "" } as const;

/* Login real (Supabase Auth). A mensagem de credencial errada é única, sem revelar se o e-mail existe.
   Entrada em cascata (ordem de leitura): e-mail → senha → mostrar senha → entrar → aviso da página (se houver) →
   "Esqueci minha senha". O erro do envio só aparece, fora da cascata. */
export function PasswordLoginForm({ next, notice }: PasswordLoginFormProps) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_AUTH_STATE);
  const { ready, cascade, item } = useAuthCascade();
  const [showPassword, setShowPassword] = useState(false);
  useFocusFirstError(state, FIELD_IDS, ["email", "senha"]);

  return (
    <motion.form
      className={styles.form}
      action={formAction}
      noValidate
      aria-labelledby="page-title"
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={cascade}
    >
      <input type="hidden" name="next" value={next} />
      <motion.div data-reveal="" variants={item}>
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
      </motion.div>
      <motion.div data-reveal="" variants={item}>
        <Field
          id="login-senha"
          name="senha"
          type={showPassword ? "text" : "password"}
          label="Senha"
          autoComplete="current-password"
          autoCapitalize="none"
          spellCheck={false}
          error={state.fieldErrors?.senha}
        />
      </motion.div>
      <motion.label className={styles.toggle} data-reveal="" variants={item}>
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
        Mostrar senha
      </motion.label>

      <motion.div data-reveal="" variants={item}>
        <MotionButton
          type="submit"
          variant="primary"
          className={styles.submit}
          disabled={pending}
          aria-busy={pending}
          data-loading={pending ? "true" : undefined}
        >
          <span className={styles.submitInner}>
            {pending ? <Spinner size={16} /> : null}
            <span>{pending ? "Entrando…" : "Entrar"}</span>
          </span>
        </MotionButton>
      </motion.div>

      <motion.div className={styles.status} role="alert" data-reveal="" variants={item}>
        {(state.error ?? notice) && (
          <p className={styles.alert}>
            <CircleAlert size={18} aria-hidden="true" />
            <span>{state.error ?? notice}</span>
          </p>
        )}
      </motion.div>

      <motion.div className={styles.linkWrap} data-reveal="" variants={item}>
        <Link href={RECOVER_PATH} className={styles.link}>
          Esqueci minha senha
        </Link>
      </motion.div>
    </motion.form>
  );
}
