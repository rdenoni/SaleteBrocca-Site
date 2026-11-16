"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { compactErrors, validateName, validatePhone } from "@/lib/validation";
import styles from "./EvaluationForm.module.css";

interface FormErrors {
  nome?: string;
  telefone?: string;
}

const FIELD_ORDER = ["nome", "telefone"] as const;

function validate(nome: string, telefone: string): FormErrors {
  return compactErrors({ nome: validateName(nome), telefone: validatePhone(telefone) });
}

/* Sem backend nesta etapa: valida os campos e informa que o envio ainda não está ativo.
   Integração prevista: rota de servidor + e-mail/CRM (ver docs/06-TECHNICAL-ARCHITECTURE.md). */
export function EvaluationForm() {
  const id = useId();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors = validate(String(data.get("nome") ?? ""), String(data.get("telefone") ?? ""));
    /* Confirma os erros no DOM antes de focar: o campo já nasce com aria-invalid/aria-describedby. */
    flushSync(() => {
      setErrors(nextErrors);
      setSubmitted(Object.keys(nextErrors).length === 0);
    });
    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
  }

  const nomeErrorId = `${id}-nome-erro`;
  const telefoneErrorId = `${id}-telefone-erro`;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby={`${id}-titulo`}>
      <div className={styles.head}>
        <span className={styles.mark} aria-hidden="true">
          ?
        </span>
        <h2 id={`${id}-titulo`} className={styles.title}>
          Quer marcar
          <br />
          uma avaliação?
        </h2>
      </div>

      <div className={styles.field} data-invalid={errors.nome ? "" : undefined}>
        <label htmlFor={`${id}-nome`} className="visually-hidden">
          Nome completo
        </label>
        <input
          id={`${id}-nome`}
          name="nome"
          className={styles.input}
          autoComplete="name"
          placeholder="Nome completo…"
          aria-required="true"
          aria-invalid={errors.nome ? true : undefined}
          aria-describedby={errors.nome ? nomeErrorId : undefined}
        />
        {errors.nome && (
          <p id={nomeErrorId} className={styles.error} aria-live="polite">
            <CircleAlert aria-hidden="true" />
            {errors.nome}
          </p>
        )}
      </div>

      <div className={styles.field} data-invalid={errors.telefone ? "" : undefined}>
        <label htmlFor={`${id}-telefone`} className="visually-hidden">
          Telefone com DDD
        </label>
        <input
          id={`${id}-telefone`}
          name="telefone"
          type="tel"
          inputMode="tel"
          className={styles.input}
          autoComplete="tel"
          placeholder="Telefone com DDD…"
          aria-required="true"
          aria-invalid={errors.telefone ? true : undefined}
          aria-describedby={errors.telefone ? telefoneErrorId : undefined}
        />
        {errors.telefone && (
          <p id={telefoneErrorId} className={styles.error} aria-live="polite">
            <CircleAlert aria-hidden="true" />
            {errors.telefone}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="outline">
          Pedir avaliação
        </Button>
      </div>

      <p className={styles.privacy}>
        Saiba como seus dados são tratados na <Link href="/privacidade">política de privacidade</Link>.
      </p>

      <p className={styles.status} role="status">
        {submitted && (
          <>
            <CircleCheck aria-hidden="true" />
            Dados conferidos. O envio online será ativado em breve.
          </>
        )}
      </p>
    </form>
  );
}
