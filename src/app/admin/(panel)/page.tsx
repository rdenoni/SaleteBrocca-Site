import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Image as ImageIcon,
  ShieldCheck,
  Users,
  Video,
  Wallet,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import { getAdminDashboardSnapshot, requireAdmin } from "@/lib/admin/auth";
import { ALL_ADMIN_NAV_ITEMS } from "@/lib/admin/nav";
import styles from "./admin.module.css";

function formatCount(value: number | null): string {
  return value === null ? "—" : value.toLocaleString("pt-BR");
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin("/admin");
  const snapshot = await getAdminDashboardSnapshot(session);

  const kpis = [
    {
      label: "Perfis cadastrados",
      value: formatCount(snapshot.counts.profiles),
      hint: snapshot.mode === "live" ? "Contas sincronizadas em profiles" : "Conecte o Supabase",
      icon: Users,
    },
    {
      label: "Matrículas ativas",
      value: formatCount(snapshot.counts.activeEnrollments),
      hint: snapshot.mode === "live" ? "Status active em enrollments" : "Conecte o Supabase",
      icon: ShieldCheck,
    },
    {
      label: "Eventos Kiwify",
      value: formatCount(snapshot.counts.kiwifyEvents),
      hint: snapshot.mode === "live" ? "Webhooks auditados" : "Conecte o Supabase",
      icon: Webhook,
    },
    {
      label: "Vídeos na Mux",
      value: formatCount(snapshot.counts.lessonVideos),
      hint: snapshot.mode === "live" ? "Aulas em lesson_videos" : "Conecte o Supabase",
      icon: Video,
    },
  ];

  const modules = ALL_ADMIN_NAV_ITEMS.filter((item) => item.id !== "dashboard");
  const activeIntegrations = snapshot.integrations.filter((i) => i.configured).length;

  return (
    <div className={styles.stack}>
      <header className={styles.heroBanner}>
        <div className={styles.heroText}>
          <span className={styles.heroEyebrow}>Central de Gestão · Salete Brocca</span>
          <h1 className={styles.title}>Painel Administrativo</h1>
          <p className={styles.subtitle}>
            Gerencie conteúdo do site, alunos, financeiro, CRM, suporte, sessões, streaming Mux, backups criptografados
            e conformidade LGPD em um único ambiente.
          </p>
        </div>

        <div className={styles.quickActions}>
          <Link href="/admin/hero" className={styles.quickBtnPrimary}>
            <ImageIcon size={15} aria-hidden="true" />
            <span>Editar Hero</span>
          </Link>
          <Link href="/admin/usuarios" className={styles.quickBtn}>
            <Users size={15} aria-hidden="true" />
            <span>Usuários</span>
          </Link>
          <Link href="/admin/financeiro" className={styles.quickBtn}>
            <Wallet size={15} aria-hidden="true" />
            <span>Financeiro</span>
          </Link>
          <Link href="/admin/backup" className={styles.quickBtn}>
            <HardDrive size={15} aria-hidden="true" />
            <span>Backup</span>
          </Link>
          <Link href="/admin/integracoes" className={styles.quickBtn}>
            <span>Configurar variáveis</span>
          </Link>
        </div>
      </header>

      {snapshot.mode === "demo" ? (
        <div className={styles.demoNotice} role="status">
          <Database size={18} aria-hidden="true" />
          <span>
            Executando em <strong>modo demonstração</strong> (sem variáveis locais do Supabase). Em produção, apenas
            contas com papel <code>admin</code> em <code>user_roles</code> acessam este painel.
          </span>
        </div>
      ) : null}

      <section aria-label="Resumo do banco">
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <article key={kpi.label} className={styles.kpiCard}>
                <div className={styles.kpiHead}>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <span className={styles.kpiIcon}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                </div>
                <p className={styles.kpiValue}>{kpi.value}</p>
                <p className={styles.kpiHint}>{kpi.hint}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className={styles.twoCol}>
        <section className={styles.panel} aria-labelledby="saude-integracoes">
          <div className={styles.panelHead}>
            <h2 id="saude-integracoes" className={styles.panelTitle}>
              Saúde das integrações
            </h2>
            <span className={styles.panelBadge}>
              {activeIntegrations}/{snapshot.integrations.length} ativas
            </span>
          </div>
          <ul className={styles.statusList}>
            {snapshot.integrations.map((item) => (
              <li key={item.id} className={styles.statusRow}>
                <span className={styles.statusDot} data-ok={item.configured ? "true" : "false"} aria-hidden="true">
                  {item.configured ? <CheckCircle2 size={17} /> : <Clock size={17} />}
                </span>
                <div className={styles.statusText}>
                  <strong className={styles.statusName}>{item.label}</strong>
                  <span className={styles.statusDetail}>{item.detail}</span>
                </div>
                <span className={styles.statusPill} data-ok={item.configured ? "true" : "false"}>
                  {item.configured ? "Ativo" : "Pendente"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="auditoria-recente">
          <div className={styles.panelHead}>
            <h2 id="auditoria-recente" className={styles.panelTitle}>
              Auditoria administrativa
            </h2>
            <span className={styles.panelBadge}>Imutável</span>
          </div>
          {snapshot.recentAudit.length > 0 ? (
            <ul className={styles.auditList}>
              {snapshot.recentAudit.map((entry) => (
                <li key={entry.id} className={styles.auditRow}>
                  <div>
                    <strong className={styles.auditAction}>{entry.action}</strong>
                    <p className={styles.auditMeta}>
                      {entry.adminEmail}
                      {entry.targetType ? ` · ${entry.targetType}` : ""}
                      {entry.targetId ? ` (${entry.targetId})` : ""}
                    </p>
                  </div>
                  <time className={styles.auditTime} dateTime={entry.createdAt}>
                    {formatDateTime(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyBox}>
              <p>
                Nenhum evento registrado ainda em <code>admin_audit_logs</code>. Todas as edições de conteúdo,
                bloqueios, alterações de papel e backups aparecem aqui automaticamente.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="mapa-etapas">
        <div className={styles.panelHead}>
          <h2 id="mapa-etapas" className={styles.panelTitle}>
            Acesso rápido aos módulos
          </h2>
          <span className={styles.panelBadge}>{modules.length} módulos ativos</span>
        </div>
        <div className={styles.moduleGrid}>
          {modules.map((mod) => (
            <Link key={mod.id} href={mod.href} className={styles.moduleCard}>
              <div className={styles.moduleTop}>
                <span className={styles.moduleTitle}>{mod.label}</span>
                <ArrowUpRight size={16} aria-hidden="true" className={styles.moduleArrow} />
              </div>
              <p className={styles.moduleDesc}>{mod.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
