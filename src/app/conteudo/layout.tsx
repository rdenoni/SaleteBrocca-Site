import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ARTICLES_ARE_EXAMPLES } from "@/lib/content/articles";

/* Artigos de exemplo não entram nos buscadores. */
export const metadata: Metadata = ARTICLES_ARE_EXAMPLES ? { robots: { index: false, follow: true } } : {};

export default function ContentLayout({ children }: { children: ReactNode }) {
  return children;
}
