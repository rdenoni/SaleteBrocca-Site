/* Estado devolvido pelas Server Actions de autenticação (useActionState). Nunca carrega a senha. */
export interface AuthFormState {
  /** Mensagem geral do formulário (ex.: "E-mail ou senha incorretos."). */
  error?: string;
  /** Erros por campo, na ordem em que o foco deve ir. Chaves = `name` dos campos. */
  fieldErrors?: { email?: string; atual?: string; senha?: string; confirmacao?: string };
  /** Sucesso sem redirecionamento (ex.: pedido de nova senha). */
  success?: string;
  /** E-mail digitado, para o campo não esvaziar depois do envio (o React limpa o formulário). */
  email?: string;
}

export const INITIAL_AUTH_STATE: AuthFormState = {};
