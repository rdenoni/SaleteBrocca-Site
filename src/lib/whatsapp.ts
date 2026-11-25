import type { MouseEvent } from "react";

export const DEFAULT_WHATSAPP_MESSAGE = "Olá! Gostaria de falar com a equipe Salete Brocca.";

export interface WhatsAppTargets {
  phone: string;
  /** Abre diretamente o aplicativo nativo do WhatsApp (mobile ou desktop). */
  appUrl: string;
  /** Fallback para WhatsApp Web no desktop quando o aplicativo não está instalado. */
  webUrl: string;
  /** Fallback HTTPS para mobile quando o protocolo nativo não responde. */
  mobileFallbackUrl: string;
  /** URL universal (wa.me) para atributo href, clique com botão direito, SEO e no-JS. */
  universalUrl: string;
}

/**
 * Extrai dígitos do telefone e mensagem opcional de qualquer formato aceito:
 * - https://wa.me/5548...
 * - https://api.whatsapp.com/send?phone=5548...&text=...
 * - https://web.whatsapp.com/send?phone=5548...&text=...
 * - whatsapp://send?phone=5548...&text=...
 * - tel:+5548... ou número formatado "+55 (48) 9973-4469"
 */
export function buildWhatsAppTargets(
  hrefOrPhone: string | null | undefined,
  fallbackMessage: string = DEFAULT_WHATSAPP_MESSAGE,
): WhatsAppTargets | null {
  const raw = (hrefOrPhone ?? "").trim();
  if (!raw) return null;

  let phone = "";
  let text = "";

  try {
    if (/^(https?:|whatsapp:)/i.test(raw)) {
      const parsed = new URL(raw);
      const queryPhone = parsed.searchParams.get("phone") ?? "";
      const pathDigits = parsed.pathname.replace(/\D/g, "");
      phone = (queryPhone || pathDigits).replace(/\D/g, "");
      text = parsed.searchParams.get("text")?.trim() ?? "";
    } else {
      phone = raw.replace(/\D/g, "");
    }
  } catch {
    phone = raw.replace(/\D/g, "");
  }

  if (phone.length < 10) return null;

  const finalMessage = text || fallbackMessage.trim();
  const encodedText = finalMessage ? encodeURIComponent(finalMessage) : "";
  const queryWithText = encodedText ? `&text=${encodedText}` : "";
  const waMeText = encodedText ? `?text=${encodedText}` : "";

  return {
    phone,
    appUrl: `whatsapp://send?phone=${phone}${queryWithText}`,
    webUrl: `https://web.whatsapp.com/send?phone=${phone}${queryWithText}`,
    mobileFallbackUrl: `https://api.whatsapp.com/send?phone=${phone}${queryWithText}`,
    universalUrl: `https://wa.me/${phone}${waMeText}`,
  };
}

function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Tenta abrir o aplicativo instalado do WhatsApp via protocolo nativo (`whatsapp://send`).
 * Se o navegador continuar ativo/visível após ~1,3s (indicando que o app não está instalado
 * ou não assumiu o foco), redireciona automaticamente para o WhatsApp Web (desktop)
 * ou api.whatsapp.com (mobile).
 */
export function openWhatsAppDirect(
  event: MouseEvent<HTMLElement>,
  hrefOrPhone: string | null | undefined,
  fallbackMessage: string = DEFAULT_WHATSAPP_MESSAGE,
): void {
  /* Preserva comportamento padrão para clique do meio, Ctrl/Cmd+clique ou Shift+clique. */
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }

  const targets = buildWhatsAppTargets(hrefOrPhone, fallbackMessage);
  if (!targets || typeof window === "undefined") return;

  event.preventDefault();

  const isMobile = isMobileUserAgent();
  const fallbackUrl = isMobile ? targets.mobileFallbackUrl : targets.webUrl;
  let appOpened = false;

  const cleanup = () => {
    window.removeEventListener("blur", markOpened);
    window.removeEventListener("pagehide", markOpened);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  const markOpened = () => {
    appOpened = true;
    window.clearTimeout(timer);
    cleanup();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      markOpened();
    }
  };

  window.addEventListener("blur", markOpened, { once: true });
  window.addEventListener("pagehide", markOpened, { once: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  const timer = window.setTimeout(() => {
    cleanup();
    if (!appOpened && document.visibilityState === "visible") {
      const opened = window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        window.location.assign(fallbackUrl);
      }
    }
  }, 1300);

  window.location.href = targets.appUrl;
}
