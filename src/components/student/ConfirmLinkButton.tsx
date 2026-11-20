"use client";

import { motion } from "motion/react";
import { useFormStatus } from "react-dom";
import { MotionButton } from "@/motion/MotionButton";
import { revealVariants } from "@/motion/Reveal";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { useAuthCascade } from "./AuthCard";
import styles from "./LoginForm.module.css";

/* Desliga o botão enquanto envia: um segundo clique gastaria o token de novo e levaria a "link inválido" mesmo com a
   sessão já aberta. Entra sozinho (sobe) depois do texto do cartão: é o único item do formulário. */
export function ConfirmLinkButton() {
  const { pending } = useFormStatus();
  const t = useMotionTokens();
  const { ready, delay } = useAuthCascade();
  return (
    <motion.div
      data-reveal=""
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      variants={revealVariants("rise", t, delay)}
    >
      <MotionButton type="submit" variant="primary" className={styles.submit} disabled={pending} aria-busy={pending}>
        {pending ? "Continuando…" : "Continuar"}
      </MotionButton>
    </motion.div>
  );
}
