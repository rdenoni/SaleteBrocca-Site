"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupportTicketCategory, SupportTicketStatus } from "@/types/database";

export async function createSupportTicketAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/suporte");
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const category = (String(formData.get("category") ?? "outro").trim() as SupportTicketCategory) || "outro";
  const body = String(formData.get("body") ?? "").trim();

  if (!requesterEmail || !subject || !body) {
    return { status: "error", message: "Preencha e-mail, assunto e mensagem inicial." };
  }
  if (session.mode !== "live") {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para registrar tickets." };
  }

  const admin = createSupabaseAdminClient();
  const { data: ticket, error } = await admin
    .from("support_tickets")
    .insert({ requester_name: requesterName, requester_email: requesterEmail, subject, category, status: "open" })
    .select("id")
    .single();
  if (error || !ticket) return { status: "error", message: error?.message ?? "Erro ao criar ticket." };

  await admin.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_type: "user",
    sender_email: requesterEmail,
    body,
  });

  await logAdminAction({ session, action: "support.create_ticket", targetType: "support_tickets", targetId: ticket.id });
  revalidatePath("/admin/suporte");
  return { status: "ok", message: "Ticket registrado com sucesso." };
}

export async function replySupportTicketAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/suporte");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!ticketId || !body || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("support_messages").insert({
    ticket_id: ticketId,
    sender_type: "admin",
    sender_id: session.userId,
    sender_email: session.email,
    body,
  });
  await admin.from("support_tickets").update({ status: "answered" }).eq("id", ticketId);

  await logAdminAction({ session, action: "support.reply", targetType: "support_tickets", targetId: ticketId });
  revalidatePath("/admin/suporte");
}

export async function updateTicketStatusAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/suporte");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const status = String(formData.get("status") ?? "closed").trim() as SupportTicketStatus;
  if (!ticketId || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("support_tickets").update({ status }).eq("id", ticketId);
  await logAdminAction({
    session,
    action: "support.update_status",
    targetType: "support_tickets",
    targetId: ticketId,
    metadata: { status },
  });
  revalidatePath("/admin/suporte");
}
