import { requireAdmin } from "@/lib/admin/auth";
import { getRegistrationControlSnapshot } from "@/lib/admin/users";
import { RegistrationClient } from "./RegistrationClient";

export default async function AdminRegistrationPage() {
  await requireAdmin("/admin/cadastro");
  const snapshot = await getRegistrationControlSnapshot();

  return <RegistrationClient snapshot={snapshot} />;
}
