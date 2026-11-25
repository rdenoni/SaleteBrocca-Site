import type { Metadata } from "next";
import { StudentShell, studentContentStart } from "@/components/student/StudentShell";
import { isDemoMode, requireStudentSession } from "@/lib/content/student";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MotionPace, STUDENT_PACE } from "@/motion/MotionPace";
import { StudentSupportClient, type StudentTicketItem, type StudentTicketMessage } from "./StudentSupportClient";

export const metadata: Metadata = {
  title: "Suporte",
};

const TITLE = "Suporte";
const START = studentContentStart(TITLE);

export default async function StudentSupportPage() {
  const session = await requireStudentSession("/area-do-aluno/suporte");
  const demo = isDemoMode() || !session;

  let tickets: StudentTicketItem[] = [];

  if (!demo && session) {
    const supabase = await createSupabaseServerClient();
    const { data: ticketRows } = await supabase
      .from("support_tickets")
      .select("id, ticket_number, subject, category, status, created_at, updated_at")
      .eq("user_id", session.userId)
      .order("updated_at", { ascending: false });

    const ticketIds = (ticketRows ?? []).map((t) => t.id);
    const msgMap = new Map<string, StudentTicketMessage[]>();

    if (ticketIds.length > 0) {
      const { data: msgRows } = await supabase
        .from("support_messages")
        .select("id, ticket_id, sender_type, body, created_at")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: true });

      for (const m of msgRows ?? []) {
        const arr = msgMap.get(m.ticket_id) ?? [];
        arr.push({
          id: m.id,
          senderType: m.sender_type,
          body: m.body,
          createdAt: m.created_at,
        });
        msgMap.set(m.ticket_id, arr);
      }
    }

    tickets = (ticketRows ?? []).map((t) => ({
      id: t.id,
      ticketNumber: t.ticket_number,
      subject: t.subject,
      category: t.category,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      messages: msgMap.get(t.id) ?? [],
    }));
  }

  return (
    <MotionPace pace={STUDENT_PACE}>
      <StudentShell
        title={TITLE}
        subtitle="Abra chamados sobre seu curso ou pedido e acompanhe todas as respostas por aqui."
        active="suporte"
      >
        <StudentSupportClient tickets={tickets} demoMode={demo} entranceDelay={START} />
      </StudentShell>
    </MotionPace>
  );
}
