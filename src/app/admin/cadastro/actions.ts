"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function saveRegistrationControlAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/cadastro");
  const enabled = formData.get("enabled") === "on";
  const maxAccounts = Math.max(1, Number(formData.get("maxAccounts") ?? 250) || 250);
  const supabaseCapacity = Math.max(1, Number(formData.get("supabaseCapacity") ?? maxAccounts) || maxAccounts);

  if (session.mode !== "live") {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase para salvar o controle de cadastro.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "registration_control",
      value: {
        enabled,
        max_accounts: maxAccounts,
        supabase_capacity: supabaseCapacity,
      },
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: "registration_control.update",
    targetType: "site_settings",
    targetId: "registration_control",
    metadata: { enabled, maxAccounts, supabaseCapacity },
  });

  revalidatePath("/admin/cadastro");
  return { status: "ok", message: "Controle de cadastro e teto de contas atualizados." };
}
