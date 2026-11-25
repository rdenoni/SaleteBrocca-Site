"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/sessoes");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("user_sessions").update({ status: "revoked" }).eq("id", id);
  await logAdminAction({ session, action: "session.revoke", targetType: "user_sessions", targetId: id });
  revalidatePath("/admin/sessoes");
}

export async function blockSessionIpAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/sessoes");
  const ipAddress = String(formData.get("ipAddress") ?? "").trim();
  if (!ipAddress || ipAddress === "—" || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin
    .from("blocked_ips")
    .upsert({ ip_address: ipAddress, reason: "Bloqueado a partir de Sessões Ativas", blocked_by: session.userId }, { onConflict: "ip_address" });
  await logAdminAction({ session, action: "ip.block_from_session", targetType: "blocked_ips", targetId: ipAddress });
  revalidatePath("/admin/sessoes");
  revalidatePath("/admin/usuarios");
}

export async function cleanupOldSessionsAction(): Promise<void> {
  const session = await requireAdmin("/admin/sessoes");
  if (session.mode !== "live") return;

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const admin = createSupabaseAdminClient();
  await admin.from("user_sessions").delete().lt("last_seen_at", cutoff);
  await logAdminAction({
    session,
    action: "session.cleanup_old",
    targetType: "user_sessions",
    targetId: cutoff,
  });
  revalidatePath("/admin/sessoes");
}
