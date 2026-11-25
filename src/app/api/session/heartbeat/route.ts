import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, extractClientIp } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NO_STORE = { "Cache-Control": "no-store" } as const;

function parseDevice(ua: string): string {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Navegador";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Dispositivo";
  return `${browser} · ${os}`;
}

function parseNetlifyGeo(header: string | null): {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
} {
  if (!header) return { city: null, region: null, country: null, latitude: null, longitude: null };
  try {
    const decoded = Buffer.from(header, "base64").toString("utf8");
    const geo = JSON.parse(decoded) as {
      city?: string;
      subdivision?: { code?: string; name?: string };
      country?: { code?: string; name?: string };
      latitude?: number;
      longitude?: number;
    };
    return {
      city: geo.city ?? null,
      region: geo.subdivision?.code ?? geo.subdivision?.name ?? null,
      country: geo.country?.code ?? geo.country?.name ?? null,
      latitude: typeof geo.latitude === "number" ? geo.latitude : null,
      longitude: typeof geo.longitude === "number" ? geo.longitude : null,
    };
  } catch {
    return { city: null, region: null, country: null, latitude: null, longitude: null };
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers: NO_STORE });
  }

  const ipAddress = extractClientIp(request.headers);
  const rl = checkRateLimit(`heartbeat:${user.id}:${ipAddress}`, 30, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Limite de atualizações excedido." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }
  const userAgent = request.headers.get("user-agent") ?? "";
  const deviceLabel = parseDevice(userAgent);
  const geo = parseNetlifyGeo(request.headers.get("x-nf-geo"));
  const sessionKey = createHash("sha256").update(`${user.id}:${ipAddress}:${deviceLabel}`).digest("hex").slice(0, 32);

  const admin = createSupabaseAdminClient();
  await admin.from("user_sessions").upsert(
    {
      user_id: user.id,
      user_email: user.email ?? "",
      session_key: sessionKey,
      status: "active",
      ip_address: ipAddress,
      user_agent: userAgent.slice(0, 300),
      device_label: deviceLabel,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      latitude: geo.latitude,
      longitude: geo.longitude,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "session_key" },
  );

  return NextResponse.json({ ok: true });
}
