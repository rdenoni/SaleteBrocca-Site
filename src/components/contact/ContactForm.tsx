"use client";

import { motion, stagger, type Variants } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { CircleAlert } from "lucide-react";
import { Field, SelectField, TextAreaField } from "@/components/ui/Field";
import { CONTACT_SUBJECTS } from "@/lib/content/contact";
import { AnimatedCheck } from "@/motion/icons";
import { MotionButton } from "@/motion/MotionButton";
import { revealVariants } from "@/motion/Reveal";
import { useEntranceReady } from "@/motion/transitions/useEntranceReady";
import { useMotionTokens } from "@/motion/useMotionTokens";
import {
  compactErrors,
  validateConsent,
  validateMessage,
  validateName,
  validateOptionalEmail,
  validatePhone,
} from "@/lib/validation";
import styles from "./ContactForm.module.css";

interface ContactErrors {
  nome?: string;
  telefone?: string;
  email?: string;
  mensagem?: string;
  privacidade?: string;
}

function readErrors(data: FormData): ContactErrors {
  return compactErrors({
    nome: validateName(String(data.get("nome") ?? "")),
    telefone: validatePhone(String(data.get("telefone") ?? "")),
    email: validateOptionalEmail(String(data.get("email") ?? "")),
    mensagem: validateMessage(String(data.get("mensagem") ?? "")),
    privacidade: validateConsent(data.get("privacidade") === "on"),
  });
}

interface ContactFormProps {
  /** Quando a cascata dos campos começa (s), ao montar e depois da cortina de transição. */
  entranceDelay?: number;
}

/* Sem backend nesta etapa: valida e avisa que o envio ainda não está ativo.
   Integração prevista: rota de servidor + e-mail/CRM (docs/06-TECHNICAL-ARCHITECTURE.md).
   Entrada em cascata, na ordem de leitura: título → nome/telefone → e-mail → assunto → mensagem → consentimento → enviar. */
export function ContactForm({ entranceDelay = 0 }: ContactFormProps) {
  const t = useMotionTokens();
  const ready = useEntranceReady();
  const cascade: Variants = {
    hidden: {},
    visible: {
      transition: { delayChildren: stagger(t.reduced ? 0 : t.stagger.items, { startDelay: t.reduced ? 0 : entranceDelay }) },
    },
  };
  const item = revealVariants("rise", t);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const errorCount = Object.keys(errors).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = readErrors(new FormData(form));
    const [firstInvalid] = Object.keys(nextErrors);
    /* flushSync: o foco só vai ao campo depois de o React aplicar aria-invalid/aria-describedby,
       senão o leitor de tela anuncia o campo sem o erro. */
    flushSync(() => {
      setErrors(nextErrors);
      setSubmitted(firstInvalid === undefined);
    });
    /* Os erros seguem a ordem dos campos: leva o foco ao primeiro a corrigir. */
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
      aria-labelledby="formulario-titulo"
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={cascade}
    >
      <motion.h2 id="formulario-titulo" className={styles.title} data-reveal="" variants={item}>
        Envie uma mensagem
      </motion.h2>

      <motion.div className={styles.row} data-reveal="" variants={item}>
        <Field id="contato-nome" name="nome" label="Nome completo" autoComplete="name" error={errors.nome} />
        <Field
          id="contato-telefone"
          name="telefone"
          type="tel"
          inputMode="tel"
          label="Telefone"
          autoComplete="tel"
          hint="Com DDD."
          error={errors.telefone}
        />
      </motion.div>
      <motion.div data-reveal="" variants={item}>
        <Field
          id="contato-email"
          name="email"
          type="email"
          label="E-mail (opcional)"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          error={errors.email}
        />
      </motion.div>
      <motion.div data-reveal="" variants={item}>
        <SelectField id="contato-assunto" name="assunto" label="Assunto" options={CONTACT_SUBJECTS} />
      </motion.div>
      <motion.div data-reveal="" variants={item}>
        <TextAreaField
          id="contato-mensagem"
          name="mensagem"
          label="Mensagem"
          hint="Não inclua dados de saúde de crianças ou adolescentes."
          error={errors.mensagem}
        />
      </motion.div>

      <motion.div className={styles.consentWrap} data-reveal="" variants={item}>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="privacidade"
            aria-invalid={errors.privacidade ? true : undefined}
            aria-describedby={errors.privacidade ? "contato-privacidade-erro" : undefined}
          />
          <span>
            Concordo com o uso dos meus dados para responder a este contato, conforme a{" "}
            <Link href="/privacidade">política de privacidade</Link>.
          </span>
        </label>
        {errors.privacidade && (
          <p id="contato-privacidade-erro" className={styles.error}>
            <CircleAlert aria-hidden="true" />
            {errors.privacidade}
          </p>
        )}
      </motion.div>

      <motion.div className={styles.actions} data-reveal="" variants={item}>
        <MotionButton type="submit" variant="primary">
          Enviar mensagem
        </MotionButton>
        <p className={errorCount > 0 ? styles.error : styles.status} role="status">
          {errorCount > 0 && (
            <>
              <CircleAlert aria-hidden="true" />
              {errorCount === 1 ? "Corrija o campo destacado." : `Corrija os ${errorCount} campos destacados.`}
            </>
          )}
          {submitted && (
            <>
              {/* O check se desenha (o traço) a cada envio conferido. */}
              <AnimatedCheck size={18} />
              Dados conferidos. O envio online será ativado em breve.
            </>
          )}
        </p>
      </motion.div>
    </motion.form>
  );
}
