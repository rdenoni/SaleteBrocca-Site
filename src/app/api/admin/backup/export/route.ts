import { NextResponse } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { buildEncryptedSystemBackup } from "@/lib/admin/backup";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await requireAdmin("/admin/backup");
  if (session.mode !== "live") {
    return NextResponse.json(
      { error: "Backup disponível apenas com Supabase e BACKUP_ENCRYPTION_KEY configurados." },
      { status: 503 },
    );
  }

  try {
    const backup = await buildEncryptedSystemBackup();
    const admin = createSupabaseAdminClient();
    await admin.from("backup_history").insert({
      destination: "download",
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
      action: "backup.export_aes256gcm",
      targetType: "system",
      targetId: backup.filename,
      metadata: { tablesCount: backup.tablesCount, rowsCount: backup.rowsCount, sizeBytes: backup.sizeBytes },
    });

    return new NextResponse(JSON.stringify(backup.envelope, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${backup.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar backup criptografado." },
      { status: 500 },
    );
  }
}
