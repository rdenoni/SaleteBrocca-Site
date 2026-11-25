import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import styles from "./AdminHomeShortcut.module.css";

/* Botão flutuante exclusivo na Home: renderizado no servidor SOMENTE quando o usuário logado possui role 'admin'. */
export function AdminHomeShortcut() {
  return (
    <Link href="/admin" className={styles.shortcut} aria-label="Abrir Painel Administrativo">
      <span className={styles.iconWrap} aria-hidden="true">
        <ShieldCheck size={16} />
      </span>
      <span className={styles.label}>Painel Admin</span>
      <ArrowRight size={15} aria-hidden="true" className={styles.arrow} />
    </Link>
  );
}
