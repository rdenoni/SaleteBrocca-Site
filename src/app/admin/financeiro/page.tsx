import { requireAdmin } from "@/lib/admin/auth";
import { getAdminFinanceSnapshot } from "@/lib/admin/finance";
import { FinanceClient } from "./FinanceClient";

export default async function AdminFinancePage() {
  await requireAdmin("/admin/financeiro");
  const snapshot = await getAdminFinanceSnapshot();

  return <FinanceClient snapshot={snapshot} />;
}
