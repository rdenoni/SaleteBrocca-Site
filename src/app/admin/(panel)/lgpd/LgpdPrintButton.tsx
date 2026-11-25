"use client";

import { Printer } from "lucide-react";
import styles from "../cms.module.css";

export function LgpdPrintButton() {
  return (
    <button type="button" className={styles.secondaryBtn} onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" />
      <span>Imprimir / Exportar PDF</span>
    </button>
  );
}
