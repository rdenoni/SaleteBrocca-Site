import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const MAX_BUCKETS = 2000;
const buckets = new Map<string, Bucket>();

function pruneBuckets(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      removed++;
      if (removed >= excess) break;
    }
  }
}

/* Rate limiter de janela fixa com teto de memória (proteção contra brute-force, spam e flooding em rotas serverless). */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  pruneBuckets(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function extractClientIp(headers: Pick<Headers, "get">): string {
  const nf = headers.get("x-nf-client-connection-ip")?.trim();
  if (nf) return nf;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/* Verifica se o IP está na lista de bloqueio do painel administrativo (public.blocked_ips). */
export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown" || !isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return false;
  }
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.from("blocked_ips").select("id").eq("ip_address", ip).maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}
