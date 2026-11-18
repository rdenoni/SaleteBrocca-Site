"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CONFIRM_PATH, LOGIN_PATH, SET_PASSWORD_PATH, STUDENT_HOME, safeNext } from "@/lib/auth-paths";
import type { AuthFormState } from "@/lib/auth-form-state";
import { getStudentSession } from "@/lib/content/student";
import { absoluteUrl } from "@/lib/site-url";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateEmail, validatePassword } from "@/lib/validation";

const MIN_PASSWORD_LENGTH = 8;
/* O Supabase (bcrypt) rejeita senhas com mais de 72 caracteres. */
const MAX_PASSWORD_LENGTH = 72;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_SERVER_ERROR = 500;

const GENERIC_LOGIN_ERROR = "E-mail ou senha incorretos.";
const SERVICE_UNAVAILABLE = "Não foi possível concluir agora. Tente novamente em instantes.";
const NOT_ACTIVE = "O login ainda não está ativo.";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/* Falha do serviço (rede, 5xx, limite de tentativas) é diferente de credencial errada: não mascarar como "senha errada". */
function isServiceFailure(error: { status?: number; name?: string }): boolean {
  return (
    error.name === "AuthRetryableFetchError" ||
    error.status === undefined ||
    error.status === HTTP_TOO_MANY_REQUESTS ||
    error.status >= HTTP_SERVER_ERROR
  );
}

/** Login com e-mail e senha. Mensagem única para qualquer credencial inválida (sem revelar se o e-mail existe). */
export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { error: NOT_ACTIVE };

  const email = field(formData, "email").trim();
  const password = field(formData, "senha");
  const fieldErrors = {
    email: validateEmail(email),
    senha: validatePassword(password),
  };
  if (fieldErrors.email || fieldErrors.senha) return { fieldErrors, email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: isServiceFailure(error) ? SERVICE_UNAVAILABLE : GENERIC_LOGIN_ERROR, email };
  }

  redirect(safeNext(formData.get("next")));
}

/** Pede o e-mail de nova senha. A resposta é sempre a mesma, exista a conta ou não. */
export async function requestPasswordReset(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { error: NOT_ACTIVE };

  const email = field(formData, "email").trim();
  const emailError = validateEmail(email);
  if (emailError) return { fieldErrors: { email: emailError }, email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: absoluteUrl(`${CONFIRM_PATH}?next=${SET_PASSWORD_PATH}`),
  });
  if (error?.status === HTTP_TOO_MANY_REQUESTS) {
    return { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo.", email };
  }

  return {
    success: "Se este e-mail tiver uma conta, enviaremos um link para criar uma nova senha. Confira também o spam.",
  };
}

/** Define a nova senha de quem chegou pelo link do e-mail (convite ou recuperação). Exige sessão. */
export async function updatePassword(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return { error: NOT_ACTIVE };

  const session = await getStudentSession();
  if (!session) redirect(LOGIN_PATH);

  const password = field(formData, "senha");
  const confirmation = field(formData, "confirmacao");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { fieldErrors: { senha: `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` } };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { fieldErrors: { senha: `Use no máximo ${MAX_PASSWORD_LENGTH} caracteres.` } };
  }
  if (password !== confirmation) {
    return { fieldErrors: { confirmacao: "As senhas não são iguais." } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { fieldErrors: { senha: "Escolha uma senha diferente da atual." } };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { senha: "Essa senha é fraca demais. Misture letras, números e símbolos." } };
    }
    return { error: isServiceFailure(error) ? SERVICE_UNAVAILABLE : "Não foi possível salvar a senha. Peça um novo link." };
  }

  revalidatePath(STUDENT_HOME, "layout");
  redirect(STUDENT_HOME);
}

/** Encerra a sessão deste aparelho (escopo local: não derruba o aluno nos outros aparelhos) e volta para o login. */
export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect(LOGIN_PATH);
}
