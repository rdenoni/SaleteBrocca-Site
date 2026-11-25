import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Database } from "@/types/database";
import { encryptBackupPayload, type EncryptedBackupEnvelope } from "./backup-crypto";
import { getRuntimeSecret, getRuntimeSecrets } from "./secrets";

export const BACKUP_TABLES = [
  "profiles",
  "user_roles",
  "enrollments",
  "transactions",
  "kiwify_events",
  "hotmart_events",
  "leads",
  "support_tickets",
  "support_messages",
  "user_sessions",
  "blocked_ips",
  "site_settings",
  "hero_slides",
  "testimonials",
  "articles",
  "podcasts",
  "lesson_progress",
  "lesson_notes",
  "lesson_videos",
  "admin_emails",
  "admin_audit_logs",
] as const satisfies readonly (keyof Database["public"]["Tables"])[];

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export interface BackupHistoryItem {
  id: string;
  destination: "download" | "github" | "restore";
  filename: string;
  tablesCount: number;
  rowsCount: number;
  sizeBytes: number;
  createdByEmail: string;
  createdAt: string;
}

export interface AdminBackupSnapshot {
  mode: "live" | "demo";
  encryptionReady: boolean;
  githubReady: boolean;
  githubRepo: string;
  tablesCount: number;
  history: readonly BackupHistoryItem[];
}

export async function getAdminBackupSnapshot(): Promise<AdminBackupSnapshot> {
  const runtime = await getRuntimeSecrets(["BACKUP_ENCRYPTION_KEY", "GITHUB_BACKUP_TOKEN", "GITHUB_BACKUP_REPO"]);
  const encryptionReady = Boolean(runtime.BACKUP_ENCRYPTION_KEY && runtime.BACKUP_ENCRYPTION_KEY.length >= 16);
  const githubRepo = runtime.GITHUB_BACKUP_REPO ?? "";
  const githubReady = Boolean(runtime.GITHUB_BACKUP_TOKEN && githubRepo);

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      mode: "demo",
      encryptionReady,
      githubReady,
      githubRepo,
      tablesCount: BACKUP_TABLES.length,
      history: [],
    };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("backup_history").select("*").order("created_at", { ascending: false }).limit(20);
  const history: BackupHistoryItem[] = (data ?? []).map((row) => ({
    id: row.id,
    destination: row.destination,
    filename: row.filename,
    tablesCount: row.tables_count,
    rowsCount: row.rows_count,
    sizeBytes: row.size_bytes,
    createdByEmail: row.created_by_email,
    createdAt: row.created_at,
  }));

  return {
    mode: "live",
    encryptionReady,
    githubReady,
    githubRepo,
    tablesCount: BACKUP_TABLES.length,
    history,
  };
}

export async function buildEncryptedSystemBackup(): Promise<{
  envelope: EncryptedBackupEnvelope;
  filename: string;
  tablesCount: number;
  rowsCount: number;
  sizeBytes: number;
}> {
  const admin = createSupabaseAdminClient();
  const tables: Record<string, unknown[]> = {};
  let rowsCount = 0;

  for (const table of BACKUP_TABLES) {
    const { data, error } = await admin.from(table).select("*").limit(10000);
    if (!error && data) {
      tables[table] = data;
      rowsCount += data.length;
    } else {
      tables[table] = [];
    }
  }

  const plaintext = JSON.stringify({
    exportedAt: new Date().toISOString(),
    version: 1,
    tables,
  });

  const encryptionKey = await getRuntimeSecret("BACKUP_ENCRYPTION_KEY");
  const envelope = encryptBackupPayload(plaintext, encryptionKey);
  const serialized = JSON.stringify(envelope, null, 2);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `salete-brocca-backup-${stamp}.sbbak.enc`;

  return {
    envelope,
    filename,
    tablesCount: Object.keys(tables).length,
    rowsCount,
    sizeBytes: Buffer.byteLength(serialized, "utf8"),
  };
}
