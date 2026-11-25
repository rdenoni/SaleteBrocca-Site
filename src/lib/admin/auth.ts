import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json, UserRole } from "@/types/database";
import { getRuntimeSecrets } from "./secrets";

function adminLoginPath(nextPath: string): string {
  return nextPath && nextPath !== "/admin"
    ? `/admin/login?next=${encodeURIComponent(nextPath)}`
    : "/admin/login";
}

/* Verifica silenciosamente se há um usuário logado com papel admin (usado na Home para exibir o botão exclusivo). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    return Boolean(roleRow);
  } catch {
    return false;
  }
}

export interface AdminSession {
  mode: "live" | "demo";
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuditLogPreview {
  id: number;
  adminEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
}

export interface IntegrationStatus {
  id: string;
  label: string;
  configured: boolean;
  detail: string;
}

export interface AdminDashboardSnapshot {
  mode: "live" | "demo";
  counts: {
    profiles: number | null;
    activeEnrollments: number | null;
    kiwifyEvents: number | null;
    lessonVideos: number | null;
    auditLogs: number | null;
  };
  integrations: readonly IntegrationStatus[];
  recentAudit: readonly AuditLogPreview[];
}

/* Garante que apenas administradores autenticados acessem /admin (Server Components, Server Actions e APIs).
   Sem Supabase configurado localmente, opera em modo de demonstração para desenvolvimento/validação visual. */
export async function requireAdmin(nextPath = "/admin"): Promise<AdminSession> {
  if (!isSupabaseConfigured()) {
    return {
      mode: "demo",
      userId: "demo-admin",
      email: "admin@saletebrocca.com",
      name: "Administração (Demonstração)",
      role: "admin",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(adminLoginPath(nextPath));
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    redirect("/admin/login");
  }

  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";

  return {
    mode: "live",
    userId: user.id,
    email: user.email ?? "",
    name: metaName || user.email || "Administrador",
    role: roleRow.role,
  };
}

export async function logAdminAction(params: {
  session: AdminSession;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Json;
  ipAddress?: string | null;
}): Promise<void> {
  if (params.session.mode !== "live" || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) return;

  try {
    const admin = createSupabaseAdminClient();
    await admin.from("admin_audit_logs").insert({
      admin_id: params.session.userId,
      admin_email: params.session.email,
      action: params.action,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
      ip_address: params.ipAddress ?? null,
    });
  } catch {
    /* Falha de log não derruba a tela; o erro fica isolado no servidor. */
  }
}

export async function getAdminDashboardSnapshot(session: AdminSession): Promise<AdminDashboardSnapshot> {
  const runtime = await getRuntimeSecrets();
  const supabaseOk = isSupabaseConfigured();
  const serviceRoleOk = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const kiwifyOk = Boolean(process.env.KIWIFY_WEBHOOK_TOKEN?.trim());
  const hotmartOk = Boolean(runtime.HOTMART_WEBHOOK_TOKEN);
  const muxPlaybackOk = Boolean(process.env.MUX_SIGNING_KEY_ID?.trim() && process.env.MUX_SIGNING_PRIVATE_KEY?.trim());
  const muxApiOk = Boolean(runtime.MUX_TOKEN_ID && runtime.MUX_TOKEN_SECRET);
  const backupKeyOk = Boolean(runtime.BACKUP_ENCRYPTION_KEY && runtime.BACKUP_ENCRYPTION_KEY.length >= 16);
  const metaPixelOk = Boolean(runtime.NEXT_PUBLIC_META_PIXEL_ID);
  const resendOk = Boolean(runtime.RESEND_API_KEY);

  const integrations: IntegrationStatus[] = [
    {
      id: "supabase",
      label: "Supabase Auth & Banco",
      configured: supabaseOk && serviceRoleOk,
      detail: supabaseOk
        ? serviceRoleOk
          ? "Conectado (chave pública + service role)"
          : "Chave pública ativa; falta SUPABASE_SERVICE_ROLE_KEY"
        : "Modo demonstração (sem variáveis de ambiente)",
    },
    {
      id: "kiwify",
      label: "Kiwify Webhook",
      configured: kiwifyOk,
      detail: kiwifyOk ? "Token de webhook configurado" : "KIWIFY_WEBHOOK_TOKEN pendente",
    },
    {
      id: "hotmart",
      label: "Hotmart Webhook",
      configured: hotmartOk,
      detail: hotmartOk ? "HOTTOK configurado" : "Previsto na Etapa 4 (HOTMART_WEBHOOK_TOKEN)",
    },
    {
      id: "mux",
      label: "Mux Vídeo & Stream",
      configured: muxPlaybackOk,
      detail: muxPlaybackOk
        ? muxApiOk
          ? "Signing Keys + API de monitoramento ativas"
          : "Signing Keys ativas (Etapa 8 pedirá MUX_TOKEN_ID/SECRET)"
        : "Chaves Mux pendentes",
    },
    {
      id: "backup",
      label: "Backup AES-256-GCM",
      configured: backupKeyOk,
      detail: backupKeyOk ? "Chave de instância ativa" : "Previsto na Etapa 9 (BACKUP_ENCRYPTION_KEY)",
    },
    {
      id: "marketing",
      label: "Meta Pixel & CAPI",
      configured: metaPixelOk,
      detail: metaPixelOk ? "NEXT_PUBLIC_META_PIXEL_ID ativo" : "Previsto na Etapa 10",
    },
    {
      id: "email",
      label: "E-mail ADM (Resend)",
      configured: resendOk,
      detail: resendOk ? "RESEND_API_KEY configurada" : "Previsto na Etapa 10",
    },
  ];

  if (session.mode !== "live" || !serviceRoleOk) {
    return {
      mode: session.mode,
      counts: {
        profiles: null,
        activeEnrollments: null,
        kiwifyEvents: null,
        lessonVideos: null,
        auditLogs: null,
      },
      integrations,
      recentAudit: [],
    };
  }

  const admin = createSupabaseAdminClient();
  const [profilesRes, enrollmentsRes, kiwifyRes, videosRes, auditCountRes, recentAuditRes] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("kiwify_events").select("*", { count: "exact", head: true }),
    admin.from("lesson_videos").select("*", { count: "exact", head: true }),
    admin.from("admin_audit_logs").select("*", { count: "exact", head: true }),
    admin
      .from("admin_audit_logs")
      .select("id, admin_email, action, target_type, target_id, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const recentAudit: AuditLogPreview[] = (recentAuditRes.data ?? []).map((row) => ({
    id: row.id,
    adminEmail: row.admin_email ?? "sistema",
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    createdAt: row.created_at,
  }));

  return {
    mode: "live",
    counts: {
      profiles: profilesRes.error ? null : (profilesRes.count ?? 0),
      activeEnrollments: enrollmentsRes.error ? null : (enrollmentsRes.count ?? 0),
      kiwifyEvents: kiwifyRes.error ? null : (kiwifyRes.count ?? 0),
      lessonVideos: videosRes.error ? null : (videosRes.count ?? 0),
      auditLogs: auditCountRes.error ? null : (auditCountRes.count ?? 0),
    },
    integrations,
    recentAudit,
  };
}
