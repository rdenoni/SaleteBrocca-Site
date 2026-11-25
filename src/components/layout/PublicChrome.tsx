"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import type { FooterColumn, SocialLink } from "@/types/content";

interface PublicChromeProps {
  footerColumns: FooterColumn[];
  year: number;
  socialLinks: readonly SocialLink[];
  children: ReactNode;
}

/* No painel administrativo (/admin) o site público (barra NAV, rodapé e aviso de cookies) não é renderizado,
   entregando um workspace de aplicativo focado em tela cheia. */
export function PublicChrome({ footerColumns, year, socialLinks, children }: PublicChromeProps) {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return (
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer columns={footerColumns} year={year} socialLinks={socialLinks} />
      <CookieConsent />
    </>
  );
}
