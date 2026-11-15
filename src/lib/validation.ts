/* Regras de validação dos formulários (Home e Contato). Mensagens em português, sem jargão. */

const MIN_NAME_LENGTH = 3;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 13; // 55 + DDD + 9 dígitos
const MIN_MESSAGE_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | undefined {
  return value.trim().length < MIN_NAME_LENGTH ? "Informe seu nome completo." : undefined;
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "").length;
  if (digits > MAX_PHONE_DIGITS) return "Confira o telefone: use só o DDD e o número.";
  return digits < MIN_PHONE_DIGITS ? "Informe um telefone com DDD." : undefined;
}

/** E-mail opcional: só valida o formato quando preenchido. */
export function validateOptionalEmail(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed && !EMAIL_PATTERN.test(trimmed) ? "Confira o e-mail (ex.: nome@provedor.com)." : undefined;
}

export function validateEmail(value: string): string | undefined {
  return value.trim() ? validateOptionalEmail(value) : "Informe seu e-mail.";
}

export function validatePassword(value: string): string | undefined {
  return value ? undefined : "Informe sua senha.";
}

export function validateMessage(value: string): string | undefined {
  return value.trim().length < MIN_MESSAGE_LENGTH ? "Escreva sua mensagem (mínimo de 10 caracteres)." : undefined;
}

export function validateConsent(checked: boolean): string | undefined {
  return checked ? undefined : "É preciso aceitar a política de privacidade.";
}

/** Remove as chaves sem erro, para saber se o formulário está válido. */
export function compactErrors<T extends Record<string, string | undefined>>(errors: T): Partial<T> {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message !== undefined)) as Partial<T>;
}
