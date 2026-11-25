"use server";

import { revalidatePath } from "next/cache";
import type { AdminActionState } from "@/app/admin/(panel)/hero/actions";
import { logAdminAction, requireAdmin } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uploadSiteMedia(file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 20 * 1024 * 1024) throw new Error("Arquivo excede 20 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const admin = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("site-media").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  const { data } = admin.storage.from("site-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveArticleAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/conteudo");
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "aprendizagem").trim();
  const coverAlt = String(formData.get("coverAlt") ?? "").trim();
  const bodyMarkdown = String(formData.get("bodyMarkdown") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const status = formData.get("status") === "published" ? "published" : "draft";
  let coverUrl = String(formData.get("coverUrl") ?? "").trim();

  if (!title || !slug) return { status: "error", message: "Informe o título do artigo." };

  if (session.mode !== "live") {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase e aplique a migration das Etapas 2–4 para salvar artigos.",
    };
  }

  try {
    const uploaded = await uploadSiteMedia(formData.get("coverFile"), "articles");
    if (uploaded) coverUrl = uploaded;

    const admin = createSupabaseAdminClient();
    const isExisting = Boolean(id && !id.startsWith("fallback-"));
    const payload = {
      slug,
      title,
      excerpt,
      category_slug: categorySlug,
      cover_url: coverUrl || null,
      cover_alt: coverAlt,
      body_markdown: bodyMarkdown,
      featured,
      status: status as "draft" | "published",
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { error } = isExisting
      ? await admin.from("articles").update(payload).eq("id", id)
      : await admin.from("articles").upsert(payload, { onConflict: "slug" });

    if (error) return { status: "error", message: error.message };

    await logAdminAction({
      session,
      action: isExisting ? "article.update" : "article.create",
      targetType: "articles",
      targetId: slug,
      metadata: { title, status, featured },
    });

    revalidatePath("/conteudo");
    revalidatePath(`/conteudo/${slug}`);
    revalidatePath("/admin/conteudo");
    return { status: "ok", message: `Artigo "${title}" salvo com sucesso.` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao salvar artigo." };
  }
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/conteudo");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || id.startsWith("fallback-") || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("articles").delete().eq("id", id);
  await logAdminAction({ session, action: "article.delete", targetType: "articles", targetId: id });
  revalidatePath("/conteudo");
  revalidatePath("/admin/conteudo");
}

export async function savePodcastAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireAdmin("/admin/conteudo");
  const id = String(formData.get("id") ?? "").trim();
  const episodeNumber = Math.max(1, Number(formData.get("episodeNumber") ?? 1) || 1);
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  const summary = String(formData.get("summary") ?? "").trim();
  const topicsRaw = String(formData.get("topics") ?? "");
  const topics = topicsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const lessonsRaw = String(formData.get("lessonCodes") ?? "");
  const lessonCodes = lessonsRaw
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);
  const status = formData.get("status") === "published" ? "published" : "draft";
  let audioUrl = String(formData.get("audioUrl") ?? "").trim();

  if (!title || !slug) return { status: "error", message: "Informe o título do episódio." };

  if (session.mode !== "live") {
    return {
      status: "error",
      message: "Modo demonstração: conecte o Supabase e aplique a migration das Etapas 2–4 para salvar podcasts.",
    };
  }

  try {
    const uploaded = await uploadSiteMedia(formData.get("audioFile"), "podcasts");
    if (uploaded) audioUrl = uploaded;

    const admin = createSupabaseAdminClient();
    const isExisting = Boolean(id && !id.startsWith("fallback-"));
    const payload = {
      episode_number: episodeNumber,
      slug,
      title,
      summary,
      topics,
      lesson_codes: lessonCodes,
      audio_url: audioUrl || null,
      status: status as "draft" | "published",
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    const { error } = isExisting
      ? await admin.from("podcasts").update(payload).eq("id", id)
      : await admin.from("podcasts").upsert(payload, { onConflict: "slug" });

    if (error) return { status: "error", message: error.message };

    await logAdminAction({
      session,
      action: isExisting ? "podcast.update" : "podcast.create",
      targetType: "podcasts",
      targetId: slug,
      metadata: { title, episodeNumber, status },
    });

    revalidatePath("/conteudo/podcast");
    revalidatePath(`/conteudo/podcast/${slug}`);
    revalidatePath("/admin/conteudo");
    return { status: "ok", message: `Episódio #${episodeNumber} "${title}" salvo com sucesso.` };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Erro ao salvar podcast." };
  }
}

export async function deletePodcastAction(formData: FormData): Promise<void> {
  const session = await requireAdmin("/admin/conteudo");
  const id = String(formData.get("id") ?? "").trim();
  if (!id || id.startsWith("fallback-") || session.mode !== "live") return;

  const admin = createSupabaseAdminClient();
  await admin.from("podcasts").delete().eq("id", id);
  await logAdminAction({ session, action: "podcast.delete", targetType: "podcasts", targetId: id });
  revalidatePath("/conteudo/podcast");
  revalidatePath("/admin/conteudo");
}
