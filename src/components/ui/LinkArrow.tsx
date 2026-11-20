import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./LinkArrow.module.css";

interface LinkArrowProps {
  href: string;
  children: ReactNode;
  tone?: "default" | "inverse";
  className?: string;
  /** Use quando outro link já cobre o mesmo destino (evita parada dupla no teclado). */
  decorative?: boolean;
}

export function LinkArrow({ href, children, tone = "default", className, decorative = false }: LinkArrowProps) {
  const classes = [styles.link, tone === "inverse" ? styles.inverse : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Link
      href={href}
      className={classes}
      tabIndex={decorative ? -1 : undefined}
      aria-hidden={decorative ? true : undefined}
    >
      {children}
      {/* Seta "Acesse" da biblioteca: arrow-right de 18px, traço 2, avança 4px no hover. */}
      <ArrowRight aria-hidden="true" size={18} />
    </Link>
  );
}
