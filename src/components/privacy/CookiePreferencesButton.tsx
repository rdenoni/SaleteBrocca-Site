"use client";

import type { ReactNode } from "react";
import { openConsentPreferences } from "@/lib/consent";

interface CookiePreferencesButtonProps {
  className?: string;
  children?: ReactNode;
}

/* Botão (não link) que reabre o painel de preferências de cookies. Usado no rodapé e na política de privacidade. */
export function CookiePreferencesButton({ className, children = "Preferências de cookies" }: CookiePreferencesButtonProps) {
  return (
    <button type="button" className={className} onClick={openConsentPreferences}>
      {children}
    </button>
  );
}
