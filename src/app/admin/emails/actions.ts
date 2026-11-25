"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function sendAdminEmailReplyAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/emails");
  const toEmail = String(formData.get("toEmail") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const threadId = String(formData.get("threadId") ?? `${toEmail}::${subject}`).trim();
  const originalId = String(formData.get("originalId") ?? "").trim();

  if (!toEmail || !subject || !bodyText) {
    return { status: "error", message: "Preencha destinatário, assunto e mensagem." };
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.ADMIN_FROM_EMAIL?.trim() || "contato@saletebrocca.com";

  if (!resendKey) {
    return {
      status: "error",
      message: "RESEND_API_KEY não configurada. Adicione a chave na Netlify para enviar respostas reais.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text: bodyText,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { status: "error", message: `Resend API respondeu ${res.status}: ${errText.slice(0, 160)}` };
    }

    const resJson = (await res.json()) as { id?: string };

    if (session.mode === "live" && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      const admin = createSupabaseAdminClient();
      await admin.from("admin_emails").insert({
        thread_id: threadId,
        direction: "outbound",
        from_email: fromEmail,
        to_email: toEmail,
        subject,
        body_text: bodyText,
        status: "replied",
        external_id: resJson.id ?? null,
      });
      if (originalId) {
        await admin.from("admin_emails").update({ status: "replied" }).eq("id", originalId);
      }
      await logAdminAction({
        session,
        action: "email.reply",
        targetType: "admin_emails",
        targetId: toEmail,
        metadata: { subject },
      });
    }

    revalidatePath("/admin/emails");
    return { status: "ok", message: `E-mail enviado para ${toEmail}.` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao enviar e-mail." };
  }
}

export async function archiveAdminEmailAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/emails");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("admin_emails").update({ status: "archived" }).eq("id", id);
  revalidatePath("/admin/emails");
}
