import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig } from "./config";

/* Cliente do Supabase para Server Components, Server Actions e Route Handlers, com a sessão nos cookies.
   Crie um por requisição (nunca guarde em variável de módulo). Em Server Components o Next não deixa gravar cookies:
   o erro é ignorado, porque o proxy é quem renova a sessão. */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  const { url, key } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Chamado de um Server Component: o proxy renova a sessão. */
        }
      },
    },
  });
}
