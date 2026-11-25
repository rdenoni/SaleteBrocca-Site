import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { UserSessionStatus } from "@/types/database";

export interface AdminSessionRow {
  id: string;
  userEmail: string;
  status: UserSessionStatus;
  ipAddress: string;
  deviceLabel: string;
  location: string;
  coordinates: string;
  lastSeenAt: string;
}

export interface AdminSessionsSnapshot {
  mode: "live" | "demo";
  activeCount: number;
  idleCount: number;
  totalCount: number;
  sessions: readonly AdminSessionRow[];
}

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function getAdminSessionsSnapshot(): Promise<AdminSessionsSnapshot> {
  if (!hasServerDb()) {
    return { mode: "demo", activeCount: 0, idleCount: 0, totalCount: 0, sessions: [] };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("user_sessions").select("*").order("last_seen_at", { ascending: false }).limit(200);
  const now = Date.now();

  const sessions: AdminSessionRow[] = (data ?? []).map((row) => {
    const ageMs = now - new Date(row.last_seen_at).getTime();
    let status: UserSessionStatus = row.status;
    if (status === "active" && ageMs > 10 * 60 * 1000) status = "idle";

    const locParts = [row.city, row.region, row.country].filter(Boolean);
    const coordinates =
      typeof row.latitude === "number" && typeof row.longitude === "number"
        ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
        : "—";

    return {
      id: row.id,
      userEmail: row.user_email || "Anônimo",
      status,
      ipAddress: row.ip_address || "—",
      deviceLabel: row.device_label,
      location: locParts.length > 0 ? locParts.join(", ") : "—",
      coordinates,
      lastSeenAt: row.last_seen_at,
    };
  });

  return {
    mode: "live",
    activeCount: sessions.filter((s) => s.status === "active").length,
    idleCount: sessions.filter((s) => s.status === "idle").length,
    totalCount: sessions.length,
    sessions,
  };
}
