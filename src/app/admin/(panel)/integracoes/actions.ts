"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { MANAGED_INTEGRATION_KEYS, sealSecretValue, type ManagedIntegrationKey } from "@/lib/admin/secrets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED_KEYS = new Set<string>(MANAGED_INTEGRATION_KEYS.map((k) => k.key));

export async function saveIntegrationVarAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/integracoes");
  const key = String(formData.get("key") ?? "").trim() as ManagedIntegrationKey;
  const mode = String(formData.get("mode") ?? "save").trim();
  const rawValue = String(formData.get("value") ?? "").trim();

  if (!ALLOWED_KEYS.has(key)) {
    return { status: "error", message: "Variável não reconhecida." };
  }

  if (session.mode !== "live" || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase para salvar variáveis no painel.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "integration_secrets")
    .maybeSingle();

  const currentMap: Record<string, string> = {
    ...((existing?.value as Record<string, string> | null) ?? {}),
  };

  if (mode === "clear") {
    delete currentMap[key];
  } else if (mode === "generate") {
    const generated = randomBytes(32).toString("hex");
    currentMap[key] = sealSecretValue(generated);
  } else {
    if (!rawValue) {
      return { status: "error", message: `Informe um valor para ${key}.` };
    }
    const meta = MANAGED_INTEGRATION_KEYS.find((k) => k.key === key);
    currentMap[key] = meta?.secret ? sealSecretValue(rawValue) : rawValue;
  }

  const { error } = await admin.from("site_settings").upsert(
    {
      key: "integration_secrets",
      value: currentMap,
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { status: "error", message: error.message };

  await logAdminAction({
    session,
    action: `integration_var.${mode}`,
    targetType: "site_settings",
    targetId: key,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/integracoes");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/stream");
  revalidatePath("/admin/backup");
  revalidatePath("/admin/marketing");
  revalidatePath("/admin/emails");

  return {
    status: "ok",
    message:
      mode === "clear"
        ? `Variável ${key} removida do painel.`
        : mode === "generate"
          ? `Chave segura gerada e salva criptografada para ${key}.`
          : `Variável ${key} salva com sucesso.`,
  };
}
