"use client";

import { motion } from "motion/react";
import { useActionState, useState } from "react";
import { CircleAlert } from "lucide-react";
import { updatePassword } from "@/app/area-do-aluno/auth-actions";
import { Field } from "@/components/ui/Field";
import { MotionButton } from "@/motion/MotionButton";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import { useAuthCascade } from "./AuthCard";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

const FIELD_IDS = { email: "", senha: "definir-senha", confirmacao: "definir-confirmacao" } as const;
const MIN_PASSWORD_LENGTH = 8;

/* Nova senha de quem chegou pelo link do e-mail (convite ou recuperação).
   Entrada em cascata: nova senha → repita → mostrar senhas → salvar. O erro do envio só aparece. */
export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, INITIAL_AUTH_STATE);
  const { ready, cascade, item } = useAuthCascade();
  const [showPassword, setShowPassword] = useState(false);
  useFocusFirstError(state, FIELD_IDS, ["senha", "confirmacao"]);
  const type = showPassword ? "text" : "password";

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
          id="definir-senha"
          name="senha"
          type={type}
          label="Nova senha"
          hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          autoComplete="new-password"
          autoCapitalize="none"
          spellCheck={false}
          error={state.fieldErrors?.senha}
        />
      </motion.div>
      <motion.div data-reveal="" variants={item}>
        <Field
          id="definir-confirmacao"
          name="confirmacao"
          type={type}
          label="Repita a nova senha"
          autoComplete="new-password"
          autoCapitalize="none"
          spellCheck={false}
          error={state.fieldErrors?.confirmacao}
        />
      </motion.div>
      <motion.label className={styles.toggle} data-reveal="" variants={item}>
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
        Mostrar senhas
      </motion.label>

      <motion.div data-reveal="" variants={item}>
        <MotionButton type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
          {pending ? "Salvando…" : "Salvar senha"}
        </MotionButton>
      </motion.div>

      <div className={styles.status} role="alert">
        {state.error && (
          <p className={styles.alert}>
            <CircleAlert size={18} aria-hidden="true" />
            <span>{state.error}</span>
          </p>
        )}
      </div>
    </motion.form>
  );
}
