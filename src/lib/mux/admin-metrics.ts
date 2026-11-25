import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface MuxAssetSummary {
  id: string;
  lessonCode: string | null;
  status: string;
  durationMinutes: number;
  createdAt: string;
}

export interface AdminStreamSnapshot {
  muxApiConfigured: boolean;
  muxPlaybackConfigured: boolean;
  totalAssets: number;
  storedMinutes: number;
  totalViews30d: number | null;
  playingTimeMinutes30d: number | null;
  estimatedBandwidthGb: number | null;
  assets: readonly MuxAssetSummary[];
  errorMessage: string | null;
}

export async function getAdminStreamSnapshot(): Promise<AdminStreamSnapshot> {
  const tokenId = process.env.MUX_TOKEN_ID?.trim();
  const tokenSecret = process.env.MUX_TOKEN_SECRET?.trim();
  const muxApiConfigured = Boolean(tokenId && tokenSecret);
  const muxPlaybackConfigured = Boolean(
    process.env.MUX_SIGNING_KEY_ID?.trim() && process.env.MUX_SIGNING_PRIVATE_KEY?.trim(),
  );

  const lessonMap = new Map<string, string>();
  let dbAssets: MuxAssetSummary[] = [];

  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    try {
      const admin = createSupabaseAdminClient();
      const { data } = await admin.from("lesson_videos").select("*").order("lesson_code", { ascending: true });
      for (const row of data ?? []) {
        lessonMap.set(row.asset_id, row.lesson_code);
      }
      dbAssets = (data ?? []).map((row) => ({
        id: row.asset_id,
        lessonCode: row.lesson_code,
        status: "cadastrado",
        durationMinutes: Math.round(((row.duration_seconds ?? 0) / 60) * 10) / 10,
        createdAt: row.created_at,
      }));
    } catch {
      /* Segue sem derrubar o painel. */
    }
  }

  if (!muxApiConfigured) {
    const storedMinutes = Math.round(dbAssets.reduce((s, a) => s + a.durationMinutes, 0) * 10) / 10;
    return {
      muxApiConfigured: false,
      muxPlaybackConfigured,
      totalAssets: dbAssets.length,
      storedMinutes,
      totalViews30d: null,
      playingTimeMinutes30d: null,
      estimatedBandwidthGb: null,
      assets: dbAssets,
      errorMessage: null,
    };
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
    const [assetsRes, dataRes] = await Promise.all([
      fetch("https://api.mux.com/video/v1/assets?limit=100", {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }),
      fetch("https://api.mux.com/data/v1/metrics/overall?timeframe[]=30:days", {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }),
    ]);

    if (!assetsRes.ok) {
      return {
        muxApiConfigured: true,
        muxPlaybackConfigured,
        totalAssets: dbAssets.length,
        storedMinutes: 0,
        totalViews30d: null,
        playingTimeMinutes30d: null,
        estimatedBandwidthGb: null,
        assets: dbAssets,
        errorMessage: `Mux Video API respondeu ${assetsRes.status}. Verifique as permissões de leitura de MUX_TOKEN_ID.`,
      };
    }

    const assetsJson = (await assetsRes.json()) as {
      data?: Array<{ id: string; status?: string; duration?: number; created_at?: string }>;
    };
    const assets: MuxAssetSummary[] = (assetsJson.data ?? []).map((a) => ({
      id: a.id,
      lessonCode: lessonMap.get(a.id) ?? null,
      status: a.status ?? "unknown",
      durationMinutes: Math.round(((a.duration ?? 0) / 60) * 10) / 10,
      createdAt: a.created_at ? new Date(Number(a.created_at) * 1000).toISOString() : "",
    }));

    const storedMinutes = Math.round(assets.reduce((s, a) => s + a.durationMinutes, 0) * 10) / 10;
    let totalViews30d: number | null = null;
    let playingTimeMinutes30d: number | null = null;
    let estimatedBandwidthGb: number | null = null;

    if (dataRes.ok) {
      const dataJson = (await dataRes.json()) as {
        data?: { total_views?: number; total_playing_time?: number };
      };
      totalViews30d = dataJson.data?.total_views ?? 0;
      const ms = dataJson.data?.total_playing_time ?? 0;
      playingTimeMinutes30d = Math.round((ms / 60000) * 10) / 10;
      /* Estimativa conservadora de banda em HD (~3 Mbps ≈ 0,0225 GB/min). */
      estimatedBandwidthGb = Math.round(playingTimeMinutes30d * 0.0225 * 100) / 100;
    }

    return {
      muxApiConfigured: true,
      muxPlaybackConfigured,
      totalAssets: assets.length,
      storedMinutes,
      totalViews30d,
      playingTimeMinutes30d,
      estimatedBandwidthGb,
      assets,
      errorMessage: null,
    };
  } catch (err) {
    return {
      muxApiConfigured: true,
      muxPlaybackConfigured,
      totalAssets: dbAssets.length,
      storedMinutes: 0,
      totalViews30d: null,
      playingTimeMinutes30d: null,
      estimatedBandwidthGb: null,
      assets: dbAssets,
      errorMessage: err instanceof Error ? err.message : "Erro ao consultar a API da Mux.",
    };
  }
}
