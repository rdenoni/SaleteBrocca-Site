import { requireAdmin } from "@/lib/admin/auth";
import { getAdminUsersSnapshot } from "@/lib/admin/users";
import { UsersClient } from "./UsersClient";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/usuarios");
  const snapshot = await getAdminUsersSnapshot();

  return <UsersClient snapshot={snapshot} />;
}
