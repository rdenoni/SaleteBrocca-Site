import type { NextConfig } from "next";
import { getCourses } from "./src/lib/content/courses";

/* Os cursos moravam também na Loja (/loja/[slug] e /loja/checkout?produto=). A compra deles vive só em /cursos
   (a Loja apenas os apresenta): os endereços antigos continuam funcionando com 301 (mantém links salvos e o que os
   buscadores já conhecem). Fontes explícitas, uma por curso: /loja/[slug] fica livre para os produtos avulsos.
   `statusCode` no lugar de `permanent`: o Next usa 308 para `permanent`, e aqui o pedido é 301. */
const MOVED_PERMANENTLY = 301;

const courseSlugs = getCourses().map((course) => course.slug);

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      ...courseSlugs.map((slug) => ({
        source: `/loja/${slug}`,
        destination: `/cursos/${slug}`,
        statusCode: MOVED_PERMANENTLY,
      })),
      ...courseSlugs.map((slug) => ({
        source: "/loja/checkout",
        /* O Next lê `value` como regex (ancorada): escapar o slug evita que "." ou "+" casem outra coisa. */
        has: [{ type: "query" as const, key: "produto", value: escapeRegExp(slug) }],
        destination: `/cursos/${slug}/compra`,
        statusCode: MOVED_PERMANENTLY,
      })),
      /* /loja?categoria=cursos não redireciona mais: a Loja tem a categoria "Cursos" (vitrine que leva a /cursos/[slug]). */
    ];
  },
  /* A biblioteca de marca vive em public/biblioteca (arquivos estáticos). O Next não serve index.html de pasta:
     este rewrite faz /biblioteca abrir o índice. */
  async rewrites() {
    return [
      { source: "/biblioteca", destination: "/biblioteca/index.html" },
      /* Motion Design System (laboratório de movimento): exportação estática do projeto salete-motion-lab em
         public/motion. Cada rota é um .html ao lado de uma pasta de dados (/motion/home.html, /motion/home/...). */
      { source: "/motion", destination: "/motion/index.html" },
      { source: "/motion/:path([^.]+)", destination: "/motion/:path.html" },
    ];
  },
  /* Cabeçalhos de segurança globais (incluindo CSP) + noindex no laboratório de movimento + cache HTTP longo em assets locais. */
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.mux.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://image.mux.com",
      "media-src 'self' blob: https://*.mux.com https://stream.mux.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.mux.com https://*.litix.io",
      "font-src 'self' data:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://pay.kiwify.com.br",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      { source: "/motion", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/motion/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default nextConfig;
