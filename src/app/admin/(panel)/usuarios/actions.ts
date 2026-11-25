"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function activateUserRechargeAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/usuarios");
  const userId = String(formData.get("userId") ?? "").trim();
  const days = Math.max(1, Math.min(3650, Number(formData.get("days") ?? 365) || 365));
  if (!userId || session.mode !== "live") return;

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const admin = createSupabaseAdminClient();
  await admin.from("profiles").update({ status: "active", expires_at: expiresAt }).eq("id", userId);
  await admin.auth.admin.updateUserById(userId, { ban_duration: "none" });

  await logAdminAction({
    session,
    action: "user.activate_recharge",
    targetType: "profiles",
    targetId: userId,
    metadata: { days, expiresAt },
  });
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/cadastro");
}

export async function toggleBlockUserAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/usuarios");
  const userId = String(formData.get("userId") ?? "").trim();
  const shouldBlock = formData.get("shouldBlock") === "true";
  if (!userId || userId === session.userId || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin
    .from("profiles")
    .update({ status: shouldBlock ? "blocked" : "active" })
    .eq("id", userId);
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: shouldBlock ? "876000h" : "none",
  });

  await logAdminAction({
    session,
    action: shouldBlock ? "user.block" : "user.unblock",
    targetType: "profiles",
    targetId: userId,
  });
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/cadastro");
}

export async function toggleAdminRoleAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/usuarios");
  const userId = String(formData.get("userId") ?? "").trim();
  const makeAdmin = formData.get("makeAdmin") === "true";
  if (!userId || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  if (makeAdmin) {
    await admin.from("user_roles").upsert({ user_id: userId, role: "admin", granted_by: session.userId });
  } else {
    const { count } = await admin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) return; /* Proteção: nunca remover o último admin. */
    await admin.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
  }

  await logAdminAction({
    session,
    action: makeAdmin ? "user.grant_admin" : "user.revoke_admin",
    targetType: "user_roles",
    targetId: userId,
  });
  revalidatePath("/admin/usuarios");
}

export async function deleteUserAccountAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/usuarios");
  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId || userId === session.userId || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(userId);
  await logAdminAction({
    session,
    action: "user.delete",
    targetType: "auth.users",
    targetId: userId,
  });
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/cadastro");
}

export async function blockIpAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/usuarios");
  const ipAddress = String(formData.get("ipAddress") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!ipAddress || !/^[0-9a-fA-F:.]{3,45}$/.test(ipAddress)) {
    return { status: "error", message: "Informe um endereço IPv4 ou IPv6 válido." };
  }

  if (session.mode !== "live") {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para bloquear IPs." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("blocked_ips").upsert(
    { ip_address: ipAddress, reason, blocked_by: session.userId },
    { onConflict: "ip_address" },
  );
  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: "ip.block",
    targetType: "blocked_ips",
    targetId: ipAddress,
    metadata: { reason },
  });
  revalidatePath("/admin/usuarios");
  return { status: "ok", message: `IP ${ipAddress} bloqueado.` };
}

export async function unblockIpAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/usuarios");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("blocked_ips").delete().eq("id", id);
  await logAdminAction({ session, action: "ip.unblock", targetType: "blocked_ips", targetId: id });
  revalidatePath("/admin/usuarios");
}
