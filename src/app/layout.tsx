import type { Metadata, Viewport } from "next";
import { Martel, Noto_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/content/site";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-noto-sans",
  display: "swap",
});

const martel = Martel({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-martel",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Fonoaudiologia e cursos`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/brand/logo/icone-app.png",
    apple: "/icons/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Fonoaudiologia e cursos`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  /* Valor de --navy em src/styles/tokens.css (a meta tag não lê variáveis CSS). */
  themeColor: "#0f2438",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* data-scroll-behavior: rolagem suave só nas âncoras, não ao trocar de página. */
    <html lang="pt-BR" className={`${notoSans.variable} ${martel.variable}`} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
