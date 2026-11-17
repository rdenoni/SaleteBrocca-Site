"use client";

import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useMotionTokens } from "@/motion/useMotionTokens";
import styles from "./Footer.module.css";

/* Volta ao topo: rola (suave; instantâneo com movimento reduzido) e leva o foco ao conteúdo,
   para o próximo Tab começar do início da página. A seta sobe 4px (distance.micro) no hover e no foco. */
export function BackToTop() {
  const t = useMotionTokens();
  const [active, setActive] = useState(false);

  function handleClick() {
    window.scrollTo({ top: 0, left: 0, behavior: t.reduced ? "instant" : "smooth" });
    const main = document.getElementById("conteudo");
    if (!main) return;
    /* tabindex -1: focável por script e fora da ordem do Tab. preventScroll: senão o foco cancela a rolagem suave. */
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      className={styles.backToTop}
      onClick={handleClick}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setActive(true);
      }}
      onPointerLeave={() => setActive(false)}
      onFocus={(event) => setActive(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => setActive(false)}
    >
      <span>Voltar ao topo</span>
      <motion.span
        className={styles.backToTopIcon}
        aria-hidden="true"
        initial={false}
        animate={{ y: active && !t.reduced ? -t.distance.micro : 0 }}
        transition={{ duration: t.duration.quick, ease: t.ease.out }}
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </motion.span>
    </button>
  );
}
