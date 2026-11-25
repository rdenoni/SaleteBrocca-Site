import "server-only";
import { articleTitle, getArticleCategories, getArticles } from "@/lib/content/articles";
import { getPodcastEpisodes } from "@/lib/content/podcasts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AdminArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  coverUrl: string;
  coverAlt: string;
  bodyMarkdown: string;
  featured: boolean;
  status: "draft" | "published";
  fromFallback?: boolean;
}

export interface AdminPodcastItem {
  id: string;
  episodeNumber: number;
  slug: string;
  title: string;
  summary: string;
  topics: string[];
  lessonCodes: string[];
  audioUrl: string;
  status: "draft" | "published";
  fromFallback?: boolean;
}

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function getAdminArticleCategories() {
  return getArticleCategories();
}

export async function getAdminArticles(): Promise<readonly AdminArticleItem[]> {
  const fallback: AdminArticleItem[] = getArticles().map((a, idx) => {
    const blocks = a.body ?? [];
    const firstParagraph = blocks.find((b) => b.type === "paragraph");
    return {
      id: `fallback-article-${idx + 1}`,
      slug: a.slug,
      title: articleTitle(a),
      excerpt: firstParagraph && firstParagraph.type === "paragraph" ? firstParagraph.text.slice(0, 180) : "",
      categorySlug: a.category,
      coverUrl: a.image,
      coverAlt: a.imageAlt,
      bodyMarkdown: blocks
        .map((block) => {
          if (block.type === "heading") return `## ${block.text}`;
          if (block.type === "quote") return `> ${block.text}`;
          if (block.type === "list") return block.items.map((item) => `- ${item}`).join("\n");
          return block.text;
        })
        .join("\n\n"),
      featured: idx < 3,
      status: "published",
      fromFallback: true,
    };
  });

  if (!hasServerDb()) return fallback;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("articles").select("*").order("updated_at", { ascending: false });
    if (error || !data || data.length === 0) return fallback;
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      categorySlug: row.category_slug,
      coverUrl: row.cover_url ?? "",
      coverAlt: row.cover_alt,
      bodyMarkdown: row.body_markdown,
      featured: row.featured,
      status: row.status,
    }));
  } catch {
    return fallback;
  }
}

export async function getAdminPodcasts(): Promise<readonly AdminPodcastItem[]> {
  const fallback: AdminPodcastItem[] = getPodcastEpisodes().map((ep) => ({
    id: `fallback-podcast-${ep.number}`,
    episodeNumber: ep.number,
    slug: ep.slug,
    title: ep.title,
    summary: ep.summary,
    topics: [...ep.topics],
    lessonCodes: [...ep.lessonCodes],
    audioUrl: ep.audioUrl ?? "",
    status: "published",
    fromFallback: true,
  }));

  if (!hasServerDb()) return fallback;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("podcasts").select("*").order("episode_number", { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data.map((row) => ({
      id: row.id,
      episodeNumber: row.episode_number,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      topics: row.topics ?? [],
      lessonCodes: row.lesson_codes ?? [],
      audioUrl: row.audio_url ?? "",
      status: row.status,
    }));
  } catch {
    return fallback;
  }
}
