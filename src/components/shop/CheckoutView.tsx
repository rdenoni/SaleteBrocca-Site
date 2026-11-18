import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { validatedCheckoutUrl } from "@/lib/kiwify/checkout-url";
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
  /** Link de checkout da Kiwify (`kiwify.checkoutUrl`); só é usado se for https em kiwify.com.br. */
  checkoutUrl: string | null;
  /** true para curso (compra libera a Área do Aluno); false para produto da Loja, entregue pela própria Kiwify. */
  grantsCourseAccess: boolean;
}

const STEPS = ["Resumo", "Pagamento na Kiwify", "Confirmação por e-mail"] as const;

function Pending() {
  return <span className="pending">A confirmar</span>;
}

/* O pagamento acontece no ambiente da Kiwify: este site não coleta nome, e-mail nem telefone do comprador.
   Usado pela Loja (/loja/checkout) e pela inscrição do curso (/cursos/[slug]/compra). */
export function CheckoutView({
  item,
  stepsLabel,
  backHref,
  backLabel,
  checkoutUrl,
  grantsCourseAccess,
}: CheckoutViewProps) {
  const paymentUrl = validatedCheckoutUrl(checkoutUrl);

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

        <section className={styles.panel} aria-labelledby="pagamento-titulo">
          <h2 id="pagamento-titulo" className={styles.panelHeading}>
            Pagamento
          </h2>
          <p className={styles.text}>
            O pagamento é feito no ambiente seguro da Kiwify.
            {grantsCourseAccess
              ? " Depois da confirmação, você recebe por e-mail o link para criar sua senha da Área do Aluno."
              : " Depois da confirmação, você recebe o produto pelo e-mail informado na compra."}
          </p>

          {paymentUrl ? (
            <div className={styles.action}>
              <Button href={paymentUrl} external variant="primary" className={styles.cta}>
                Ir para o pagamento
              </Button>
              <p className={styles.small}>
                O pagamento abre no site da Kiwify. Veja como tratamos seus dados na{" "}
                <Link href="/privacidade">política de privacidade</Link>.
              </p>
            </div>
          ) : (
            <div className={styles.paymentNote} role="note">
              <Lock aria-hidden="true" />
              <p>
                <strong>Pagamento online em preparação.</strong> O link de pagamento será disponibilizado assim que o
                produto for publicado na Kiwify.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
