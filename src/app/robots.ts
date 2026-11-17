import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

/* Rastreamento liberado. As páginas que não devem aparecer na busca (Área do Aluno, inscrição, checkout, termos,
   artigos de exemplo) usam a meta noindex: bloquear o rastreamento aqui impediria o buscador de ler essa meta, e o
   endereço ainda poderia ser indexado a partir de links. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
