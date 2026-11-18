/* Variáveis públicas do Supabase. Cada uma é lida como acesso literal a `process.env.NEXT_PUBLIC_*`: só assim o Next
   troca o valor no pacote do navegador. Este arquivo é importado pelo proxy e por componentes: não importa `server-only`
   e nunca lê a chave de serviço (ela vive só em `admin.ts`). */

export interface SupabasePublicConfig {
  url: string;
  /** Chave publicável (`sb_publishable_…`) ou, em projetos antigos, a chave `anon`. Ambas são públicas por desenho. */
  key: string;
}

function readPublicConfig(): SupabasePublicConfig | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : undefined;
}

/** Verdadeiro quando URL e chave pública existem: liga o login real. Sem elas, o site mostra a demonstração. */
export function isSupabaseConfigured(): boolean {
  return readPublicConfig() !== undefined;
}

/** URL e chave públicas; erro claro quando faltam (use depois de checar `isSupabaseConfigured()`). */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const config = readPublicConfig();
  if (!config) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (veja .env.example).",
    );
  }
  return config;
}
