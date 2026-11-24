"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./StickyActionBar.module.css";

const SHOW_AFTER_SCROLL_PX = 520;

interface StickyActionBarProps {
  children: ReactNode;
}

/* Mobile e tablet: ação principal ao alcance do polegar, aparecendo suavemente apenas após rolar além do CTA do topo
   (evita duplicar/sobrepor o botão do bloco comercial na abertura da tela). Some a partir de 1100px. */
export function StickyActionBar({ children }: StickyActionBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_SCROLL_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className={styles.bar} data-visible={visible ? "true" : "false"} aria-hidden={!visible || undefined}>
      {children}
    </div>
  );
}
