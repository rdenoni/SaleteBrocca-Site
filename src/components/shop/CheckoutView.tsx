import Link from "next/link";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { validatedCheckoutUrl } from "@/lib/kiwify/checkout-url";
import type { ProductDelivery } from "@/types/content";
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
  delivery: CheckoutDelivery;
}

/** "course-access": curso (a compra libera a Área do Aluno); os demais vêm de `Product.delivery`. */
export type CheckoutDelivery = "course-access" | ProductDelivery;

const STEPS = ["Resumo", "Pagamento na Kiwify", "Confirmação por e-mail"] as const;

function Pending() {
  return <span className="pending">A confirmar</span>;
}

function DeliveryNote({ delivery }: { delivery: CheckoutDelivery }) {
  if (delivery === "course-access") {
    return <>Depois da confirmação, você recebe por e-mail o link para criar sua senha da Área do Aluno.</>;
  }
  if (delivery === "email") {
    return <>Depois da confirmação, você recebe o produto pelo e-mail informado na compra.</>;
  }
  if (delivery === "download") {
    return <>Depois da confirmação, o download fica disponível diretamente aqui no site.</>;
  }
  return (
    <>
      Depois da confirmação, o pedido é enviado pelos Correios, com frete grátis, para o endereço informado no
      pagamento. O prazo de postagem está na página do produto e o código de rastreio chega por e-mail.
    </>
  );
}

/* O pagamento acontece no ambiente da Kiwify: este site não coleta nome, e-mail nem telefone do comprador.
   Usado pela Loja (/loja/checkout) e pela inscrição do curso (/cursos/[slug]/compra). */
export function CheckoutView({
  item,
  stepsLabel,
  backHref,
  backLabel,
  checkoutUrl,
  delivery,
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
            O pagamento é feito no ambiente seguro da Kiwify. <DeliveryNote delivery={delivery} />
          </p>

          {paymentUrl ? (
            <div className={styles.action}>
              <Button href={paymentUrl} external variant="primary" className={styles.cta}>
                Ir para o pagamento
              </Button>
              <p className={styles.small}>
                O pagamento abre no site da Kiwify. Ao continuar, você concorda com os{" "}
                <Link href="/termos-de-uso">termos de uso</Link> e a{" "}
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

          <div className={styles.guaranteeBox} role="note">
            <ShieldCheck aria-hidden="true" />
            <p>
              <strong>Direito de arrependimento (Art. 49 do CDC):</strong> reembolso integral em até 7 dias corridos
              após a compra (cursos e digitais) ou após o recebimento (produtos físicos).{" "}
              <Link href="/termos-de-uso#reembolso">Ver política de reembolso e garantia</Link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
