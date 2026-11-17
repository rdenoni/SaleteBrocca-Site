import type { Metadata, Viewport } from "next";
import { Martel, Noto_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import "@/styles/motion.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getFooterColumns } from "@/lib/content/footer";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/content/site";
import { SITE_URL } from "@/lib/site-url";
import { MotionProvider } from "@/motion/MotionProvider";
import { NOSCRIPT_REVEAL_CSS } from "@/motion/noscript";
import { PageTransitionProvider } from "@/motion/transitions/PageTransitionProvider";

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
  /* Base das URLs absolutas geradas pelo Next (Open Graph, alternates). Ver src/lib/site-url.ts. */
  metadataBase: new URL(SITE_URL),
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
  /* Ano no servidor, passado como prop: o rodapé (componente de cliente) não calcula a data e a hidratação bate. */
  const year = new Date().getFullYear();
  const footerColumns = getFooterColumns();
  return (
    /* data-scroll-behavior: rolagem suave só nas âncoras, não ao trocar de página. */
    <html lang="pt-BR" className={`${notoSans.variable} ${martel.variable}`} data-scroll-behavior="smooth">
      <body>
        {/* Sem JavaScript, nada fica escondido no estado inicial das animações. */}
        <noscript>
          <style>{NOSCRIPT_REVEAL_CSS}</style>
        </noscript>
        <MotionProvider>
          <PageTransitionProvider>
            <a className="skip-link" href="#conteudo">
              Pular para o conteúdo
            </a>
            <Header />
            <main id="conteudo">{children}</main>
            <Footer columns={footerColumns} year={year} />
          </PageTransitionProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
