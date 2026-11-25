import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { PageBanner } from "@/components/layout/PageBanner";
import { EMAIL } from "@/lib/content/contact";
import { PROFILE_CRFA, PROFILE_NAME } from "@/lib/content/profile";
import styles from "./termos-de-uso.module.css";

export const metadata: Metadata = {
  title: "Termos de uso e política de reembolso",
  description:
    "Termos de uso, compra de cursos e produtos, licença da Área do Aluno, direitos autorais e política de reembolso (art. 49 do CDC) do site de Maria Salete Brocca Denoni.",
};

const SECTIONS = [
  { id: "identificacao", label: "Identificação" },
  { id: "finalidade", label: "Natureza informativa" },
  { id: "cursos", label: "Cursos e Área do Aluno" },
  { id: "loja", label: "Loja e entregas" },
  { id: "reembolso", label: "Reembolso e garantia" },
  { id: "propriedade", label: "Propriedade intelectual" },
  { id: "privacidade", label: "Privacidade" },
  { id: "foro", label: "Atendimento e foro" },
] as const;

function Pending({ children = "A confirmar" }: { children?: string }) {
  return <span className="pending">{children}</span>;
}

export default function TermsOfUsePage() {
  return (
    <>
      <PageBanner eyebrow="Jurídico" title="Termos de uso" size="compact" />

      <div className={`container ${styles.page}`}>
        <div className={styles.column}>
          <p className={styles.notice} role="note">
            <Info aria-hidden="true" />
            <span>
              <strong>Revisão jurídica recomendada.</strong> Estes termos refletem as regras da legislação brasileira
              (CDC, Lei de Direitos Autorais e LGPD) e o funcionamento atual do site. Os campos marcados como “A
              confirmar” aguardam apenas o preenchimento cadastral da titular.
            </span>
          </p>

          <p className={styles.intro}>
            Ao navegar por este site, adquirir cursos online ou produtos na Loja, ou utilizar a Área do Aluno, você
            concorda com estes Termos de Uso e Condições de Compra. Leia atentamente antes de concluir qualquer pedido.
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

          <section id="identificacao" className={styles.section} aria-labelledby="identificacao-titulo">
            <h2 id="identificacao-titulo">1. Identificação do responsável</h2>
            <p>
              Este site e seus conteúdos educacionais são de responsabilidade de <strong>{PROFILE_NAME}</strong>,
              professora e fonoaudióloga clínica.
            </p>
            <dl className={styles.metaList}>
              <div>
                <dt>Responsável técnica</dt>
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
                <dt>Endereço comercial</dt>
                <dd>
                  <Pending />
                </dd>
              </div>
              <div>
                <dt>Canal de atendimento</dt>
                <dd>
                  {EMAIL.href ? (
                    <a href={EMAIL.href}>{EMAIL.display}</a>
                  ) : (
                    <Link href="/contato">Página de contato</Link>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section id="finalidade" className={styles.section} aria-labelledby="finalidade-titulo">
            <h2 id="finalidade-titulo">2. Natureza informativa e limites de atuação</h2>
            <p>
              Os artigos, episódios de podcast, materiais de apoio e cursos online publicados neste site têm finalidade{" "}
              <strong>exclusivamente educacional e informativa</strong>.
            </p>
            <p>
              Nenhum conteúdo disponibilizado substitui avaliação clínica, diagnóstico ou intervenção fonoaudiológica,
              médica ou multidisciplinar individualizada. A conclusão de um curso não habilita professores, familiares
              ou outros profissionais a emitir diagnósticos fora de sua área legal de atuação.
            </p>
          </section>

          <section id="cursos" className={styles.section} aria-labelledby="cursos-titulo">
            <h2 id="cursos-titulo">3. Cursos online e uso da Área do Aluno</h2>
            <ul className={styles.plainList}>
              <li>
                <strong>Licença pessoal e intransferível:</strong> a matrícula concede acesso individual às videoaulas e
                materiais complementares exclusivamente pela <Link href="/area-do-aluno">Área do Aluno</Link>.
              </li>
              <li>
                <strong>Proibição de compartilhamento:</strong> é vedado compartilhar login e senha com terceiros,
                organizar rateios, gravar a tela, baixar aulas sem autorização ou redistribuir materiais em grupos,
                redes sociais ou plataformas externas.
              </li>
              <li>
                <strong>Segurança e auditoria de sessão:</strong> para proteger sua conta e os direitos autorais das
                aulas, o sistema monitora sessões ativas e pode suspender acessos em caso de uso fraudulento ou violação
                destes termos.
              </li>
              <li>
                <strong>Pagamento:</strong> as compras são processadas em ambiente seguro de plataformas intermediadoras
                (Kiwify e/ou Hotmart). A liberação do acesso ocorre após a confirmação do pagamento.
              </li>
            </ul>
          </section>

          <section id="loja" className={styles.section} aria-labelledby="loja-titulo">
            <h2 id="loja-titulo">4. Loja, produtos digitais e físicos</h2>
            <ul className={styles.plainList}>
              <li>
                <strong>Materiais digitais (PDFs e aplicativos):</strong> são disponibilizados por e-mail ou download
                direto após a confirmação do pagamento, conforme indicado na página de cada item.
              </li>
              <li>
                <strong>Produtos físicos (jogos educativos e kits personalizados):</strong> são enviados pelos Correios
                para o endereço informado no checkout da plataforma de pagamento, com envio do código de rastreio por
                e-mail. O prazo de produção/postagem está descrito na página de cada produto.
              </li>
              <li>
                <strong>Exatidão do endereço:</strong> é responsabilidade do comprador informar o endereço completo e
                correto no momento do pagamento.
              </li>
            </ul>
          </section>

          <section id="reembolso" className={styles.section} aria-labelledby="reembolso-titulo">
            <h2 id="reembolso-titulo">5. Política de reembolso, arrependimento e garantia</h2>
            <p>
              Todas as compras realizadas neste site seguem integralmente o Código de Defesa do Consumidor (Lei nº
              8.078/1990):
            </p>
            <ul className={styles.plainList}>
              <li>
                <strong>Direito de arrependimento (Art. 49 do CDC):</strong> você tem até{" "}
                <strong>7 (sete) dias corridos</strong> contados da data da compra (para cursos online e produtos
                digitais) ou da data do recebimento (para produtos físicos entregues pelos Correios) para desistir da
                compra e solicitar o <strong>reembolso integral</strong>, sem necessidade de justificativa.
              </li>
              <li>
                <strong>Estorno e cancelamento de acesso:</strong> aprovado o cancelamento, o reembolso é processado
                pelo mesmo meio de pagamento utilizado na compra (prazos de fatura variam conforme a operadora do
                cartão) e o acesso à Área do Aluno é encerrado automaticamente.
              </li>
              <li>
                <strong>Garantia legal contra defeitos (Art. 26 do CDC):</strong> produtos físicos possuem garantia
                legal contra defeitos de fabricação ou avaria no transporte (30 dias para bens não duráveis e 90 dias
                para bens duráveis, como jogos e kits). Caso receba algum item danificado, entre em contato para troca
                ou restituição sem custo adicional.
              </li>
              <li>
                <strong>Como solicitar reembolso ou troca:</strong> envie sua solicitação diretamente pela{" "}
                <Link href="/area-do-aluno/suporte">Área de Suporte do Aluno</Link>, pela plataforma onde realizou o
                pagamento (Kiwify/Hotmart) ou pela <Link href="/contato">página de contato</Link>, informando o e-mail
                utilizado na compra e o número do pedido.
              </li>
            </ul>
          </section>

          <section id="propriedade" className={styles.section} aria-labelledby="propriedade-titulo">
            <h2 id="propriedade-titulo">6. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo deste site — incluindo videoaulas, roteiros, artigos, podcasts, apostilas em PDF, marca
              SaleteBrocca, identidade visual, ilustrações e materiais do projeto Brinqueletrando — é protegido pela Lei
              de Direitos Autorais (Lei nº 9.610/1998) e pela Lei da Propriedade Industrial (Lei nº 9.279/1996).
            </p>
            <p>
              É proibida a reprodução, cópia, adaptação, venda ou distribuição, total ou parcial, sem autorização prévia
              e expressa por escrito da titular.
            </p>
          </section>

          <section id="privacidade" className={styles.section} aria-labelledby="privacidade-titulo">
            <h2 id="privacidade-titulo">7. Privacidade e proteção de dados</h2>
            <p>
              O tratamento de dados pessoais realizado neste site segue a Lei Geral de Proteção de Dados (LGPD — Lei nº
              13.709/2018) e está detalhado na nossa <Link href="/privacidade">política de privacidade</Link>.
            </p>
          </section>

          <section id="foro" className={styles.section} aria-labelledby="foro-titulo">
            <h2 id="foro-titulo">8. Alterações, atendimento e foro</h2>
            <p>
              Estes Termos podem ser atualizados para refletir novos recursos, produtos ou exigências legais. Em caso de
              dúvidas, sugestões ou solicitações, fale conosco pela <Link href="/contato">página de contato</Link>.
            </p>
            <p>
              Aplica-se a legislação brasileira, garantindo-se ao consumidor o foro de seu domicílio (art. 101, I, do
              Código de Defesa do Consumidor).
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
