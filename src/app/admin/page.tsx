import { CheckCircle2, Clock, Database, ShieldCheck, Users, Video, Webhook } from "lucide-react";
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
      hint: snapshot.mode === "live" ? "Tabela public.profiles" : "Disponível ao conectar Supabase",
      icon: Users,
    },
    {
      label: "Matrículas ativas",
      value: formatCount(snapshot.counts.activeEnrollments),
      hint: snapshot.mode === "live" ? "Status active em enrollments" : "Disponível ao conectar Supabase",
      icon: ShieldCheck,
    },
    {
      label: "Eventos Kiwify",
      value: formatCount(snapshot.counts.kiwifyEvents),
      hint: snapshot.mode === "live" ? "Webhooks recebidos" : "Disponível ao conectar Supabase",
      icon: Webhook,
    },
    {
      label: "Vídeos na Mux",
      value: formatCount(snapshot.counts.lessonVideos),
      hint: snapshot.mode === "live" ? "Aulas cadastradas em lesson_videos" : "Disponível ao conectar Supabase",
      icon: Video,
    },
  ];

  const modules = ALL_ADMIN_NAV_ITEMS.filter((item) => item.id !== "dashboard");

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <div>
          <h1 className={styles.title}>Painel Administrativo</h1>
          <p className={styles.subtitle}>
            Etapa 0 ativa: fundação segura com roles em tabela separada (<code>user_roles</code>), proteção de rota,
            auditoria imutável (<code>admin_audit_logs</code>) e diagnóstico das integrações.
          </p>
        </div>
        {snapshot.mode === "demo" ? (
          <div className={styles.demoNotice} role="status">
            <Database size={18} aria-hidden="true" />
            <span>
              Executando em <strong>modo demonstração</strong> (sem variáveis do Supabase neste ambiente). Em produção,
              apenas contas com papel <code>admin</code> em <code>user_roles</code> acessam esta rota.
            </span>
          </div>
        ) : null}
      </header>

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
            <span className={styles.panelBadge}>Tempo real</span>
          </div>
          <ul className={styles.statusList}>
            {snapshot.integrations.map((item) => (
              <li key={item.id} className={styles.statusRow}>
                <span className={styles.statusDot} data-ok={item.configured ? "true" : "false"} aria-hidden="true">
                  {item.configured ? <CheckCircle2 size={18} /> : <Clock size={18} />}
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
                Nenhum evento registrado ainda em <code>admin_audit_logs</code>. A partir da Etapa 1, todas as edições
                de conteúdo, bloqueios, alterações de role e backups aparecerão aqui com data, autor e alvo.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="mapa-etapas">
        <div className={styles.panelHead}>
          <h2 id="mapa-etapas" className={styles.panelTitle}>
            Módulos planejados por etapa
          </h2>
          <span className={styles.panelBadge}>{modules.length} módulos</span>
        </div>
        <div className={styles.moduleGrid}>
          {modules.map((mod) => (
            <article key={mod.id} className={styles.moduleCard}>
              <div className={styles.moduleTop}>
                <span className={styles.moduleStage}>Etapa {mod.stage}</span>
                <span className={styles.moduleState} data-ready={mod.ready ? "true" : "false"}>
                  {mod.ready ? "Ativo" : "Planejado"}
                </span>
              </div>
              <h3 className={styles.moduleTitle}>{mod.label}</h3>
              <p className={styles.moduleDesc}>{mod.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
