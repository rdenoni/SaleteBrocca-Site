import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { CONFIRM_PATH, LOGIN_PATH } from "@/lib/auth-paths";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/* Só estes parâmetros seguem para a página de confirmação. */
const FORWARDED_PARAMS = ["token_hash", "type", "code", "next"] as const;

/* Endereço antigo dos links dos e-mails do Supabase (e `redirectTo` do fluxo PKCE com `?code=`).
   GET NÃO consome o token: programas de e-mail e antivírus (ex.: Safe Links) abrem o link antes da pessoa e gastariam
   o token de uso único. Só repassa para /auth/confirmar, onde o clique em "Continuar" faz a troca (POST). */
export function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) redirect(LOGIN_PATH);

  const forwarded = new URLSearchParams();
  for (const name of FORWARDED_PARAMS) {
    const value = request.nextUrl.searchParams.get(name);
    if (value) forwarded.set(name, value);
  }
  const query = forwarded.toString();
  redirect(query ? `${CONFIRM_PATH}?${query}` : CONFIRM_PATH);
}
