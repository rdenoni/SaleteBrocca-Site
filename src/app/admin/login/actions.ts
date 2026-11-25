"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminLoginState {
  status: "idle" | "error";
  message: string;
}

export async function adminLoginAction(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin").trim();
  const nextPath = nextRaw.startsWith("/admin") && !nextRaw.startsWith("/admin/login") ? nextRaw : "/admin";

  if (!email || !password) {
    return { status: "error", message: "Informe e-mail e senha para entrar." };
  }

  if (!isSupabaseConfigured()) {
    redirect(nextPath);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { status: "error", message: "E-mail ou senha inválidos." };
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "Esta conta não possui permissão de administrador.",
    };
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
