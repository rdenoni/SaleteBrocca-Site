/* Caminhos e redirecionamentos da Área do Aluno, compartilhados pelo proxy, pelas Server Actions e por /auth/confirmar.
   Sem dependências de servidor: pode ser importado em qualquer lugar. */

export const STUDENT_HOME = "/area-do-aluno";
export const LOGIN_PATH = "/area-do-aluno/login";
export const RECOVER_PATH = "/area-do-aluno/recuperar-senha";
export const SET_PASSWORD_PATH = "/area-do-aluno/definir-senha";
export const COURSES_PATH = "/area-do-aluno/cursos";
export const ACCOUNT_PATH = "/area-do-aluno/conta";
/* Destino dos links dos e-mails do Supabase: só mostra o botão "Continuar"; o token é consumido no clique (POST). */
export const CONFIRM_PATH = "/auth/confirmar";

/** Tipos de link de e-mail do Supabase aceitos. "invite" e "recovery" levam a pessoa a definir a senha. */
const CONFIRM_TYPES = ["invite", "recovery", "email", "signup"] as const;
export type ConfirmType = (typeof CONFIRM_TYPES)[number];
const SET_PASSWORD_TYPES: readonly ConfirmType[] = ["invite", "recovery"];

export function parseConfirmType(value: unknown): ConfirmType | undefined {
  return CONFIRM_TYPES.find((type) => type === value);
}

/** Destino padrão depois de confirmar o link: definir a senha (convite, recuperação) ou o painel. */
export function defaultNextForType(type: ConfirmType | undefined): string {
  return type && SET_PASSWORD_TYPES.includes(type) ? SET_PASSWORD_PATH : STUDENT_HOME;
}

/** Páginas da Área do Aluno que não exigem sessão. */
const PUBLIC_STUDENT_PATHS: readonly string[] = [LOGIN_PATH, RECOVER_PATH];

export function isPublicStudentPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PUBLIC_STUDENT_PATHS.includes(normalized);
}

const SAFE_BASE = "http://localhost";

function isSameSitePathname(pathname: string): boolean {
  return pathname.startsWith("/") && !pathname.startsWith("//") && !pathname.includes("\\");
}

/* Só aceita caminho relativo do próprio site: começa com "/", não com "//" e sem "\" (o navegador trata "/\host" como
   endereço externo). Qualquer outra coisa cai no destino padrão: evita redirecionamento aberto. */
export function safeNext(value: unknown, fallback: string = STUDENT_HOME): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const parsed = new URL(value, SAFE_BASE);
    if (parsed.origin !== SAFE_BASE) return fallback;
    /* "/.//host" normaliza para "//host": o navegador trataria o redirecionamento como endereço externo. */
    if (!isSameSitePathname(parsed.pathname)) return fallback;
    /* Caminho codificado ("/%2F%2Fhost") também não pode virar "//" depois de decodificado por quem o receber. */
    if (!isSameSitePathname(decodeURIComponent(parsed.pathname))) return fallback;
  } catch {
    return fallback;
  }
  return value;
}

/** Endereço do login que volta para `next` depois de entrar. */
export function loginPathWithNext(next: string): string {
  return `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}

/** Endereço do login com uma mensagem fixa (códigos conhecidos, nunca texto vindo de fora). */
export type LoginNotice = "link-invalido";

export function loginPathWithNotice(notice: LoginNotice): string {
  return `${LOGIN_PATH}?aviso=${notice}`;
}
