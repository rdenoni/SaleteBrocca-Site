import type { Metadata } from "next";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { EMAIL } from "@/lib/content/contact";
import { PROFILE_NAME } from "@/lib/content/profile";
import { DATA_COLLECTION, DATA_SUBJECT_RIGHTS, PRIVACY_UPDATED_AT } from "@/lib/content/privacy";
import styles from "./privacidade.module.css";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como o site de Maria Salete Brocca Denoni trata os dados informados nos formulários.",
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

const SECTIONS = [
  { id: "dados", label: "Dados pedidos" },
  { id: "situacao", label: "Situação atual" },
  { id: "uso", label: "Uso dos dados" },
  { id: "cookies", label: "Cookies" },
  { id: "direitos", label: "Seus direitos" },
  { id: "responsavel", label: "Responsável" },
] as const;

function Pending({ children = "A confirmar" }: { children?: string }) {
  return <span className="pending">{children}</span>;
}

/* Só fatos do site + direitos da LGPD. Texto jurídico definitivo: pendência da cliente. */
export default function PrivacyPage() {
  return (
    <>
      <PageBanner eyebrow="LGPD" title="Política de privacidade" size="compact" />

      <div className={`container ${styles.page}`}>
        <div className={styles.column}>
          <p className={styles.notice} role="note">
            <Info aria-hidden="true" />
            <span>
              <strong>Versão provisória.</strong> O texto jurídico definitivo e o responsável pelos dados serão
              confirmados antes do lançamento do site.
            </span>
          </p>
          <p className={styles.updated}>
            Última atualização:{" "}
            {PRIVACY_UPDATED_AT ? (
              <time dateTime={PRIVACY_UPDATED_AT}>{DATE_FORMAT.format(new Date(PRIVACY_UPDATED_AT))}</time>
            ) : (
              <Pending />
            )}
          </p>

          <nav className={styles.toc} aria-label="Nesta página">
            <ol>
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <section id="dados" className={styles.section} aria-labelledby="dados-titulo">
            <h2 id="dados-titulo">Quais dados o site pede</h2>
            <p>O site só pede dados que você digita nos formulários:</p>
            <dl className={styles.forms}>
              {DATA_COLLECTION.map((point) => (
                <div key={point.form}>
                  <dt>
                    <Link href={point.href}>{point.form}</Link>
                  </dt>
                  <dd>{point.fields.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="situacao" className={styles.section} aria-labelledby="situacao-titulo">
            <h2 id="situacao-titulo">Situação atual</h2>
            <p>
              Nesta versão, os formulários de avaliação, contato e login apenas conferem no seu navegador se os campos
              foram preenchidos, e o formulário de inscrição e compra fica desativado. Nenhum dado digitado nos
              formulários é enviado, armazenado ou compartilhado. O login da Área do Aluno e o pagamento online ainda
              não estão ativos.
            </p>
          </section>

          <section id="uso" className={styles.section} aria-labelledby="uso-titulo">
            <h2 id="uso-titulo">Como os dados serão usados</h2>
            <p>
              Quando o envio for ativado, esta seção vai descrever a finalidade de cada formulário, a base legal, por
              quanto tempo os dados ficam guardados e com quem podem ser compartilhados.
            </p>
            <dl className={styles.pendingList}>
              <div>
                <dt>Finalidade e base legal</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
              <div>
                <dt>Prazo de guarda</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
              <div>
                <dt>Compartilhamento com terceiros</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
            </dl>
          </section>

          {/* Reescrever na fase 8 (hospedagem, Cloudflare, analytics): hoje é verdade, depois deixa de ser. */}
          <section id="cookies" className={styles.section} aria-labelledby="cookies-titulo">
            <h2 id="cookies-titulo">Cookies e medição de acesso</h2>
            <p>
              Esta versão do site não usa cookies de publicidade nem ferramentas de análise de acesso, e não carrega
              conteúdo de outros sites.
            </p>
          </section>

          <section id="direitos" className={styles.section} aria-labelledby="direitos-titulo">
            <h2 id="direitos-titulo">Seus direitos</h2>
            <p>A Lei Geral de Proteção de Dados (Lei 13.709/2018) garante a você, entre outros, o direito de:</p>
            <ul className={styles.rights}>
              {DATA_SUBJECT_RIGHTS.map((right) => (
                <li key={right}>
                  <Check aria-hidden="true" />
                  {right}
                </li>
              ))}
            </ul>
          </section>

          <section id="responsavel" className={styles.section} aria-labelledby="responsavel-titulo">
            <h2 id="responsavel-titulo">Responsável e contato</h2>
            <dl className={styles.pendingList}>
              <div>
                <dt>Responsável pelos dados</dt>
                <dd>
                  {PROFILE_NAME} <Pending />
                </dd>
              </div>
              <div>
                <dt>E-mail para pedidos sobre dados</dt>
                <dd>
                  {EMAIL.href ? <a href={EMAIL.href}>{EMAIL.display}</a> : <Pending />}
                </dd>
              </div>
            </dl>
            <p>
              Enquanto isso, você pode falar com a Salete pela <Link href="/contato">página de contato</Link>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
