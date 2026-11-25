"use server";

import { revalidatePath } from "next/cache";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminActionState {
  status: "idle" | "ok" | "error";
  message: string;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function isSafeMediaUrl(url: string): boolean {
  return url.startsWith("/") || url.startsWith("https://");
}

async function uploadMediaIfPresent(file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Arquivo excede o limite de 20 MB.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const admin = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("site-media").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Falha ao enviar arquivo: ${error.message}`);
  const { data } = admin.storage.from("site-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveHeroSlideAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/hero");
  const title = String(formData.get("title") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim() || "Saiba mais";
  const ctaHref = String(formData.get("ctaHref") ?? "").trim();
  const mediaType = formData.get("mediaType") === "video" ? "video" : "image";
  const imagePosition = String(formData.get("imagePosition") ?? "").trim() || "60% 40%";
  const tone = formData.get("tone") === "color" ? "color" : "blue";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isActive = formData.get("isActive") === "on";
  const id = String(formData.get("id") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  let mediaUrl = String(formData.get("mediaUrl") ?? "").trim();

  if (!title) return { status: "error", message: "Informe o título do slide." };
  if (!slug) return { status: "error", message: "Slug inválido." };

  if (session.mode !== "live") {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase e aplique a migration da Etapa 1 para salvar no banco.",
    };
  }

  try {
    const uploaded = await uploadMediaIfPresent(formData.get("mediaFile"), "hero");
    if (uploaded) mediaUrl = uploaded;
    if (!mediaUrl || !isSafeMediaUrl(mediaUrl)) {
      return { status: "error", message: "Envie uma foto/vídeo ou informe uma URL válida (/... ou https://...)." };
    }

    const admin = createSupabaseAdminClient();
    const isExistingDbRow = Boolean(id && !id.startsWith("fallback-"));

    if (isExistingDbRow) {
      const { error } = await admin
        .from("hero_slides")
        .update({
          slug,
          title,
          text,
          badge: badge || null,
          cta_label: ctaLabel,
          cta_href: ctaHref || null,
          media_type: mediaType,
          media_url: mediaUrl,
          image_position: imagePosition,
          tone,
          sort_order: sortOrder,
          is_active: isActive,
        })
        .eq("id", id);
      if (error) return { status: "error", message: error.message };
    } else {
      const { error } = await admin.from("hero_slides").upsert(
        {
          slug,
          title,
          text,
          badge: badge || null,
          cta_label: ctaLabel,
          cta_href: ctaHref || null,
          media_type: mediaType,
          media_url: mediaUrl,
          image_position: imagePosition,
          tone,
          sort_order: sortOrder,
          is_active: isActive,
        },
        { onConflict: "slug" },
      );
      if (error) return { status: "error", message: error.message };
    }

    await logAdminAction({
      session,
      action: isExistingDbRow ? "hero_slide.update" : "hero_slide.create",
      targetType: "hero_slides",
      targetId: slug,
      metadata: { title, mediaType, isActive },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { status: "ok", message: `Slide "${title}" salvo com sucesso.` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao salvar slide." };
  }
}

export async function deleteHeroSlideAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/hero");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || id.startsWith("fallback-") || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("hero_slides").delete().eq("id", id);
  await logAdminAction({
    session,
    action: "hero_slide.delete",
    targetType: "hero_slides",
    targetId: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function saveTestimonialAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/hero");
  const id = String(formData.get("id") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();
  const authorRole = String(formData.get("authorRole") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const isPublished = formData.get("isPublished") === "on";
  let photoUrl = String(formData.get("photoUrl") ?? "").trim();

  if (!authorName || !quote) {
    return { status: "error", message: "Preencha o nome e o texto do comentário/depoimento." };
  }

  if (session.mode !== "live") {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase e aplique a migration da Etapa 1 para salvar no banco.",
    };
  }

  try {
    const uploaded = await uploadMediaIfPresent(formData.get("photoFile"), "testimonials");
    if (uploaded) photoUrl = uploaded;
    if (photoUrl && !isSafeMediaUrl(photoUrl)) {
      return { status: "error", message: "URL da foto inválida (use /... ou https://...)." };
    }

    const admin = createSupabaseAdminClient();
    const isExistingDbRow = Boolean(id && !id.startsWith("fallback-"));

    if (isExistingDbRow) {
      const { error } = await admin
        .from("testimonials")
        .update({
          author_name: authorName,
          author_role: authorRole,
          quote,
          photo_url: photoUrl || null,
          sort_order: sortOrder,
          is_published: isPublished,
        })
        .eq("id", id);
      if (error) return { status: "error", message: error.message };
    } else {
      const { error } = await admin.from("testimonials").insert({
        author_name: authorName,
        author_role: authorRole,
        quote,
        photo_url: photoUrl || null,
        sort_order: sortOrder,
        is_published: isPublished,
      });
      if (error) return { status: "error", message: error.message };
    }

    await logAdminAction({
      session,
      action: isExistingDbRow ? "testimonial.update" : "testimonial.create",
      targetType: "testimonials",
      targetId: authorName,
      metadata: { isPublished },
    });

    revalidatePath("/");
    revalidatePath("/avaliacao");
    revalidatePath("/admin/hero");
    return { status: "ok", message: `Comentário de "${authorName}" salvo com sucesso.` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao salvar depoimento." };
  }
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/hero");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || id.startsWith("fallback-") || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("testimonials").delete().eq("id", id);
  await logAdminAction({
    session,
    action: "testimonial.delete",
    targetType: "testimonials",
    targetId: id,
  });
  revalidatePath("/");
  revalidatePath("/avaliacao");
  revalidatePath("/admin/hero");
}
