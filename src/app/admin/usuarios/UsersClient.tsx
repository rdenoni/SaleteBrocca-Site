"use client";

import { Ban, Download, RefreshCw, Shield, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { AdminActionState } from "@/app/admin/hero/actions";
import type { AdminUsersSnapshot } from "@/lib/admin/users";
import {
  activateUserRechargeAction,
  blockIpAction,
  deleteUserAccountAction,
  toggleAdminRoleAction,
  toggleBlockUserAction,
  unblockIpAction,
} from "./actions";
import styles from "../cms.module.css";

const INITIAL_STATE: AdminActionState = { status: "idle", message: "" };

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  expired: "Expirado",
  blocked: "Bloqueado",
};

function formatDate(iso: string | null): string {
  if (!iso) return "Sem expiração";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function UsersClient({ snapshot }: { snapshot: AdminUsersSnapshot }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ipState, ipAction, ipPending] = useActionState(blockIpAction, INITIAL_STATE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [snapshot.users, query, statusFilter]);

  return (
    <div className={styles.stack}>
      <header className={styles.headerCard}>
        <h1 className={styles.title}>Usuários</h1>
        <p className={styles.subtitle}>
          Gerencie contas, renovações/recargas, bloqueios de conta e IP, permissões de administrador, backup individual
          (LGPD) e exclusões.
        </p>
      </header>

      <section aria-label="Resumo de usuários" className={styles.kpiStrip}>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Total</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.total}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Ativos</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.active}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Pendentes</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.pending}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Expirados</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.expired}</p>
        </article>
        <article className={styles.kpiBox}>
          <span className={styles.kpiBoxLabel}>Bloqueados</span>
          <p className={styles.kpiBoxValue}>{snapshot.counts.blocked}</p>
        </article>
      </section>

      <section className={styles.panel} aria-label="Lista de usuários">
        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por nome ou e-mail..."
            aria-label="Buscar usuário por nome ou e-mail"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="pending">Pendentes</option>
            <option value="expired">Expirados</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Expira em</th>
                <th>Role</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    {snapshot.mode === "demo"
                      ? "Conecte o Supabase e aplique as migrations para listar e gerenciar usuários reais."
                      : "Nenhum usuário encontrado para o filtro atual."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.pill} ${user.status === "active" ? styles.pillActive : ""}`}>
                        {STATUS_LABELS[user.status] ?? user.status}
                      </span>
                    </td>
                    <td>{formatDate(user.expiresAt)}</td>
                    <td>
                      <span className={styles.pill}>{user.role}</span>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        <form action={activateUserRechargeAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="days" value="365" />
                          <button type="submit" className={styles.miniBtn} title="Ativar recarga (+365 dias)">
                            <RefreshCw size={13} aria-hidden="true" />
                            <span>Ativar recarga</span>
                          </button>
                        </form>

                        <form action={toggleBlockUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="shouldBlock" value={String(user.status !== "blocked")} />
                          <button type="submit" className={styles.miniBtn}>
                            <Ban size={13} aria-hidden="true" />
                            <span>{user.status === "blocked" ? "Desbloquear" : "Bloquear"}</span>
                          </button>
                        </form>

                        <form action={toggleAdminRoleAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="makeAdmin" value={String(user.role !== "admin")} />
                          <button type="submit" className={styles.miniBtn}>
                            <Shield size={13} aria-hidden="true" />
                            <span>{user.role === "admin" ? "Remover admin" : "Tornar admin"}</span>
                          </button>
                        </form>

                        <a href={`/api/admin/users/${user.id}/backup`} className={styles.miniBtn}>
                          <Download size={13} aria-hidden="true" />
                          <span>Backup</span>
                        </a>

                        <form
                          action={deleteUserAccountAction}
                          onSubmit={(e) => {
                            if (!window.confirm(`Excluir permanentemente a conta de ${user.email}?`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className={`${styles.miniBtn} ${styles.miniBtnDanger}`}>
                            <Trash2 size={13} aria-hidden="true" />
                            <span>Excluir</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="ips-bloqueados">
        <div className={styles.panelHead}>
          <h2 id="ips-bloqueados" className={styles.panelTitle}>
            Bloquear IPs ({snapshot.blockedIps.length})
          </h2>
        </div>

        <form action={ipAction} className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Endereço IP (IPv4 ou IPv6)</span>
            <input className={styles.input} name="ipAddress" placeholder="ex.: 192.0.2.10" required />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Motivo</span>
            <input className={styles.input} name="reason" placeholder="ex.: Tentativas abusivas de acesso" />
          </label>
          <div className={`${styles.formActions} ${styles.fieldFull}`}>
            <button type="submit" className={styles.primaryBtn} disabled={ipPending}>
              <Ban size={16} aria-hidden="true" />
              <span>{ipPending ? "Bloqueando..." : "Bloquear IP"}</span>
            </button>
            {ipState.status !== "idle" ? (
              <span
                role="status"
                className={`${styles.feedback} ${ipState.status === "ok" ? styles.feedbackOk : styles.feedbackErr}`}
              >
                {ipState.message}
              </span>
            ) : null}
          </div>
        </form>

        {snapshot.blockedIps.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>IP</th>
                  <th>Motivo</th>
                  <th>Bloqueado em</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.blockedIps.map((ip) => (
                  <tr key={ip.id}>
                    <td>
                      <code>{ip.ipAddress}</code>
                    </td>
                    <td>{ip.reason || "—"}</td>
                    <td>{formatDate(ip.createdAt)}</td>
                    <td>
                      <form action={unblockIpAction}>
                        <input type="hidden" name="id" value={ip.id} />
                        <button type="submit" className={styles.miniBtn}>
                          Remover bloqueio
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
