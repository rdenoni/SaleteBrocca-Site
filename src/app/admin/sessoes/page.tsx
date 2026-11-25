import { requireAdmin } from "@/lib/admin/auth";
import { getAdminSessionsSnapshot } from "@/lib/admin/sessions";
import { SessionsClient } from "./SessionsClient";

export default async function AdminSessionsPage() {
  await requireAdmin("/admin/sessoes");
  const snapshot = await getAdminSessionsSnapshot();

  return <SessionsClient snapshot={snapshot} />;
}
