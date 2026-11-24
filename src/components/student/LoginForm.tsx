"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Info } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { MotionButton } from "@/motion/MotionButton";
import { compactErrors, validateEmail, validatePassword } from "@/lib/validation";
import { useAuthCascade } from "./AuthCard";
import styles from "./LoginForm.module.css";

interface LoginErrors {
  email?: string;
  senha?: string;
}

/* Sem autenticação nesta etapa: valida os campos e explica que o login ainda não está ativo.
   Integração prevista: Supabase Auth (docs/06-TECHNICAL-ARCHITECTURE.md).
   Entrada em cascata (ordem de leitura): e-mail → senha → mostrar senha → entrar. O aviso depois do envio só aparece. */
export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { ready, cascade, item } = useAuthCascade();
  const hasErrors = Object.keys(errors).length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors = compactErrors({
      email: validateEmail(String(data.get("email") ?? "")),
      senha: validatePassword(String(data.get("senha") ?? "")),
    });
    const [firstInvalid] = Object.keys(nextErrors);
    /* flushSync grava o erro no DOM antes do foco: aria-invalid e aria-describedby já existem quando o leitor lê o campo. */
    flushSync(() => {
      setErrors(nextErrors);
      setSubmitted(firstInvalid === undefined);
    });
    if (firstInvalid) {
      const field = form.elements.namedItem(firstInvalid);
      if (field instanceof HTMLElement) field.focus();
    }
  }

  return (
    <motion.form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="page-title"
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={cascade}
    >
      <motion.div data-reveal="" variants={item}>
        <Field
          id="login-email"
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email}
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
          error={errors.senha}
        />
      </motion.div>
      <motion.label className={styles.toggle} data-reveal="" variants={item}>
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
        Mostrar senha
      </motion.label>

      <motion.div data-reveal="" variants={item}>
        <MotionButton type="submit" variant="primary" className={styles.submit}>
          Entrar
        </MotionButton>
      </motion.div>

      <div className={styles.status} role="status" aria-live="polite">
        {hasErrors && <span className="visually-hidden">Corrija os campos com erro para entrar.</span>}
        {submitted && (
          <p>
            <Info size={18} aria-hidden="true" />
            <span>
              O login ainda não está ativo. <Link href="/area-do-aluno">Ver a demonstração da Área do Aluno</Link>
            </span>
          </p>
        )}
      </div>
    </motion.form>
  );
}
