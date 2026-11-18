"use server";

import { redirect } from "next/navigation";
import { LOGIN_PATH, defaultNextForType, loginPathWithNotice, parseConfirmType, safeNext } from "@/lib/auth-paths";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/* Único lugar que consome o token do e-mail (convite, recuperação de senha): só depois do clique em "Continuar".
   Server Action: o Next confere a origem do envio (sem isso, um site de fora poderia entrar a pessoa numa conta alheia).
   Os campos ocultos vêm do navegador: tipo e destino são validados de novo aqui. Nunca registrar o token. */
export async function confirmEmailLink(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) redirect(LOGIN_PATH);

  const tokenHash = field(formData, "token_hash");
  const code = field(formData, "code");
  const type = parseConfirmType(field(formData, "type"));
  const next = safeNext(field(formData, "next"), defaultNextForType(type));

  const supabase = await createSupabaseServerClient();
  let failed = true;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = error !== null;
  } else if (code) {
    /* Fluxo PKCE: só funciona no mesmo navegador que pediu a recuperação de senha. */
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = error !== null;
  }

  redirect(failed ? loginPathWithNotice("link-invalido") : next);
}
