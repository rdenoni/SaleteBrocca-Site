"use client";

import { motion, stagger as staggerChildren, type Variants } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type SyntheticEvent } from "react";
import { MAIN_NAV, STUDENT_AREA } from "@/lib/content/site";
import { MenuToggleIcon } from "@/motion/icons";
import { useMotionTokens } from "@/motion/useMotionTokens";
import { isPlainLeftClick, useChromeNavigation } from "./useChromeNavigation";
import styles from "./MobileMenu.module.css";

/* A saída é ≈70% da entrada (regra do sistema) e a folga cobre o último quadro antes de fechar o <dialog>. */
const EXIT_RATIO = 0.7;
const EXIT_SLACK_MS = 60;

/* Menu em tela cheia para tablet e celular. Mantém a semântica do site: <dialog> modal (foco preso, Esc fecha,
   fundo inerte). Abrir: o painel navy se revela de cima para baixo e os links sobem em sequência.
   Fechar (botão, Esc ou link): toca a saída e só então chama dialog.close(). Reduzido: só opacidade. */
interface MobileMenuProps {
  /** Item da rota atual: ganha aria-current="page". */
  currentHref?: string;
}

export function MobileMenu({ currentHref }: MobileMenuProps) {
  const t = useMotionTokens();
  const dialogId = useId();
  const pathname = usePathname() ?? "";
  const { go } = useChromeNavigation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const closingRef = useRef(false);
  const [open, setOpen] = useState(false);

  const openMenu = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    window.clearTimeout(closeTimerRef.current);
    closingRef.current = false;
    dialog.showModal();
    setOpen(true);
  }, []);

  /* Toca a saída e fecha o <dialog>; `after` roda já com o menu fechado (ex.: rolar até a seção). */
  const closeMenu = useCallback(
    (after?: () => void) => {
      const dialog = dialogRef.current;
      if (!dialog?.open || closingRef.current) return;
      closingRef.current = true;
      setOpen(false);
      const exit = t.reduced ? t.duration.quick : t.duration.slow * EXIT_RATIO;
      closeTimerRef.current = window.setTimeout(() => {
        closingRef.current = false;
        dialogRef.current?.close();
        after?.();
      }, exit * 1000 + EXIT_SLACK_MS);
    },
    [t],
  );

  /* Trocou de página: o menu não pode ficar aberto. */
  useEffect(() => {
    window.clearTimeout(closeTimerRef.current);
    closingRef.current = false;
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setOpen(false);
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  /* Esc: em vez de fechar de cara, toca a saída. O onClose abaixo cobre o fechamento nativo
     (o Chrome pode pular o `cancel` num segundo Esc seguido). */
  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    closeMenu();
  }

  function handleLinkClick(href: string) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isPlainLeftClick(event)) return;
      event.preventDefault();
      closeMenu(() => go(href));
    };
  }

  const itemTransition = t.reduced
    ? { duration: t.duration.quick }
    : { duration: t.duration.gentle, ease: t.ease.out };
  const still = { y: 0 };
  const sheetVariants: Variants = t.reduced
    ? {
        closed: { opacity: 0, clipPath: "inset(0% 0% 0% 0%)", transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
        open: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", transition: { duration: t.duration.quick, clipPath: { duration: 0 } } },
      }
    : {
        closed: {
          clipPath: "inset(0% 0% 100% 0%)",
          transition: { duration: t.duration.slow * EXIT_RATIO, ease: t.ease.in },
        },
        open: {
          clipPath: "inset(0% 0% 0% 0%)",
          transition: {
            duration: t.duration.slow,
            ease: t.ease.stroke,
            /* Os links começam no meio da abertura do painel (sobreposição), um depois do outro. */
            delayChildren: staggerChildren(t.stagger.items, { startDelay: t.duration.base }),
          },
        },
      };
  const itemVariants: Variants = t.reduced
    ? {
        closed: { opacity: 0, ...still, transition: { duration: t.duration.quick, y: { duration: 0 } } },
        open: { opacity: 1, ...still, transition: { ...itemTransition, y: { duration: 0 } } },
      }
    : {
        closed: { opacity: 0, y: t.distance.base, transition: { duration: t.duration.quick, ease: t.ease.in } },
        open: { opacity: 1, y: 0, transition: itemTransition },
      };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Abrir menu"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={open}
        onClick={openMenu}
      >
        <MenuToggleIcon open={open} size={22} />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.panel}
        aria-label="Menu"
        data-surface="dark"
        onCancel={handleCancel}
        onClose={() => {
          closingRef.current = false;
          setOpen(false);
        }}
      >
        <motion.div
          className={styles.sheet}
          data-reveal=""
          initial="closed"
          animate={open ? "open" : "closed"}
          variants={sheetVariants}
        >
          <motion.div className={styles.top} data-reveal="" variants={itemVariants}>
            {/* eager: dentro de um <dialog> fechado o lazy-load nunca dispara. */}
            <Image
              src="/brand/logo/logo-lateral-branco.png"
              alt="SaleteBrocca"
              width={500}
              height={154}
              sizes="180px"
              loading="eager"
              className={styles.logo}
            />
            <button type="button" className={styles.close} aria-label="Fechar menu" onClick={() => closeMenu()}>
              <MenuToggleIcon open={open} size={24} />
            </button>
          </motion.div>

          <nav aria-label="Principal (menu móvel)">
            <ul className={styles.list}>
              {MAIN_NAV.map((item) => (
                <motion.li key={item.href} data-reveal="" variants={itemVariants}>
                  <a
                    href={item.href}
                    className={styles.link}
                    aria-current={item.href === currentHref ? "page" : undefined}
                    onClick={handleLinkClick(item.href)}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.div className={styles.studentWrap} data-reveal="" variants={itemVariants}>
            <a
              href={STUDENT_AREA.href}
              className={styles.student}
              aria-current={
                pathname === STUDENT_AREA.href || pathname.startsWith(`${STUDENT_AREA.href}/`) ? "page" : undefined
              }
              onClick={handleLinkClick(STUDENT_AREA.href)}
            >
              <User aria-hidden="true" />
              {STUDENT_AREA.label}
            </a>
          </motion.div>
        </motion.div>
      </dialog>
    </>
  );
}
