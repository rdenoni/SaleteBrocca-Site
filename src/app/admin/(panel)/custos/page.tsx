import { requireAdmin } from "@/lib/admin/auth";
import { getCostCenterOverview } from "@/lib/admin/costs";
import { CostCenterClient } from "./CostCenterClient";

export const dynamic = "force-dynamic";

export default async function AdminCostCenterPage() {
  await requireAdmin("/admin/custos");
  const overview = await getCostCenterOverview();

  return <CostCenterClient overview={overview} />;
}
