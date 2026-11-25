import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { LgpdPrintButton } from "./LgpdPrintButton";
import styles from "../cms.module.css";

interface LgpdPillar {
  number: number;
  title: string;
  status: "Conforme" | "Em implementação" | "Parcial";
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

const LGPD_PILLARS: readonly LgpdPillar[] = [
  {
    number: 1,
    title: "Criptografia em Trânsito",
    status: "Conforme",
    description:
      "Todas as conexões utilizam TLS 1.2+ (nativo Supabase/Netlify). Os dados são criptografados durante o transporte entre cliente e servidor.",
  },
  {
    number: 2,
    title: "Criptografia em Repouso",
    status: "Conforme",
    description:
      "O banco de dados PostgreSQL utiliza AES-256 para criptografia em repouso (nativo Supabase/AWS) e os backups exportados utilizam AES-256-GCM.",
  },
  {
    number: 3,
    title: "Autenticação e Autorização",
    status: "Conforme",
    description:
      "Autenticação via Supabase Auth com JWT. Roles em tabela separada (user_roles). Funções SECURITY DEFINER para evitar escalação de privilégios.",
  },
  {
    number: 4,
    title: "Auditoria",
    status: "Conforme",
    description:
      "Todas as ações administrativas são registradas em admin_audit_logs com admin_id, ação, alvo e timestamp. Logs são imutáveis (apenas INSERT).",
  },
  {
    number: 5,
    title: "Controle de Sessões",
    status: "Conforme",
    description:
      "Rastreamento de sessões com IP, user-agent e geolocalização. Heartbeat periódico para detecção de atividade.",
    actionHref: "/admin/sessoes",
    actionLabel: "Ver sessões ativas",
  },
  {
    number: 6,
    title: "Row Level Security (RLS)",
    status: "Conforme",
    description:
      "Todas as tabelas possuem RLS habilitado. Isolamento por user_id garante que cada usuário acessa apenas seus próprios dados.",
  },
  {
    number: 7,
    title: "Retenção de Dados",
    status: "Em implementação",
    description:
      "Política de retenção de dados em definição. Sessões antigas podem ser limpas manualmente pelo administrador.",
    actionHref: "/admin/sessoes",
    actionLabel: "Limpar sessões antigas",
  },
  {
    number: 8,
    title: "Direitos do Titular",
    status: "Parcial",
    description:
      "Usuários podem acessar e editar seus dados via perfil. Portabilidade (backup JSON) e exclusão de conta podem ser executadas pelo administrador.",
    actionHref: "/admin/usuarios",
    actionLabel: "Gerenciar titulares",
  },
];

export default async function AdminLgpdPage() {
  await requireAdmin("/admin/lgpd");

  const conformes = LGPD_PILLARS.filter((p) => p.status === "Conforme").length;

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <div className={styles.panelHead}>
          <div>
            <h1 className={styles.title}>Relatório de Conformidade LGPD</h1>
            <p className={styles.subtitle}>
              Avaliação dos 8 pilares de segurança, privacidade e governança de dados pessoais (Lei nº 13.709/2018).
            </p>
          </div>
          <LgpdPrintButton />
        </div>
        <div className={styles.badgeRow}>
          <span className={`${styles.pill} ${styles.pillActive}`}>
            {conformes} de {LGPD_PILLARS.length} pilares conformes
          </span>
          <span className={styles.pill}>1 em implementação</span>
          <span className={styles.pill}>1 parcial</span>
        </div>
      </header>

      <section className={styles.panel} aria-label="Pilares de conformidade LGPD">
        <div className={styles.itemList}>
          {LGPD_PILLARS.map((pillar) => (
            <article key={pillar.number} className={styles.itemCard}>
              <div className={styles.panelHead}>
                <h2 className={styles.itemTitle}>
                  {pillar.number}. {pillar.title}
                </h2>
                <span className={`${styles.pill} ${pillar.status === "Conforme" ? styles.pillActive : ""}`}>
                  {pillar.status}
                </span>
              </div>
              <p className={styles.itemDesc}>{pillar.description}</p>
              {pillar.actionHref && pillar.actionLabel ? (
                <div className={styles.actionRow}>
                  <Link href={pillar.actionHref} className={styles.miniBtn}>
                    {pillar.actionLabel}
                  </Link>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <section className={styles.panel} aria-labelledby="pendencias-lancamento">
        <div className={styles.panelHead}>
          <div>
            <h2 id="pendencias-lancamento" className={styles.panelTitle}>
              Lembrete: pendências cadastrais antes do lançamento comercial
            </h2>
            <p className={styles.itemDesc}>
              Itens que dependem de definição da titular (também salvos em{" "}
              <code>docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md</code>). CRFa/RJ 8589 e Termos de Uso/Reembolso já
              estão publicados.
            </p>
          </div>
          <span className={styles.pill}>4 itens pendentes</span>
        </div>

        <div className={styles.itemList}>
          <article className={styles.itemCard}>
            <h3 className={styles.itemTitle}>1. CPF ou CNPJ e endereço comercial (Decreto 7.962/2013)</h3>
            <p className={styles.itemDesc}>
              Substituir os selos &ldquo;A confirmar&rdquo; em <code>/privacidade</code> e{" "}
              <code>/termos-de-uso</code> pelo CPF/CNPJ e endereço comercial oficial.
            </p>
            <div className={styles.actionRow}>
              <Link href="/privacidade" className={styles.miniBtn}>
                Abrir Privacidade
              </Link>
              <Link href="/termos-de-uso" className={styles.miniBtn}>
                Abrir Termos de Uso
              </Link>
            </div>
          </article>

          <article className={styles.itemCard}>
            <h3 className={styles.itemTitle}>2. Encarregado LGPD (DPO) e canais oficiais</h3>
            <p className={styles.itemDesc}>
              Definir nome/e-mail do Encarregado (art. 41 da LGPD), confirmar WhatsApp/E-mail oficiais e definir os
              prazos de guarda de dados para remover o aviso &ldquo;Versão provisória&rdquo;.
            </p>
            <div className={styles.actionRow}>
              <Link href="/admin/links" className={styles.miniBtn}>
                Configurar Links e Contatos
              </Link>
            </div>
          </article>

          <article className={styles.itemCard}>
            <h3 className={styles.itemTitle}>3. Tempo de acesso, carga horária e certificado do curso</h3>
            <p className={styles.itemDesc}>
              Preencher <code>access</code>, <code>workload</code> e <code>certificate</code> em{" "}
              <code>src/lib/content/courses.ts</code> para o curso Dificuldades na Aprendizagem (R$ 598,00), evitando
              obrigação implícita de acesso vitalício (CDC Art. 30/31).
            </p>
          </article>

          <article className={styles.itemCard}>
            <h3 className={styles.itemTitle}>4. Depoimentos simulados e licenças de imagem</h3>
            <p className={styles.itemDesc}>
              Despublicar os 3 depoimentos simulados antes de rodar anúncios (mantendo apenas depoimentos reais
              autorizados) e manter arquivadas as licenças/autorizações das fotos.
            </p>
            <div className={styles.actionRow}>
              <Link href="/admin/hero" className={styles.miniBtn}>
                Gerenciar Depoimentos
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
