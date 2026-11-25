import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPublicStudentPath, loginPathWithNext } from "@/lib/auth-paths";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig, isSupabaseConfigured } from "./config";

type SetCookieOptions = Parameters<NextResponse["cookies"]["set"]>[2];
type CacheHeaders = Record<string, string>;

const STUDENT_PREFIX = "/area-do-aluno";
const ADMIN_PREFIX = "/admin";

/* Renova a sessão do Supabase (cookies) e, nas páginas privadas da Área do Aluno, manda quem não entrou para o login.
   O proxy é só a primeira barreira: páginas e Server Actions conferem o usuário de novo no servidor.
   Sem Supabase configurado não faz nada (a demonstração continua aberta). */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  if (!isSupabaseConfigured()) return NextResponse.next({ request });

  const { url, key } = getSupabasePublicConfig();
  let supabaseResponse = NextResponse.next({ request });
  /* Cabeçalhos anti-cache que o Supabase pede junto dos cookies: sem eles um CDN poderia servir a sessão de um aluno a outro. */
  let cacheHeaders: CacheHeaders = {};

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as SetCookieOptions),
        );
        cacheHeaders = { ...cacheHeaders, ...headers };
        Object.entries(cacheHeaders).forEach(([header, headerValue]) => supabaseResponse.headers.set(header, headerValue));
      },
    },
  });

  /* getClaims valida o token (nunca confie em getSession no servidor) e renova a sessão quando está vencendo. */
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const isPrivateStudentPath =
    (pathname === STUDENT_PREFIX || pathname.startsWith(`${STUDENT_PREFIX}/`)) && !isPublicStudentPath(pathname);
  const isAdminPath = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

  if (!signedIn && (isPrivateStudentPath || isAdminPath)) {
    const redirect = NextResponse.redirect(new URL(loginPathWithNext(`${pathname}${search}`), request.url));
    supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    Object.entries(cacheHeaders).forEach(([header, headerValue]) => redirect.headers.set(header, headerValue));
    return redirect;
  }

  return supabaseResponse;
}
