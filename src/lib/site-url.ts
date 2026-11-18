/* Endereço público do site, usado onde o HTML precisa de URL absoluta (sitemap, robots, dados estruturados,
   metadataBase). Ordem: variável própria do projeto → `URL` que a Netlify define no build (o endereço principal do
   projeto) → domínio próprio, já ligado ao projeto na Netlify. */
const FALLBACK_SITE_URL = "https://saletebrocca.com";

function normalize(origin: string): string {
  return origin.replace(/\/+$/, "");
}

export const SITE_URL: string = normalize(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || FALLBACK_SITE_URL,
);

/** Caminho do site ("/cursos") → URL absoluta ("https://…/cursos"). */
export function absoluteUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
