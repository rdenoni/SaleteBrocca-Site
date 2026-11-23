"use client";

import { motion } from "motion/react";
import { useActionState, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { changePassword, updatePassword } from "@/app/area-do-aluno/auth-actions";
import { Field } from "@/components/ui/Field";
import { MotionButton } from "@/motion/MotionButton";
import { INITIAL_AUTH_STATE } from "@/lib/auth-form-state";
import { useAuthCascade } from "./AuthCard";
import styles from "./LoginForm.module.css";
import { useFocusFirstError } from "./useFocusFirstError";

const FIELD_IDS = { atual: "senha-atual", senha: "definir-senha", confirmacao: "definir-confirmacao" } as const;
const MIN_PASSWORD_LENGTH = 8;

interface SetPasswordFormProps {
  /** "set": link do e-mail (convite ou recuperação). "change": Minha conta, pede a senha atual e não sai da página. */
  mode?: "set" | "change";
  /** Atraso da cascata (s) quando o formulário está fora do AuthCard. */
  delay?: number;
  /** Id do título que nomeia o formulário. */
  labelledBy?: string;
}

/* Nova senha. Entrada em cascata: (senha atual) → nova senha → repita → mostrar senhas → salvar.
   O erro ou o sucesso do envio só aparece. */
export function SetPasswordForm({ mode = "set", delay, labelledBy = "page-title" }: SetPasswordFormProps) {
  const isChange = mode === "change";
  const [state, formAction, pending] = useActionState(isChange ? changePassword : updatePassword, INITIAL_AUTH_STATE);
  const { ready, cascade, item } = useAuthCascade(delay);
  const [showPassword, setShowPassword] = useState(false);
  useFocusFirstError(state, FIELD_IDS, ["atual", "senha", "confirmacao"]);
  const type = showPassword ? "text" : "password";

  return (
    <motion.form
      className={styles.form}
      action={formAction}
      noValidate
      aria-labelledby={labelledBy}
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={cascade}
    >
      {isChange && (
        <motion.div data-reveal="" variants={item}>
          <Field
            id="senha-atual"
            name="atual"
            type={type}
            label="Senha atual"
            autoComplete="current-password"
            autoCapitalize="none"
            spellCheck={false}
            error={state.fieldErrors?.atual}
          />
        </motion.div>
      )}
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
          {pending ? "Salvando…" : isChange ? "Trocar senha" : "Salvar senha"}
        </MotionButton>
      </motion.div>

      {/* Um bloco só no grid do formulário; as regiões vivas ficam sempre montadas para o leitor de tela anunciar. */}
      <div className={styles.status}>
        <div role="alert">
          {state.error && (
            <p className={styles.alert}>
              <CircleAlert size={18} aria-hidden="true" />
              <span>{state.error}</span>
            </p>
          )}
        </div>
        <div role="status">
          {state.success && (
            <p>
              <CircleCheck size={18} aria-hidden="true" />
              <span>{state.success}</span>
            </p>
          )}
        </div>
      </div>
    </motion.form>
  );
}
