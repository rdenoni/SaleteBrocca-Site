import { NextResponse } from "next/server";
import { getArticle } from "@/lib/content/articles";
import { getPodcastEpisode } from "@/lib/content/podcasts";
import { checkRateLimit, extractClientIp, isIpBlocked } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Json } from "@/types/database";

type LikeTargetType = "article" | "podcast";
type LikeAction = "like" | "unlike";

const SETTINGS_KEY = "content_likes";
const memoryLikes = new Map<string, number>();

function hasServerDb(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

function isValidTarget(type: unknown, slug: unknown): type is LikeTargetType {
  if (typeof slug !== "string" || !slug.trim()) return false;
  if (type === "article") return Boolean(getArticle(slug.trim()));
  if (type === "podcast") return Boolean(getPodcastEpisode(slug.trim()));
  return false;
}

function makeKey(type: LikeTargetType, slug: string): string {
  return `${type}:${slug.trim()}`;
}

function sanitizeMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
      result[k] = Math.floor(v);
    }
  }
  return result;
}

async function readLikesMap(): Promise<Record<string, number>> {
  if (!hasServerDb()) {
    return Object.fromEntries(memoryLikes.entries());
  }
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (error || !data) return Object.fromEntries(memoryLikes.entries());
    return sanitizeMap(data.value);
  } catch {
    return Object.fromEntries(memoryLikes.entries());
  }
}

async function writeLikesMap(map: Record<string, number>): Promise<void> {
  for (const [k, v] of Object.entries(map)) {
    memoryLikes.set(k, v);
  }
  if (!hasServerDb()) return;
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("site_settings").upsert(
      {
        key: SETTINGS_KEY,
        value: map as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  } catch {
    /* Mantém contagem em memória caso o banco esteja indisponível momentaneamente. */
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  if (!isValidTarget(type, slug)) {
    return NextResponse.json({ error: "Conteúdo inválido." }, { status: 400 });
  }

  const key = makeKey(type, slug!);
  const map = await readLikesMap();
  const count = map[key] ?? 0;

  return NextResponse.json(
    { type, slug, count },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);
  if (await isIpBlocked(ip)) {
    return NextResponse.json({ error: "Acesso temporariamente restrito." }, { status: 403 });
  }

  const rate = checkRateLimit(`content_likes:${ip}`, 40, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas ações em sequência. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const type = body.type;
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const action: LikeAction = body.action === "unlike" ? "unlike" : "like";

  if (!isValidTarget(type, slug)) {
    return NextResponse.json({ error: "Conteúdo inválido." }, { status: 400 });
  }

  const key = makeKey(type, slug);
  const map = await readLikesMap();
  const current = map[key] ?? 0;
  const next = action === "like" ? current + 1 : Math.max(0, current - 1);
  map[key] = next;

  await writeLikesMap(map);

  return NextResponse.json(
    { type, slug, count: next },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
