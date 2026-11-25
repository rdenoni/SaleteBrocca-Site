"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveMarketingChecklistAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/marketing");
  const pixelCreated = formData.get("pixelCreated") === "on";
  const autoEventsDisabled = formData.get("autoEventsDisabled") === "on";

  if (session.mode !== "live") {
    return { status: "error", message: "Modo demonstração: conecte o Supabase para salvar o checklist manual." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "marketing_checklist",
      value: { pixelCreated, autoEventsDisabled },
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );
  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: "marketing.update_checklist",
    targetType: "site_settings",
    targetId: "marketing_checklist",
    metadata: { pixelCreated, autoEventsDisabled },
  });
  revalidatePath("/admin/marketing");
  return { status: "ok", message: "Checklist manual de rastreamento salvo." };
}
