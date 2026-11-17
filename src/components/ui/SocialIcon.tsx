import type { ReactElement } from "react";
import type { SocialNetwork } from "@/types/content";

/* Lucide 1.x não inclui marcas. Traços no mesmo estilo Lucide (2px, cantos arredondados). */
const PATHS: Record<SocialNetwork, ReactElement> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  /* Balão com cauda embaixo à esquerda e um fone pequeno dentro (o fone solto lia-se como "telefone"). */
  whatsapp: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
      <path d="M9.5 9.5c.5 2.5 2.5 4.5 5 5l1-1.5-1.8-1-.8.7a3.5 3.5 0 0 1-1.6-1.6l.7-.8-1-1.8z" />
    </>
  ),
};

interface SocialIconProps {
  network: SocialNetwork;
  className?: string;
}

export function SocialIcon({ network, className }: SocialIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[network]}
    </svg>
  );
}
