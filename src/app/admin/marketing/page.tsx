import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MarketingClient } from "./MarketingClient";

export default async function AdminMarketingPage() {
  const session = await requireAdmin("/admin/marketing");

  const environment = process.env.CONTEXT || process.env.NODE_ENV || "development";
  const pixelIdConfigured = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());
  const capiConfigured = Boolean(process.env.META_CAPI_ACCESS_TOKEN?.trim());

  let hasAttributionInDb = false;
  let manualChecks = { pixelCreated: false, autoEventsDisabled: false };

  if (session.mode === "live" && isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    const admin = createSupabaseAdminClient();
    const [attrRes, settingRes] = await Promise.all([
      admin.from("profiles").select("id").neq("attribution", "{}").limit(1),
      admin.from("site_settings").select("value").eq("key", "marketing_checklist").maybeSingle(),
    ]);
    hasAttributionInDb = (attrRes.data?.length ?? 0) > 0;
    const val = (settingRes.data?.value ?? {}) as Record<string, unknown>;
    manualChecks = {
      pixelCreated: Boolean(val.pixelCreated),
      autoEventsDisabled: Boolean(val.autoEventsDisabled),
    };
  }

  return (
    <MarketingClient
      environment={environment}
      pixelIdConfigured={pixelIdConfigured}
      capiConfigured={capiConfigured}
      hasAttributionInDb={hasAttributionInDb}
      manualChecks={manualChecks}
    />
  );
}
