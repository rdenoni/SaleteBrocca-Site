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
    </div>
  );
}
