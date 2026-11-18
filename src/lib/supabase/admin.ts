import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig } from "./config";

/* Cliente com a chave de serviço: ignora o RLS. Só para código de servidor confiável (webhook da Kiwify, rotinas
   administrativas). Nunca importar em componente de cliente nem expor a chave: SUPABASE_SERVICE_ROLE_KEY não tem
   prefixo NEXT_PUBLIC. Sem sessão persistida e sem renovação de token (não há usuário por trás). */
export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida (chave secreta do servidor; veja .env.example).");
  }
  const { url } = getSupabasePublicConfig();
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
