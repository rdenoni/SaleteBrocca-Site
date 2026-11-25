"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, extractClientIp, isIpBlocked } from "@/lib/security/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminLoginState {
  status: "idle" | "error";
  message: string;
}

const GENERIC_AUTH_ERROR = "E-mail ou senha inválidos.";

export async function adminLoginAction(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin").trim();
  const nextPath = nextRaw.startsWith("/admin") && !nextRaw.startsWith("/admin/login") ? nextRaw : "/admin";

  if (!email || !password) {
    return { status: "error", message: "Informe e-mail e senha para entrar." };
  }

  const hdrs = await headers();
  const ip = extractClientIp(hdrs);

  if (await isIpBlocked(ip)) {
    return { status: "error", message: "Acesso temporariamente bloqueado." };
  }

  /* Proteção contra brute-force: máximo de 8 tentativas a cada 15 minutos por IP. */
  const rl = checkRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    return {
      status: "error",
      message: "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.",
    };
  }

  if (!isSupabaseConfigured()) {
    redirect(nextPath);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { status: "error", message: GENERIC_AUTH_ERROR };
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    await supabase.auth.signOut();
    /* Mesma mensagem genérica para evitar enumeração de credenciais de contas não-admin. */
    return { status: "error", message: GENERIC_AUTH_ERROR };
  }

  redirect(nextPath);
}

export async function adminLogoutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
