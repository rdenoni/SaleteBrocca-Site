import type { NextConfig } from "next";
import { getCourses } from "./src/lib/content/courses";

/* Os cursos moravam também na Loja (/loja/[slug] e /loja/checkout?produto=). Agora vivem só em /cursos:
   os endereços antigos continuam funcionando com 301 (mantém links salvos e o que os buscadores já conhecem).
   Fontes explícitas, uma por curso: /loja/[slug] precisa ficar livre para os futuros produtos avulsos.
   `statusCode` no lugar de `permanent`: o Next usa 308 para `permanent`, e aqui o pedido é 301. */
const MOVED_PERMANENTLY = 301;

const courseSlugs = getCourses().map((course) => course.slug);

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
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
      /* Só "cursos": ?categoria=materiais e ?categoria=jogos continuam filtrando a própria Loja. */
      {
        source: "/loja",
        has: [{ type: "query" as const, key: "categoria", value: "cursos" }],
        destination: "/cursos",
        statusCode: MOVED_PERMANENTLY,
      },
    ];
  },
  /* A biblioteca de marca vive em public/biblioteca (arquivos estáticos). O Next não serve index.html de pasta:
     este rewrite faz /biblioteca abrir o índice. */
  async rewrites() {
    return [{ source: "/biblioteca", destination: "/biblioteca/index.html" }];
  },
};

export default nextConfig;
