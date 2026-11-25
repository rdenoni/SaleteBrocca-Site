"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeadSource, LeadStatus } from "@/types/database";

export async function createLeadAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/crm");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const source = (String(formData.get("source") ?? "manual").trim() as LeadSource) || "manual";
  const status = (String(formData.get("status") ?? "new").trim() as LeadStatus) || "new";
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) return { status: "error", message: "Informe o nome do lead." };
  if (session.mode !== "live") {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para salvar leads." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("leads").insert({
    name,
    email,
    whatsapp,
    source,
    status,
    tags,
    notes,
  });
  if (error) return { status: "error", message: error.message };

  await logAdminAction({ session, action: "lead.create", targetType: "leads", targetId: email || name });
  revalidatePath("/admin/crm");
  return { status: "ok", message: `Lead "${name}" adicionado ao CRM.` };
}

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/crm");
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "new").trim() as LeadStatus;
  if (!id || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("leads").update({ status }).eq("id", id);
  await logAdminAction({ session, action: "lead.update_status", targetType: "leads", targetId: id, metadata: { status } });
  revalidatePath("/admin/crm");
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/crm");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("leads").delete().eq("id", id);
  await logAdminAction({ session, action: "lead.delete", targetType: "leads", targetId: id });
  revalidatePath("/admin/crm");
}
