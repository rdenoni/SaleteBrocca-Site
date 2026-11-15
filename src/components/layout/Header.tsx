"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HOME_FEATURED_NAV_HREF, MAIN_NAV, STUDENT_AREA } from "@/lib/content/site";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const currentHref = MAIN_NAV.find((item) => isCurrent(pathname, item.href))?.href;
  /* Na Home nenhuma página está ativa: a gota ciano destaca Cursos, como na referência. */
  const highlightedHref = currentHref ?? (pathname === "/" ? HOME_FEATURED_NAV_HREF : undefined);

  return (
    <header className={styles.wrap}>
      <div className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Salete Brocca, página inicial">
          <Image
            src="/brand/logo/logo-lateral-cor.png"
            alt="SaleteBrocca"
            width={500}
            height={155}
            sizes="(max-width: 1099px) 130px, 181px"
            priority
            className={styles.logoImage}
          />
        </Link>

        <nav aria-label="Principal" className={styles.nav}>
          <ul className={styles.navList}>
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  data-highlighted={item.href === highlightedHref ? "" : undefined}
                  aria-current={item.href === currentHref ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Button
            href={STUDENT_AREA.href}
            variant="accent"
            icon={<User aria-hidden="true" />}
            className={styles.studentButton}
            labelClassName={styles.studentLabel}
            aria-label={STUDENT_AREA.label}
            aria-current={isCurrent(pathname, STUDENT_AREA.href) ? "page" : undefined}
          >
            {STUDENT_AREA.label}
          </Button>
          <MobileMenu items={MAIN_NAV} currentHref={currentHref} studentArea={STUDENT_AREA} />
        </div>
      </div>
    </header>
  );
}
