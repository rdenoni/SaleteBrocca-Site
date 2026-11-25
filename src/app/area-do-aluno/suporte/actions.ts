"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode, requireStudentSession } from "@/lib/content/student";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupportTicketCategory } from "@/types/database";

export interface StudentSupportActionState {
  status: "idle" | "ok" | "error";
  message: string;
}

const VALID_CATEGORIES: readonly SupportTicketCategory[] = [
  "curso",
  "acesso",
  "pagamento",
  "tecnico",
  "lgpd",
  "outro",
];

export async function createStudentTicketAction(
  _prev: StudentSupportActionState,
  formData: FormData,
): Promise<StudentSupportActionState> {
  const session = await requireStudentSession("/area-do-aluno/suporte");
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 160);
  const rawCategory = String(formData.get("category") ?? "curso").trim() as SupportTicketCategory;
  const category: SupportTicketCategory = VALID_CATEGORIES.includes(rawCategory) ? rawCategory : "outro";
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);

  if (!subject || !body) {
    return { status: "error", message: "Preencha o assunto e descreva sua dúvida ou solicitação." };
  }

  if (isDemoMode() || !session) {
    return {
      status: "error",
      message: "Modo demonstração: faça login com sua conta para abrir chamados reais de suporte.",
    };
  }

  /* Proteção contra spam e race condition por duplo clique rápido. */
  const dedupe = checkRateLimit(`ticket-dedupe:${session.userId}:${subject.toLowerCase()}`, 1, 10 * 1000);
  if (!dedupe.allowed) {
    return { status: "error", message: "Este chamado já está sendo processado. Aguarde alguns segundos." };
  }
  const rl = checkRateLimit(`ticket-create:${session.userId}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return { status: "error", message: "Limite temporário de novos chamados atingido. Tente novamente em alguns minutos." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: session.userId,
      requester_name: session.name ?? "",
      requester_email: session.email ?? "",
      subject,
      category,
      status: "open",
    })
    .select("id, ticket_number")
    .single();

  if (ticketError || !ticket) {
    return { status: "error", message: "Não foi possível abrir o chamado agora. Tente novamente em instantes." };
  }

  const { error: msgError } = await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_type: "user",
    sender_id: session.userId,
    sender_email: session.email ?? "",
    body,
  });

  if (msgError) {
    return { status: "error", message: "Chamado criado, mas houve falha ao gravar a mensagem inicial." };
  }

  revalidatePath("/area-do-aluno/suporte");
  revalidatePath("/admin/suporte");
  return {
    status: "ok",
    message: `Chamado #${ticket.ticket_number} aberto com sucesso! Nossa equipe responderá por aqui.`,
  };
}

export async function replyStudentTicketAction(
  _prev: StudentSupportActionState,
  formData: FormData,
): Promise<StudentSupportActionState> {
  const session = await requireStudentSession("/area-do-aluno/suporte");
  const ticketId = String(formData.get("ticketId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);

  if (!ticketId || !body) {
    return { status: "error", message: "Escreva sua mensagem antes de enviar." };
  }

  if (isDemoMode() || !session) {
    return {
      status: "error",
      message: "Modo demonstração: faça login com sua conta para enviar respostas.",
    };
  }

  const rl = checkRateLimit(`ticket-reply:${session.userId}`, 15, 5 * 60 * 1000);
  if (!rl.allowed) {
    return { status: "error", message: "Muitas mensagens enviadas em seguida. Aguarde alguns instantes." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("support_messages").insert({
    ticket_id: ticketId,
    sender_type: "user",
    sender_id: session.userId,
    sender_email: session.email ?? "",
    body,
  });

  if (error) {
    return { status: "error", message: "Não foi possível enviar sua resposta." };
  }

  revalidatePath("/area-do-aluno/suporte");
  revalidatePath("/admin/suporte");
  return { status: "ok", message: "Resposta enviada com sucesso." };
}
