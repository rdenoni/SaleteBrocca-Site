import { requireAdmin } from "@/lib/admin/auth";
import { getRuntimeSecrets } from "@/lib/admin/secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { EmailsClient, type AdminEmailRow } from "./EmailsClient";

export default async function AdminEmailsPage() {
  const session = await requireAdmin("/admin/emails");
  const runtime = await getRuntimeSecrets(["RESEND_API_KEY", "ADMIN_FROM_EMAIL"]);
  const resendConfigured = Boolean(runtime.RESEND_API_KEY);
  const fromEmail = runtime.ADMIN_FROM_EMAIL || "contato@saletebrocca.com";

  let emails: AdminEmailRow[] = [];

  if (session.mode === "live" && isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from("admin_emails").select("*").order("created_at", { ascending: false }).limit(100);
    emails = (data ?? []).map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      direction: row.direction,
      fromEmail: row.from_email,
      toEmail: row.to_email,
      subject: row.subject,
      bodyText: row.body_text,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  return <EmailsClient emails={emails} resendConfigured={resendConfigured} fromEmail={fromEmail} />;
}
