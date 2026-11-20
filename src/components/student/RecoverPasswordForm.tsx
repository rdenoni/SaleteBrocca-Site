"use client";

import { motion } from "motion/react";
import { useActionState } from "react";
import { CircleAlert } from "lucide-react";
import { requestPasswordReset } from "@/app/area-do-aluno/auth-actions";
import { Field } from "@/components/ui/Field";
import { MotionButton } from "@/motion/MotionButton";
import { AnimatedCheck } from "@/motion/icons";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import { useAuthCascade } from "./AuthCard";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

const FIELD_IDS = { email: "recuperar-email", senha: "", confirmacao: "" } as const;

/* Pede o link de nova senha. A confirmação é sempre a mesma, exista a conta ou não.
   Entrada em cascata: e-mail → enviar link. A confirmação/erro depois do envio só aparece, fora da cascata. */
export function RecoverPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, INITIAL_AUTH_STATE);
  const { ready, cascade, item } = useAuthCascade();
  useFocusFirstError(state, FIELD_IDS, ["email"]);

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
      <motion.div data-reveal="" variants={item}>
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
      </motion.div>

      <motion.div data-reveal="" variants={item}>
        <MotionButton type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
          {pending ? "Enviando…" : "Enviar link"}
        </MotionButton>
      </motion.div>

      <div className={styles.status} role="status" aria-live="polite">
        {state.success && (
          <p>
            <AnimatedCheck size={18} />
            <span>{state.success}</span>
          </p>
        )}
        {state.error && (
          <p className={styles.alert} role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{state.error}</span>
          </p>
        )}
      </div>
    </motion.form>
  );
}
