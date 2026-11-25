import { requireAdmin } from "@/lib/admin/auth";
import { getAdminBackupSnapshot } from "@/lib/admin/backup";
import { BackupClient } from "./BackupClient";

export default async function AdminBackupPage() {
  await requireAdmin("/admin/backup");
  const snapshot = await getAdminBackupSnapshot();

  return <BackupClient snapshot={snapshot} />;
}
