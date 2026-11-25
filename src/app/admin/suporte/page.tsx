import { requireAdmin } from "@/lib/admin/auth";
import { getAdminSupportSnapshot } from "@/lib/admin/support";
import { SupportClient } from "./SupportClient";

export default async function AdminSupportPage() {
  await requireAdmin("/admin/suporte");
  const snapshot = await getAdminSupportSnapshot();

  return <SupportClient snapshot={snapshot} />;
}
