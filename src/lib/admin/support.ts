import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SupportTicketCategory, SupportTicketStatus } from "@/types/database";

export interface SupportMessageItem {
  id: string;
  senderType: "user" | "admin";
  senderEmail: string;
  body: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: number;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessageItem[];
}

export interface AdminSupportSnapshot {
  mode: "live" | "demo";
  counts: {
    all: number;
    open: number;
    answered: number;
    closed: number;
  };
  tickets: readonly SupportTicketItem[];
}

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getAdminSupportSnapshot(): Promise<AdminSupportSnapshot> {
  if (!hasServerDb()) {
    return { mode: "demo", counts: { all: 0, open: 0, answered: 0, closed: 0 }, tickets: [] };
  }

  const admin = createSupabaseAdminClient();
  const [ticketsRes, messagesRes] = await Promise.all([
    admin.from("support_tickets").select("*").order("updated_at", { ascending: false }).limit(200),
    admin.from("support_messages").select("*").order("created_at", { ascending: true }).limit(1000),
  ]);

  const msgMap = new Map<string, SupportMessageItem[]>();
  for (const m of messagesRes.data ?? []) {
    const arr = msgMap.get(m.ticket_id) ?? [];
    arr.push({
      id: m.id,
      senderType: m.sender_type,
      senderEmail: m.sender_email,
      body: m.body,
      createdAt: m.created_at,
    });
    msgMap.set(m.ticket_id, arr);
  }

  const tickets: SupportTicketItem[] = (ticketsRes.data ?? []).map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number,
    requesterName: t.requester_name,
    requesterEmail: t.requester_email,
    subject: t.subject,
    category: t.category,
    status: t.status,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    messages: msgMap.get(t.id) ?? [],
  }));

  return {
    mode: "live",
    counts: {
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      answered: tickets.filter((t) => t.status === "answered").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    },
    tickets,
  };
}
