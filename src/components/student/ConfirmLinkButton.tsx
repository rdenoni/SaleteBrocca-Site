"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import styles from "./LoginForm.module.css";

/* Desliga o botão enquanto envia: um segundo clique gastaria o token de novo e levaria a "link inválido" mesmo com a
   sessão já aberta. */
export function ConfirmLinkButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
      {pending ? "Continuando…" : "Continuar"}
    </Button>
  );
}
