import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ProfileStatus, UserRole } from "@/types/database";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  status: ProfileStatus;
  expiresAt: string | null;
  role: UserRole;
  createdAt: string;
}

export interface BlockedIpRow {
  id: string;
  ipAddress: string;
  reason: string;
  createdAt: string;
}

export interface AdminUsersSnapshot {
  mode: "live" | "demo";
  counts: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    blocked: number;
  };
  users: readonly AdminUserRow[];
  blockedIps: readonly BlockedIpRow[];
}

export interface RegistrationControlSnapshot {
  mode: "live" | "demo";
  totalAccounts: number;
  activeSubscriptions: number;
  pendingActivations: number;
  blockedAccounts: number;
  registrationEnabled: boolean;
  maxAccounts: number;
  supabaseCapacity: number;
  usedPercent: number;
  availableSlots: number;
}

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getAdminUsersSnapshot(): Promise<AdminUsersSnapshot> {
  if (!hasServerDb()) {
    return {
      mode: "demo",
      counts: { total: 0, active: 0, pending: 0, expired: 0, blocked: 0 },
      users: [],
      blockedIps: [],
    };
  }

  const admin = createSupabaseAdminClient();
  const [profilesRes, rolesRes, ipsRes] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
    admin.from("user_roles").select("user_id, role"),
    admin.from("blocked_ips").select("id, ip_address, reason, created_at").order("created_at", { ascending: false }),
  ]);

  const roleMap = new Map<string, UserRole>();
  for (const row of rolesRes.data ?? []) {
    if (row.role === "admin" || !roleMap.has(row.user_id)) {
      roleMap.set(row.user_id, row.role);
    }
  }

  const now = Date.now();
  const users: AdminUserRow[] = (profilesRes.data ?? []).map((p) => {
    let status: ProfileStatus = p.status;
    if (status === "active" && p.expires_at && new Date(p.expires_at).getTime() < now) {
      status = "expired";
    }
    return {
      id: p.id,
      name: p.full_name || "Sem nome",
      email: p.email,
      status,
      expiresAt: p.expires_at,
      role: roleMap.get(p.id) ?? "student",
      createdAt: p.created_at,
    };
  });

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    expired: users.filter((u) => u.status === "expired").length,
    blocked: users.filter((u) => u.status === "blocked").length,
  };

  const blockedIps: BlockedIpRow[] = (ipsRes.data ?? []).map((ip) => ({
    id: ip.id,
    ipAddress: ip.ip_address,
    reason: ip.reason,
    createdAt: ip.created_at,
  }));

  return { mode: "live", counts, users, blockedIps };
}

export async function getRegistrationControlSnapshot(): Promise<RegistrationControlSnapshot> {
  const defaultMax = 250;
  const defaultSupabaseCap = 250;

  if (!hasServerDb()) {
    return {
      mode: "demo",
      totalAccounts: 0,
      activeSubscriptions: 0,
      pendingActivations: 0,
      blockedAccounts: 0,
      registrationEnabled: true,
      maxAccounts: defaultMax,
      supabaseCapacity: defaultSupabaseCap,
      usedPercent: 0,
      availableSlots: defaultMax,
    };
  }

  const admin = createSupabaseAdminClient();
  const [profilesRes, activeEnrollRes, settingRes] = await Promise.all([
    admin.from("profiles").select("status"),
    admin.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("site_settings").select("value").eq("key", "registration_control").maybeSingle(),
  ]);

  const rows = profilesRes.data ?? [];
  const totalAccounts = rows.length;
  const pendingActivations = rows.filter((r) => r.status === "pending").length;
  const blockedAccounts = rows.filter((r) => r.status === "blocked").length;
  const activeSubscriptions = activeEnrollRes.count ?? 0;

  const cfg = (settingRes.data?.value ?? {}) as Record<string, unknown>;
  const registrationEnabled = typeof cfg.enabled === "boolean" ? cfg.enabled : true;
  const maxAccounts = typeof cfg.max_accounts === "number" && cfg.max_accounts > 0 ? cfg.max_accounts : defaultMax;
  const supabaseCapacity =
    typeof cfg.supabase_capacity === "number" && cfg.supabase_capacity > 0 ? cfg.supabase_capacity : maxAccounts;

  const usedPercent = Math.min(100, Math.round((totalAccounts / Math.max(1, maxAccounts)) * 100));
  const availableSlots = Math.max(0, maxAccounts - totalAccounts);

  return {
    mode: "live",
    totalAccounts,
    activeSubscriptions,
    pendingActivations,
    blockedAccounts,
    registrationEnabled,
    maxAccounts,
    supabaseCapacity,
    usedPercent,
    availableSlots,
  };
}
