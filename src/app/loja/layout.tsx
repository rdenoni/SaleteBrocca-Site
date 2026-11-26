import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { BROWSE_PACE, MotionPace } from "@/motion/MotionPace";
import styles from "./layout.module.css";

/* Garante verificação de sessão admin em todas as requisições da Loja (/loja, /loja/[slug] e /loja/checkout). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ShopLayout({ children }: { children: ReactNode }) {
  await requireAdmin("/loja");

  return (
    <MotionPace pace={BROWSE_PACE}>
      <div className={styles.adminBar} role="status" data-surface="dark">
        <div className={`container ${styles.adminBarInner}`}>
          <span className={styles.adminBarText}>
            <Lock size={15} aria-hidden="true" />
            <span>
              <strong>Modo restrito (Admin):</strong> a Loja está oculta para o público e disponível apenas para
              administradores.
            </span>
          </span>
          <Link href="/admin" className={styles.adminBarLink}>
            Voltar ao Painel Admin
          </Link>
        </div>
      </div>
      {children}
    </MotionPace>
  );
}
