"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMotionTokens } from "./useMotionTokens";

const SCROLL_STORAGE_PREFIX = "salete-brocca:scroll:";

export function getSavedScroll(pathname: string): number {
  try {
    const raw = window.sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}${pathname}`);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveScroll(pathname: string, y: number): void {
  try {
    window.sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}${pathname}`, String(Math.max(0, Math.round(y))));
  } catch {
    /* Navegação privada ou armazenamento bloqueado: ignora sem falhar. */
  }
}

/* Rolagem suave refinada via Lenis (desktop com mouse e movimento completo) + preservação da posição de rolagem
   ao carregar ou recarregar a página (respeitando #âncoras explícitas e qualquer rolagem manual do usuário). */
export function SmoothScroll() {
  const t = useMotionTokens();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (t.reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
      smoothWheel: true,
      syncTouch: false,
      autoRaf: true,
    });
    lenisRef.current = lenis;

    return () => {
      lenisRef.current = null;
      lenis.destroy();
    };
  }, [t.reduced]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const savedY = window.location.hash ? 0 : getSavedScroll(pathname);
    let restoring = savedY > 0;
    let cancelledByUser = false;
    let rafId = 0;
    let settleTimer = 0;
    let saveTimer = 0;

    const applySaved = () => {
      if (!restoring || cancelledByUser) return;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(savedY, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: savedY, left: 0, behavior: "instant" });
      }
    };

    const cancelRestore = () => {
      cancelledByUser = true;
      restoring = false;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
    };

    if (restoring) {
      applySaved();
      rafId = window.requestAnimationFrame(() => {
        applySaved();
        settleTimer = window.setTimeout(() => {
          applySaved();
          restoring = false;
        }, 180);
      });
    }

    const onLoad = () => {
      if (restoring && !cancelledByUser) applySaved();
    };

    const onScroll = () => {
      if (restoring) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveScroll(pathname, window.scrollY);
      }, 80);
    };

    const onLeave = () => {
      saveScroll(pathname, window.scrollY);
    };

    window.addEventListener("wheel", cancelRestore, { passive: true, once: true });
    window.addEventListener("touchstart", cancelRestore, { passive: true, once: true });
    window.addEventListener("load", onLoad, { once: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      window.clearTimeout(saveTimer);
      window.removeEventListener("wheel", cancelRestore);
      window.removeEventListener("touchstart", cancelRestore);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
      if (!restoring) saveScroll(pathname, window.scrollY);
    };
  }, [pathname]);

  return null;
}
