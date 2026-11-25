"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";

function validateOptionalUrl(url: string, label: string): string | null {
  if (!url) return null;
  if (!url.startsWith("https://") && !url.startsWith("http://") && !url.startsWith("mailto:") && !url.startsWith("tel:")) {
    return `${label}: informe uma URL válida (ex.: https://...).`;
  }
  return null;
}

export async function saveSiteLinksAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/links");

  const instagram = String(formData.get("instagram") ?? "").trim();
  const facebook = String(formData.get("facebook") ?? "").trim();
  const linkedin = String(formData.get("linkedin") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const whatsappDisplay = String(formData.get("whatsappDisplay") ?? "").trim();
  const whatsappHref = String(formData.get("whatsappHref") ?? "").trim();
  const emailDisplay = String(formData.get("emailDisplay") ?? "").trim();
  const emailHref = String(formData.get("emailHref") ?? "").trim();
  const clinicCity = String(formData.get("clinicCity") ?? "").trim();
  const clinicHours = String(formData.get("clinicHours") ?? "").trim();

  const errors = [
    validateOptionalUrl(instagram, "Instagram"),
    validateOptionalUrl(facebook, "Facebook"),
    validateOptionalUrl(linkedin, "LinkedIn"),
    validateOptionalUrl(whatsapp, "WhatsApp (rede)"),
    validateOptionalUrl(whatsappHref, "Link do WhatsApp"),
    validateOptionalUrl(emailHref, "Link do E-mail"),
  ].filter(Boolean);

  if (errors.length > 0) {
    return { status: "error", message: errors[0] as string };
  }

  if (session.mode !== "live") {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase e aplique a migration da Etapa 1 para gravar os links.",
    };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("site_settings").upsert(
      [
        {
          key: "social_links",
          value: { instagram, facebook, linkedin, whatsapp },
          updated_by: session.userId,
        },
        {
          key: "contact_info",
          value: { whatsappDisplay, whatsappHref, emailDisplay, emailHref, clinicCity, clinicHours },
          updated_by: session.userId,
        },
      ],
      { onConflict: "key" },
    );

    if (error) return { status: "error", message: error.message };

    await logAdminAction({
      session,
      action: "site_links.update",
      targetType: "site_settings",
      targetId: "social_links,contact_info",
      metadata: {
        instagram: Boolean(instagram),
        facebook: Boolean(facebook),
        linkedin: Boolean(linkedin),
        whatsapp: Boolean(whatsapp),
        whatsappDisplay,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/contato");
    revalidatePath("/admin/links");
    return { status: "ok", message: "Links das redes sociais e telefone atualizados no site." };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao salvar configurações." };
  }
}
