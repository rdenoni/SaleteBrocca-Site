"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { CircleAlert } from "lucide-react";
import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { AnimatedCheck } from "@/motion/icons";
import { MotionButton } from "@/motion/MotionButton";
import { TextReveal } from "@/motion/TextReveal";
import { TransitionLink } from "@/motion/transitions/TransitionLink";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { HOME_EVALUATION } from "@/lib/content/home";
import { compactErrors, validateConsent, validateName, validatePhone } from "@/lib/validation";
import styles from "./EvaluationForm.module.css";

/* Textos do formulário (home.ts) mais os do aviso de privacidade deste ponto de coleta (LGPD). */
const EVALUATION = {
  ...HOME_EVALUATION,
  consentBefore: "Concordo com o uso dos meus dados para retornar este pedido de avaliação, conforme a ",
  healthNotice: "Informe só os seus dados, como responsável. Não inclua dados de saúde da criança.",
} as const;

type TextFieldName = "nome" | "telefone";
type FieldName = TextFieldName | "privacidade";
type FormErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: readonly FieldName[] = ["nome", "telefone", "privacidade"];
const VALIDATORS: Record<TextFieldName, (value: string) => string | undefined> = {
  nome: validateName,
  telefone: validatePhone,
};

/* Mensagem de erro: o layout muda na hora (sem animar altura) e o texto entra com opacidade e uma subida curta.
   Reduzido: só opacidade. O contêiner é uma região viva sempre montada, para o leitor de tela anunciar o texto. */
function FieldError({ id, message }: { id: string; message?: string }) {
  const t = useMotionTokens();
  const offset = t.reduced ? 0 : t.distance.small;

  return (
    <div aria-live="polite">
      <AnimatePresence initial={false}>
        {message ? (
          <motion.div
            key="erro"
            initial={{ opacity: 0, y: offset }}
            animate={{ opacity: 1, y: 0, transition: { duration: t.duration.base, ease: t.ease.out } }}
            exit={{ opacity: 0, y: 0, transition: { duration: t.duration.instant, ease: t.ease.in } }}
          >
            <p id={id} className={styles.error}>
              <CircleAlert aria-hidden="true" />
              {message}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* O "?" gigante se encaixa: chega girado e menor e assenta com a mola do encaixe.
   Reduzido: só opacidade (escala e giro neutros, sem animar). */
function QuestionMark() {
  const t = useMotionTokens();
  const variants: Variants = t.reduced
    ? {
        hidden: { opacity: 0, scale: 1, rotate: 0, transition: { duration: t.duration.quick, scale: { duration: 0 }, rotate: { duration: 0 } } },
        visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: t.duration.quick, scale: { duration: 0 }, rotate: { duration: 0 } } },
      }
    : {
        hidden: { opacity: 0, scale: 0.6, rotate: -14 },
        visible: {
          opacity: 1,
          scale: 1,
          rotate: 0,
          transition: { ...t.spring.fit, opacity: { duration: t.duration.gentle, ease: t.ease.out } },
        },
      };

  /* O posicionamento (centralizado) fica no span de fora, em CSS; só o de dentro recebe transform do Motion. */
  return (
    <span className={styles.mark} aria-hidden="true">
      {/* Sem gatilho próprio: herda "hidden" → "visible" da seção (EvaluationSection), junto com os depoimentos. */}
      <motion.span className={styles.markGlyph} data-reveal="" variants={variants}>
        ?
      </motion.span>
    </span>
  );
}

/* Sem backend nesta etapa: valida os campos e informa que o envio online ainda não está ativo.
   Integração prevista: rota de servidor + e-mail/CRM (ver docs/06-TECHNICAL-ARCHITECTURE.md). */
export function EvaluationForm() {
  const id = useId();
  const t = useMotionTokens();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors = compactErrors({
      nome: VALIDATORS.nome(String(data.get("nome") ?? "")),
      telefone: VALIDATORS.telefone(String(data.get("telefone") ?? "")),
      privacidade: validateConsent(data.get("privacidade") === "on"),
    });
    /* Confirma o DOM antes de focar: o campo já nasce com aria-invalid e aria-describedby. */
    flushSync(() => {
      setErrors(nextErrors);
      setSubmitted(Object.keys(nextErrors).length === 0);
    });
    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) form.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
  }

  /* Corrigir o campo limpa o erro dele na hora; o aviso de sucesso some ao voltar a editar. */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as TextFieldName;
    setSubmitted(false);
    if (errors[name] && !VALIDATORS[name](event.target.value)) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  /* Marcar a caixa limpa o erro dela; qualquer mudança esconde o aviso de sucesso. */
  function handleConsentChange(event: ChangeEvent<HTMLInputElement>) {
    setSubmitted(false);
    if (errors.privacidade && event.target.checked) {
      setErrors((current) => ({ ...current, privacidade: undefined }));
    }
  }

  const titleId = `${id}-titulo`;
  const privacidadeErrorId = `${id}-privacidade-erro`;
  const nomeErrorId = `${id}-nome-erro`;
  const telefoneErrorId = `${id}-telefone-erro`;

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={titleId}
      data-reduced={t.reduced ? "" : undefined}
    >
      <div className={styles.head}>
        <QuestionMark />
        {/* As duas linhas do título ficam como no site; leitores de tela recebem a frase numa linha só. */}
        <TextReveal as="h2" id={titleId} className={styles.title} text={EVALUATION.titleLines.join("\n")} />
      </div>

      <div className={styles.field} data-invalid={errors.nome ? "" : undefined}>
        <label htmlFor={`${id}-nome`} className="visually-hidden">
          {EVALUATION.nameLabel}
        </label>
        <div className={styles.control}>
          <input
            id={`${id}-nome`}
            name="nome"
            className={styles.input}
            autoComplete="name"
            placeholder={EVALUATION.namePlaceholder}
            aria-required="true"
            aria-invalid={errors.nome ? true : undefined}
            aria-describedby={errors.nome ? nomeErrorId : undefined}
            onChange={handleChange}
          />
          <span className={styles.underline} aria-hidden="true" />
        </div>
        <FieldError id={nomeErrorId} message={errors.nome} />
      </div>

      <div className={styles.field} data-invalid={errors.telefone ? "" : undefined}>
        <label htmlFor={`${id}-telefone`} className="visually-hidden">
          {EVALUATION.phoneLabel}
        </label>
        <div className={styles.control}>
          <input
            id={`${id}-telefone`}
            name="telefone"
            type="tel"
            inputMode="tel"
            className={styles.input}
            autoComplete="tel"
            placeholder={EVALUATION.phonePlaceholder}
            aria-required="true"
            aria-invalid={errors.telefone ? true : undefined}
            aria-describedby={errors.telefone ? telefoneErrorId : undefined}
            onChange={handleChange}
          />
          <span className={styles.underline} aria-hidden="true" />
        </div>
        <FieldError id={telefoneErrorId} message={errors.telefone} />
      </div>

      <div className={styles.consentWrap}>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="privacidade"
            aria-invalid={errors.privacidade ? true : undefined}
            aria-describedby={errors.privacidade ? privacidadeErrorId : undefined}
            onChange={handleConsentChange}
          />
          <span>
            {EVALUATION.consentBefore}
            <TransitionLink href={EVALUATION.privacyLink.href}>{EVALUATION.privacyLink.label}</TransitionLink>.
          </span>
        </label>
        <FieldError id={privacidadeErrorId} message={errors.privacidade} />
      </div>

      <div className={styles.actions}>
        <MotionButton type="submit" variant="outline">
          {EVALUATION.submit}
        </MotionButton>
      </div>

      <p className={styles.privacy}>{EVALUATION.healthNotice}</p>

      {/* Região viva sempre montada: o texto de sucesso entra nela e é anunciado. */}
      <div role="status" className={styles.statusSlot}>
        <AnimatePresence initial={false}>
          {submitted ? (
            <motion.p
              key="sucesso"
              className={styles.status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: t.duration.base, ease: t.ease.out } }}
              exit={{ opacity: 0, transition: { duration: t.duration.instant, ease: t.ease.in } }}
            >
              <AnimatedCheck size={24} />
              {EVALUATION.success}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
