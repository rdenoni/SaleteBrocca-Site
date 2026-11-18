import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/* Next 16: `proxy` (antes `middleware`). Renova a sessão do Supabase e protege a Área do Aluno. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/area-do-aluno/:path*", "/auth/:path*"],
};
