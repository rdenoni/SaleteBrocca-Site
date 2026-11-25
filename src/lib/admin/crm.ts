import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LeadSource, LeadStatus } from "@/types/database";

export interface AdminLeadRow {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  source: LeadSource;
  status: LeadStatus;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface AdminCrmSnapshot {
  mode: "live" | "demo";
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leads: readonly AdminLeadRow[];
}

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getAdminCrmSnapshot(): Promise<AdminCrmSnapshot> {
  if (!hasServerDb()) {
    return { mode: "demo", totalLeads: 0, convertedLeads: 0, conversionRate: 0, leads: [] };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  const leads: AdminLeadRow[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    source: row.source,
    status: row.status,
    tags: row.tags ?? [],
    notes: row.notes,
    createdAt: row.created_at,
  }));

  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 1000) / 10 : 0;

  return { mode: "live", totalLeads, convertedLeads, conversionRate, leads };
}
