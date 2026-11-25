import type { Metadata } from "next";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { CookiePreferencesButton } from "@/components/privacy/CookiePreferencesButton";
import { EMAIL, PRIVACY_SUBJECT } from "@/lib/content/contact";
import { PROFILE_CRFA, PROFILE_NAME } from "@/lib/content/profile";
import {
  COOKIE_CATEGORIES,
  DATA_FLOWS,
  DATA_OPERATORS,
  DATA_SUBJECT_RIGHTS,
  PRIVACY_UPDATED_AT,
} from "@/lib/content/privacy";
import styles from "./privacidade.module.css";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como o site de Maria Salete Brocca Denoni trata dados pessoais, com base na LGPD: quais dados, para quê, com quem e como exercer seus direitos.",
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });
const ANPD_URL = "https://www.gov.br/anpd";
const PRIVACY_FORM_HREF = "/contato#formulario";

/* O rótulo "Dados pedidos" e o id "dados" são usados por tests/anchors.spec.ts. */
const SECTIONS = [
  { id: "quem", label: "Quem somos" },
  { id: "encarregado", label: "Encarregado" },
  { id: "dados", label: "Dados pedidos" },
  { id: "bases", label: "Finalidades e bases legais" },
  { id: "criancas", label: "Crianças e adolescentes" },
  { id: "compartilhamento", label: "Compartilhamento" },
  { id: "transferencia", label: "Transferência internacional" },
  { id: "retencao", label: "Guarda dos dados" },
  { id: "seguranca", label: "Segurança" },
  { id: "cookies", label: "Cookies" },
  { id: "direitos", label: "Seus direitos" },
  { id: "pedidos", label: "Como fazer um pedido" },
  { id: "alteracoes", label: "Alterações" },
] as const;

function Pending({ children = "A confirmar" }: { children?: string }) {
  return <span className="pending">{children}</span>;
}

/* Descreve o que o código do site faz (auditoria em docs/08 e docs/09). O texto precisa ser validado pela
   cliente e por quem responde juridicamente antes do lançamento (docs/07, pendência 10). */
export default function PrivacyPage() {
  return (
    <>
      <PageBanner eyebrow="LGPD" title="Política de privacidade" size="compact" />

      <div className={`container ${styles.page}`}>
        <div className={styles.column}>
          <p className={styles.notice} role="note">
            <Info aria-hidden="true" />
            <span>
              <strong>Versão provisória.</strong> Este texto ainda precisa ser validado pela titular do site e por
              profissional jurídico antes do lançamento. Os itens marcados como “A confirmar” dependem dessa decisão.
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

          <p className={styles.intro}>
            Esta política explica, em linguagem simples, quais dados pessoais este site trata, para quê, com quem são
            compartilhados e como você pode exercer seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei
            13.709/2018). Alguns recursos descritos aqui, como o envio dos formulários e o login da Área do Aluno,
            ainda estão sendo ativados; onde for o caso, o texto diz o que acontece hoje.
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

          <section id="quem" className={styles.section} aria-labelledby="quem-titulo">
            <h2 id="quem-titulo">Quem somos</h2>
            <p>
              O controlador dos dados, que decide como eles são tratados, é <strong>{PROFILE_NAME}</strong>,
              professora e fonoaudióloga clínica, responsável por este site.
            </p>
            <dl className={styles.pendingList}>
              <div>
                <dt>Nome</dt>
                <dd>{PROFILE_NAME}</dd>
              </div>
              {PROFILE_CRFA && (
                <div>
                  <dt>Registro profissional</dt>
                  <dd>{PROFILE_CRFA}</dd>
                </div>
              )}
              <div>
                <dt>CPF ou CNPJ</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
              <div>
                <dt>Endereço</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
            </dl>
          </section>

          <section id="encarregado" className={styles.section} aria-labelledby="encarregado-titulo">
            <h2 id="encarregado-titulo">Encarregado pelo tratamento de dados e canal de contato</h2>
            <p>
              O encarregado (art. 41 da LGPD) é a pessoa que recebe os pedidos dos titulares e fala com a Autoridade
              Nacional de Proteção de Dados (ANPD).
            </p>
            <dl className={styles.pendingList}>
              <div>
                <dt>Encarregado</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
              <div>
                <dt>E-mail para pedidos sobre dados</dt>
                <dd>{EMAIL.href ? <a href={EMAIL.href}>{EMAIL.display}</a> : <Pending />}</dd>
              </div>
            </dl>
            <p>
              Enquanto o e-mail não é confirmado, use o <Link href={PRIVACY_FORM_HREF}>formulário de contato</Link> e
              escolha o assunto “{PRIVACY_SUBJECT}”.
            </p>
          </section>

          <section id="dados" className={styles.section} aria-labelledby="dados-titulo">
            <h2 id="dados-titulo">Quais dados o site trata</h2>
            <p>Estes são todos os pontos em que dados pessoais passam pelo site:</p>
            <ul className={styles.flows}>
              {DATA_FLOWS.map((flow) => (
                <li key={flow.id} className={styles.flow}>
                  <h3>{flow.href ? <Link href={flow.href}>{flow.title}</Link> : flow.title}</h3>
                  <p className={styles.fields}>{flow.fields.join("; ")}.</p>
                  <p>{flow.status}</p>
                </li>
              ))}
            </ul>
            <p>
              Não coletamos dados de cartão nem de pagamento no site, e não usamos ferramentas de análise de visitas,
              publicidade nem fontes ou conteúdo carregados de outros sites.
            </p>
          </section>

          <section id="bases" className={styles.section} aria-labelledby="bases-titulo">
            <h2 id="bases-titulo">Finalidades e bases legais</h2>
            <p>Cada tratamento tem uma finalidade e uma base legal do art. 7º da LGPD:</p>
            <dl className={styles.basis}>
              {DATA_FLOWS.map((flow) => (
                <div key={flow.id}>
                  <dt>{flow.title}</dt>
                  <dd>
                    <span>
                      <strong>Para quê:</strong> {flow.purpose}
                    </span>
                    <span>
                      <strong>Base legal:</strong> {flow.legalBasis}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              Quando a base é o consentimento, você pode retirá-lo a qualquer momento, sem custo, pelos canais da seção
              “Como fazer um pedido”. Se você não marcar a caixa de consentimento, o formulário não é enviado, e você
              pode usar outro canal de contato.
            </p>
          </section>

          <section id="criancas" className={styles.section} aria-labelledby="criancas-titulo">
            <h2 id="criancas-titulo">Crianças e adolescentes</h2>
            <p>
              O site atende famílias, mas os formulários são para o adulto responsável: pedimos só o nome e o contato
              dele, nunca dados de crianças ou adolescentes. Dados de saúde são dados pessoais sensíveis (art. 11) e o
              tratamento de dados de crianças exige o consentimento específico de um dos pais ou do responsável legal
              (art. 14).
            </p>
            <p>
              <strong>Por isso, não escreva dados de saúde, diagnósticos nem informações da criança nos campos de
              texto livre</strong>, como a mensagem do formulário de contato. Combinaremos o que for preciso pelo
              atendimento.
            </p>
          </section>

          <section id="compartilhamento" className={styles.section} aria-labelledby="compartilhamento-titulo">
            <h2 id="compartilhamento-titulo">Com quem compartilhamos</h2>
            <p>
              Não vendemos dados pessoais. Usamos estes fornecedores, que tratam dados para fazer o site funcionar:
            </p>
            <dl className={styles.pendingList}>
              {DATA_OPERATORS.map((operator) => (
                <div key={operator.name}>
                  <dt>{operator.name}</dt>
                  <dd>
                    {operator.role} {operator.data}
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              A Kiwify trata os dados da compra conforme os próprios termos e a própria política de privacidade dela.
              Quando as aulas em vídeo forem ativadas, o provedor de vídeo será acrescentado a esta lista. Também
              podemos compartilhar dados com autoridades quando a lei exigir.
            </p>
          </section>

          <section id="transferencia" className={styles.section} aria-labelledby="transferencia-titulo">
            <h2 id="transferencia-titulo">Transferência internacional de dados</h2>
            <p>
              Alguns fornecedores usam servidores ou equipes fora do Brasil. Nesses casos, os dados podem ser
              transferidos para outros países, o que a LGPD permite nas hipóteses do art. 33, como a transferência para
              país ou organismo com grau adequado de proteção, cláusulas contratuais ou o seu consentimento específico.
            </p>
            <dl className={styles.pendingList}>
              <div>
                <dt>Países e mecanismo usado por fornecedor</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
            </dl>
          </section>

          <section id="retencao" className={styles.section} aria-labelledby="retencao-titulo">
            <h2 id="retencao-titulo">Por quanto tempo guardamos os dados</h2>
            <p>Guardamos os dados só pelo tempo necessário para a finalidade. Hoje, na prática:</p>
            <ul className={styles.plainList}>
              <li>
                Formulários de avaliação e de contato: ainda não são enviados e, portanto, não são guardados.
              </li>
              <li>Progresso das aulas: é apagado junto com a conta, se a conta for excluída.</li>
              <li>
                Sua escolha sobre cookies: fica no seu navegador até você limpá-lo ou mudá-la.
              </li>
              <li>
                Matrículas e registros de pedidos da Kiwify: o sistema não os apaga sozinho, e o acesso ao curso hoje não
                tem data de expiração.
              </li>
            </ul>
            <dl className={styles.pendingList}>
              <div>
                <dt>Prazo de guarda de matrículas e registros de pedidos</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
              <div>
                <dt>Prazo de guarda das mensagens recebidas pelos formulários</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
            </dl>
            <p>Depois do prazo, os dados são apagados ou anonimizados, exceto se a lei exigir que sejam mantidos.</p>
          </section>

          <section id="seguranca" className={styles.section} aria-labelledby="seguranca-titulo">
            <h2 id="seguranca-titulo">Segurança</h2>
            <ul className={styles.plainList}>
              <li>As senhas são guardadas apenas de forma criptografada, nunca em texto legível.</li>
              <li>Cada aluno só consegue ver as próprias matrículas e o próprio progresso.</li>
              <li>As chaves secretas dos serviços ficam só no servidor, nunca no navegador.</li>
              <li>
                Os avisos de compra da Kiwify só são aceitos com assinatura válida, e guardamos deles o mínimo
                necessário: e-mail, número e situação do pedido e produto.
              </li>
            </ul>
            <p>
              Nenhum sistema é totalmente seguro. Se houver um incidente que possa causar risco ou dano relevante a você,
              avisaremos você e a ANPD, como determina o art. 48 da LGPD.
            </p>
          </section>

          <section id="cookies" className={styles.section} aria-labelledby="cookies-titulo">
            <h2 id="cookies-titulo">Cookies</h2>
            <p>
              Cookies são pequenos arquivos que o site guarda no seu navegador. Dividimos em três categorias; só os
              necessários estão em uso hoje.
            </p>
            <dl className={styles.pendingList}>
              {COOKIE_CATEGORIES.map((category) => (
                <div key={category.id}>
                  <dt>
                    {category.label}
                    {category.required ? " (sempre ativos)" : ""}
                  </dt>
                  <dd>
                    {category.description} <strong>Hoje:</strong> {category.today}
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              Se algum dia usarmos medição de audiência ou marketing, só vamos ativá-los depois da sua escolha, e você
              poderá mudar de ideia quando quiser.
            </p>
            <p>
              <CookiePreferencesButton className={styles.linkButton}>Abrir preferências de cookies</CookiePreferencesButton>
            </p>
          </section>

          <section id="direitos" className={styles.section} aria-labelledby="direitos-titulo">
            <h2 id="direitos-titulo">Seus direitos</h2>
            <p>A Lei Geral de Proteção de Dados (Lei 13.709/2018, art. 18) garante a você, entre outros, o direito de:</p>
            <ul className={styles.rights}>
              {DATA_SUBJECT_RIGHTS.map((right) => (
                <li key={right}>
                  <Check aria-hidden="true" />
                  {right}
                </li>
              ))}
            </ul>
          </section>

          <section id="pedidos" className={styles.section} aria-labelledby="pedidos-titulo">
            <h2 id="pedidos-titulo">Como fazer um pedido sobre seus dados</h2>
            <p>
              Use o <Link href={PRIVACY_FORM_HREF}>formulário de contato</Link>, escolhendo o assunto “{PRIVACY_SUBJECT}”
              {EMAIL.href ? (
                <>
                  {" "}
                  ou escreva para <a href={EMAIL.href}>{EMAIL.display}</a>
                </>
              ) : null}
              . Diga qual direito quer exercer e, para sua segurança, podemos pedir uma confirmação de identidade antes
              de atender.
            </p>
            <p>
              Pela LGPD (art. 19), a confirmação de que tratamos seus dados e o acesso a eles são dados de forma
              imediata, em formato simplificado, ou em até 15 dias, por declaração completa. Os demais pedidos também são
              respondidos no prazo legal.
            </p>
            <h3 id="anpd" className={styles.subtitle}>
              Reclamação à ANPD
            </h3>
            <p>
              Se achar que o tratamento dos seus dados não respeita a lei, você também pode reclamar à Autoridade
              Nacional de Proteção de Dados:{" "}
              <a href={ANPD_URL} rel="noopener noreferrer">
                www.gov.br/anpd
              </a>
              .
            </p>
          </section>

          <section id="alteracoes" className={styles.section} aria-labelledby="alteracoes-titulo">
            <h2 id="alteracoes-titulo">Alterações desta política</h2>
            <p>
              Podemos atualizar esta política, por exemplo quando um recurso novo for ativado. A data da última
              atualização fica no início desta página; mudanças relevantes serão indicadas nesta página.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
