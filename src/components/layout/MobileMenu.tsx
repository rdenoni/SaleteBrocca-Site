"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, User, X } from "lucide-react";
import type { NavItem } from "@/types/content";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  items: readonly NavItem[];
  currentHref?: string;
  studentArea: NavItem;
}

/* Menu em tela cheia para tablet e mobile. Usa <dialog> modal: foco preso, Esc fecha, fundo inerte. */
export function MobileMenu({ items, currentHref, studentArea }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.panel}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        data-surface="dark"
      >
        <div className={styles.top}>
          {/* eager: dentro de um <dialog> fechado o lazy-load nunca dispara. */}
          <Image
            src="/brand/logo/logo-lateral-branco.png"
            alt="SaleteBrocca"
            width={500}
            height={154}
            sizes="130px"
            loading="eager"
            className={styles.logo}
          />
          <button type="button" className={styles.close} aria-label="Fechar menu" onClick={() => setOpen(false)}>
            <X aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Principal (menu móvel)">
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={item.href === currentHref ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href={studentArea.href}
          className={styles.student}
          aria-current={
            pathname === studentArea.href || pathname?.startsWith(`${studentArea.href}/`) ? "page" : undefined
          }
          onClick={() => setOpen(false)}
        >
          <User aria-hidden="true" />
          {studentArea.label}
        </Link>
      </dialog>
    </>
  );
}
