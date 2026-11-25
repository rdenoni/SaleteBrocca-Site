"use client";

import {
  Activity,
  BarChart3,
  ChevronRight,
  ExternalLink,
  FileText,
  HardDrive,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  LogOut,
  Mail,
  Menu,
  Search,
  ShieldCheck,
  Target,
  UserPlus,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { adminLogoutAction } from "@/app/admin/login/actions";
import { ADMIN_NAV_GROUPS, ALL_ADMIN_NAV_ITEMS, type AdminNavIcon } from "@/lib/admin/nav";
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
  "key-round": KeyRound,
};

interface AdminShellProps {
  adminName: string;
  adminEmail: string;
  mode: "live" | "demo";
  children: ReactNode;
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email.trim() || "AD";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function AdminShell({ adminName, adminEmail, mode, children }: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const currentItem = useMemo(() => {
    return (
      ALL_ADMIN_NAV_ITEMS.find((item) =>
        item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) ?? ALL_ADMIN_NAV_ITEMS[0]
    );
  }, [pathname]);

  const filteredGroups = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return ADMIN_NAV_GROUPS;
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
      ),
    })).filter((group) => group.items.length > 0);
  }, [navSearch]);

  const initials = getInitials(adminName, adminEmail);

  return (
    <div className={styles.shell}>
      {mobileNavOpen ? (
        <div
          className={styles.backdrop}
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        id="admin-sidebar-nav"
        className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ""}`}
        aria-label="Navegação do painel administrativo"
      >
        <div className={styles.sidebarBrand}>
          <Link href="/admin" className={styles.brandLink} onClick={() => setMobileNavOpen(false)}>
            <Image
              src="/brand/logo/logo-lateral-branco.png"
              alt="Salete Brocca"
              width={160}
              height={50}
              className={styles.brandLogo}
              priority
            />
            <span className={styles.adminPill}>ADM</span>
          </Link>
          <button
            type="button"
            className={styles.drawerClose}
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.sidebarSearch}>
          <Search size={15} aria-hidden="true" className={styles.searchIcon} />
          <input
            type="search"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Filtrar módulos..."
            aria-label="Filtrar módulos do painel"
            className={styles.searchInput}
          />
        </div>

        <nav className={styles.nav}>
          {filteredGroups.map((group) => (
            <div key={group.id} className={styles.navGroup}>
              <p className={styles.groupLabel}>{group.label}</p>
              <ul className={styles.navList}>
                {group.items.map((item) => {
                  const Icon = ICONS[item.icon];
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

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

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <span className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
            <div className={styles.userMeta}>
              <strong className={styles.userName}>{adminName}</strong>
              <span className={styles.userEmail} title={adminEmail}>
                {adminEmail}
              </span>
            </div>
          </div>
          <div className={styles.sidebarFooterActions}>
            <Link href="/" className={styles.visitSite}>
              <span>Ver site</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
            <form action={adminLogoutAction}>
              <button type="submit" className={styles.logoutBtn}>
                <LogOut size={14} aria-hidden="true" />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className={styles.mainCol}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileToggle}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-sidebar-nav"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              <Menu size={18} aria-hidden="true" />
              <span>Módulos</span>
            </button>

            <div className={styles.breadcrumb} aria-label="Localização atual">
              <Link href="/admin" className={styles.crumbRoot}>
                Admin
              </Link>
              {currentItem.href !== "/admin" ? (
                <>
                  <ChevronRight size={14} aria-hidden="true" className={styles.crumbSep} />
                  <span className={styles.crumbCurrent}>{currentItem.label}</span>
                </>
              ) : (
                <>
                  <ChevronRight size={14} aria-hidden="true" className={styles.crumbSep} />
                  <span className={styles.crumbCurrent}>Visão Geral</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.statusChip} data-mode={mode}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{mode === "live" ? "Supabase Live" : "Modo Demo"}</span>
            </span>
            <Link href="/" className={styles.topbarSiteBtn}>
              <span>Ver site</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div className={styles.contentWrap}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );
}
