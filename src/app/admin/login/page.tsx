import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/admin/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AdminLoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/admin") && !params.next.startsWith("/admin/login")
      ? params.next
      : "/admin";

  const supabaseReady = isSupabaseConfigured();
  if (supabaseReady && (await isCurrentUserAdmin())) {
    redirect(nextPath);
  }

  return <AdminLoginClient nextPath={nextPath} demoMode={!supabaseReady} />;
}
