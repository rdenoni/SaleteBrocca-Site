/* Só links de checkout da própria Kiwify são exibidos: o valor vem de arquivo de conteúdo, mas um erro de
   digitação não pode mandar o comprador para outro domínio. */
const KIWIFY_DOMAIN = "kiwify.com.br";

/** Devolve a URL se for https em `kiwify.com.br` ou subdomínio (ex.: pay.kiwify.com.br), sem credenciais; senão null. */
export function validatedCheckoutUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username !== "" || url.password !== "") return null;
  const host = url.hostname.toLowerCase();
  if (host !== KIWIFY_DOMAIN && !host.endsWith(`.${KIWIFY_DOMAIN}`)) return null;
  return url.toString();
}
