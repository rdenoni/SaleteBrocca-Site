"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import styles from "./CheckoutView.module.css";

export interface CheckoutItem {
  title: string;
  /** Dados confirmados do item (ex.: "6 módulos", "21 aulas"). */
  details: string[];
  /** null enquanto a cliente não confirmar. */
  price: string | null;
}

interface CheckoutViewProps {
  item: CheckoutItem;
  /** Rótulo acessível da lista de etapas (ex.: "Etapas da compra"). */
  stepsLabel: string;
  backHref: string;
  backLabel: string;
  /** Prefixo dos ids dos campos, para não colidir entre páginas. */
  idPrefix: string;
}

const STEPS = ["Seus dados", "Pagamento", "Confirmação"] as const;

function Pending() {
  return <span className="pending">A confirmar</span>;
}

/* Sem gateway ainda: nunca deixa o navegador enviar o formulário (sem isso, um envio
   acidental mandaria nome, e-mail e telefone para a própria URL em query string). */
function blockSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

/* Somente visual nesta etapa: nenhum dado é enviado e não há gateway de pagamento.
   Usado pela Loja (/loja/checkout) e pela inscrição do curso (/cursos/[slug]/compra). */
export function CheckoutView({ item, stepsLabel, backHref, backLabel, idPrefix }: CheckoutViewProps) {
  return (
    <div className={`container ${styles.page}`}>
      <ol className={styles.steps} aria-label={stepsLabel}>
        {STEPS.map((step, index) => (
          <li key={step} aria-current={index === 0 ? "step" : undefined}>
            <span className={styles.stepNumber}>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <div className={styles.layout}>
        <aside className={styles.summary} data-surface="dark" aria-labelledby="resumo">
          <h2 id="resumo" className={styles.summaryHeading}>
            Resumo do pedido
          </h2>
          <p className={styles.summaryTitle}>{item.title}</p>
          <ul className={styles.summaryMeta}>
            {item.details.map((detail) => (
              <li key={detail}>
                <Check aria-hidden="true" />
                {detail}
              </li>
            ))}
          </ul>
          <dl className={styles.lines}>
            <div>
              <dt>Quantidade</dt>
              <dd>1</dd>
            </div>
            <div className={styles.total}>
              <dt>Total</dt>
              <dd>{item.price ? <strong>{item.price}</strong> : <Pending />}</dd>
            </div>
          </dl>
          <Link href={backHref} className={styles.back}>
            {backLabel}
          </Link>
        </aside>

        <form className={styles.form} aria-labelledby="dados-titulo" onSubmit={blockSubmit}>
          <h2 id="dados-titulo" className={styles.formHeading}>
            Seus dados
          </h2>
          <Field id={`${idPrefix}-nome`} name="nome" label="Nome completo" autoComplete="name" required />
          <Field
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            label="E-mail"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <Field
            id={`${idPrefix}-telefone`}
            name="telefone"
            type="tel"
            inputMode="tel"
            label="Telefone"
            autoComplete="tel"
            hint="Com DDD."
            required
          />

          <div className={styles.payment}>
            <h3 className={styles.paymentHeading}>Forma de pagamento</h3>
            <div id={`${idPrefix}-pagamento-nota`} className={styles.paymentNote} role="note">
              <Lock aria-hidden="true" />
              <p>
                <strong>Pagamento online em preparação.</strong> As formas de pagamento serão definidas na integração
                com o meio de pagamento.
              </p>
            </div>
          </div>

          <label className={styles.consent}>
            <input type="checkbox" name="privacidade" required />
            <span>
              Li e aceito a <Link href="/privacidade">política de privacidade</Link>.
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            aria-disabled="true"
            aria-describedby={`${idPrefix}-pagamento-nota`}
            className={styles.submit}
          >
            Continuar para pagamento
          </Button>
        </form>
      </div>
    </div>
  );
}
