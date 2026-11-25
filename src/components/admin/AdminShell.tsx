"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  FileText,
  HardDrive,
  Image as ImageIcon,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  Mail,
  Menu,
  ShieldCheck,
  Target,
  UserPlus,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ADMIN_NAV_GROUPS, type AdminNavIcon } from "@/lib/admin/nav";
import styles from "./AdminShell.module.css";

const ICONS: Record<AdminNavIcon, typeof LayoutDashboard> = {
  "layout-dashboard": LayoutDashboard,
  image: ImageIcon,
  link: Link2,
  "file-text": FileText,
  users: Users,
  "user-plus": UserPlus,
  wallet: Wallet,
  target: Target,
  "life-buoy": LifeBuoy,
  activity: Activity,
  video: Video,
  "hard-drive": HardDrive,
  "bar-chart": BarChart3,
  "shield-check": ShieldCheck,
  mail: Mail,
};

interface AdminShellProps {
  adminName: string;
  adminEmail: string;
  mode: "live" | "demo";
  children: ReactNode;
}

export function AdminShell({ adminName, adminEmail, mode, children }: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.topBand}>
        <div className={styles.topInner}>
          <div className={styles.topIdentity}>
            <span className={styles.kicker}>Administração · Salete Brocca</span>
            <div className={styles.topMeta}>
              <span className={styles.modeBadge} data-mode={mode}>
                {mode === "live" ? "Conectado ao Supabase" : "Modo demonstração"}
              </span>
              <span className={styles.adminUser} title={adminEmail}>
                {adminName}
              </span>
            </div>
          </div>

          <div className={styles.topActions}>
            <Link href="/" className={styles.backSite}>
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Voltar ao site</span>
            </Link>
            <button
              type="button"
              className={styles.mobileToggle}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-sidebar-nav"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              {mobileNavOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              <span>Módulos</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.workspace}>
        <aside
          id="admin-sidebar-nav"
          className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`}
          aria-label="Navegação do painel administrativo"
        >
          <nav className={styles.nav}>
            {ADMIN_NAV_GROUPS.map((group) => (
              <div key={group.id} className={styles.navGroup}>
                <p className={styles.groupLabel}>{group.label}</p>
                <ul className={styles.navList}>
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon];
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    if (!item.ready) {
                      return (
                        <li key={item.id}>
                          <span className={styles.navItemPlanned} aria-disabled="true" title={item.description}>
                            <Icon size={17} aria-hidden="true" className={styles.navIcon} />
                            <span className={styles.navText}>{item.label}</span>
                            <span className={styles.stageTag}>E{item.stage}</span>
                          </span>
                        </li>
                      );
                    }

                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={styles.navItem}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMobileNavOpen(false)}
                        >
                          <Icon size={17} aria-hidden="true" className={styles.navIcon} />
                          <span className={styles.navText}>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
