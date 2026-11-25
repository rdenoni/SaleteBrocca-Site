import { requireAdmin } from "@/lib/admin/auth";
import { getIntegrationFieldsStatus } from "@/lib/admin/secrets";
import { IntegracoesClient } from "./IntegracoesClient";

export default async function AdminIntegracoesPage() {
  await requireAdmin("/admin/integracoes");
  const fields = await getIntegrationFieldsStatus();

  return <IntegracoesClient fields={fields} />;
}
