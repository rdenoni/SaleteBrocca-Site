import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin("/admin");

  return (
    <AdminShell adminName={session.name} adminEmail={session.email} mode={session.mode}>
      {children}
    </AdminShell>
  );
}
