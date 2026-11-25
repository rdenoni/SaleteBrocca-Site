"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { buildEncryptedSystemBackup } from "@/lib/admin/backup";
import { decryptBackupPayload, type EncryptedBackupEnvelope } from "@/lib/admin/backup-crypto";
import { getRuntimeSecret, getRuntimeSecrets } from "@/lib/admin/secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const RESTORABLE_TABLES = [
  "site_settings",
  "hero_slides",
  "testimonials",
  "articles",
  "podcasts",
  "leads",
  "blocked_ips",
] as const;

export async function importEncryptedBackupAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/backup");
  const confirmWord = String(formData.get("confirmWord") ?? "").trim();
  const file = formData.get("backupFile");

  if (confirmWord !== "RESTAURAR") {
    return { status: "error", message: 'Digite exatamente "RESTAURAR" para confirmar a importação.' };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Selecione um arquivo .sbbak.enc válido." };
  }
  if (session.mode !== "live") {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para restaurar backups." };
  }

  try {
    const raw = await file.text();
    const envelope = JSON.parse(raw) as EncryptedBackupEnvelope;
    const encryptionKey = await getRuntimeSecret("BACKUP_ENCRYPTION_KEY");
    const decrypted = decryptBackupPayload(envelope, encryptionKey);
    const parsed = JSON.parse(decrypted) as { tables?: Record<string, unknown[]> };
    if (!parsed.tables || typeof parsed.tables !== "object") {
      return { status: "error", message: "Payload descriptografado sem mapa de tabelas." };
    }

    const admin = createSupabaseAdminClient();
    let restoredRows = 0;

    for (const table of RESTORABLE_TABLES) {
      const rows = parsed.tables[table];
      if (Array.isArray(rows) && rows.length > 0) {
        const { error } = await admin.from(table).upsert(rows as never[]);
        if (!error) restoredRows += rows.length;
      }
    }

    await admin.from("backup_history").insert({
      destination: "restore",
      filename: file.name,
      tables_count: Object.keys(parsed.tables).length,
      rows_count: restoredRows,
      size_bytes: file.size,
      sha256: envelope.sha256,
      created_by: session.userId,
      created_by_email: session.email,
    });

    await logAdminAction({
      session,
      action: "backup.restore_aes256gcm",
      targetType: "system",
      targetId: file.name,
      metadata: { restoredRows },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/backup");
    return { status: "ok", message: `Backup validado e restaurado (${restoredRows} registros atualizados).` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Falha ao descriptografar/restaurar." };
  }
}

export async function pushGithubBackupAction(
  _prev: AdminActionState,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/backup");
  if (session.mode !== "live") {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para enviar backup ao GitHub." };
  }

  const runtime = await getRuntimeSecrets(["GITHUB_BACKUP_TOKEN", "GITHUB_BACKUP_REPO"]);
  const token = runtime.GITHUB_BACKUP_TOKEN;
  const repo = runtime.GITHUB_BACKUP_REPO;
  if (!token || !repo) {
    return {
      status: "error",
      message: "Configure GITHUB_BACKUP_TOKEN e GITHUB_BACKUP_REPO (repositório privado dedicado).",
    };
  }

  try {
    const backup = await buildEncryptedSystemBackup();
    const contentBase64 = Buffer.from(JSON.stringify(backup.envelope, null, 2), "utf8").toString("base64");
    const apiUrl = `https://api.github.com/repos/${repo}/contents/backups/${backup.filename}`;

    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `backup: snapshot AES-256-GCM ${backup.filename}`,
        content: contentBase64,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { status: "error", message: `GitHub API retornou ${res.status}: ${errText.slice(0, 180)}` };
    }

    const admin = createSupabaseAdminClient();
    await admin.from("backup_history").insert({
      destination: "github",
      filename: backup.filename,
      tables_count: backup.tablesCount,
      rows_count: backup.rowsCount,
      size_bytes: backup.sizeBytes,
      sha256: backup.envelope.sha256,
      created_by: session.userId,
      created_by_email: session.email,
    });

    await logAdminAction({
      session,
      action: "backup.push_github",
      targetType: "github",
      targetId: `${repo}/backups/${backup.filename}`,
      metadata: { rowsCount: backup.rowsCount, sizeBytes: backup.sizeBytes },
    });

    revalidatePath("/admin/backup");
    return { status: "ok", message: `Backup criptografado enviado para ${repo}/backups/${backup.filename}.` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao enviar backup ao GitHub." };
  }
}
