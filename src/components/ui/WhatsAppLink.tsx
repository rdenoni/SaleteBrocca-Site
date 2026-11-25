"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buildWhatsAppTargets, DEFAULT_WHATSAPP_MESSAGE, openWhatsAppDirect } from "@/lib/whatsapp";

interface WhatsAppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  message?: string;
  children: ReactNode;
}

/**
 * Link inteligente do WhatsApp: tenta abrir o aplicativo instalado (`whatsapp://send`)
 * e faz fallback automático para o WhatsApp Web caso o app não esteja instalado.
 */
export function WhatsAppLink({
  href,
  message = DEFAULT_WHATSAPP_MESSAGE,
  onClick,
  children,
  ...rest
}: WhatsAppLinkProps) {
  const targets = buildWhatsAppTargets(href, message);

  return (
    <a
      {...rest}
      href={targets?.universalUrl ?? href}
      target="_blank"
      rel="noopener noreferrer"
      data-whatsapp-direct="true"
      data-whatsapp-app={targets?.appUrl}
      data-whatsapp-web={targets?.webUrl}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          openWhatsAppDirect(event, href, message);
        }
      }}
    >
      {children}
    </a>
  );
}
