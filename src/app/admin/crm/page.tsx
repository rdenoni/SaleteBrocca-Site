import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCrmSnapshot } from "@/lib/admin/crm";
import { CrmClient } from "./CrmClient";

export default async function AdminCrmPage() {
  await requireAdmin("/admin/crm");
  const snapshot = await getAdminCrmSnapshot();

  return <CrmClient snapshot={snapshot} />;
}
