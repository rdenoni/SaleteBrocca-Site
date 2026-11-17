"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ComponentProps, type FocusEvent, type MouseEvent } from "react";
import { usePageTransition } from "./PageTransitionProvider";

export type TransitionLinkProps = ComponentProps<typeof Link>;

/* Link do Next que toca a cortina antes de navegar. Mesma API do next/link.
   O Link já filtra o que o navegador deve tratar sozinho (Ctrl/Cmd/Shift/Alt, botão do meio,
   target="_blank", download, outra origem) e só chama onNavigate numa navegação SPA comum.
   Aqui falta apenas: mesmo caminho (inclui só hash e só query) e href em objeto sem URL resolvida. */
export function TransitionLink({ onClick, onNavigate, onMouseEnter, onFocus, replace, scroll, ...rest }: TransitionLinkProps) {
  const transition = usePageTransition();
  const router = useRouter();
  const clickedHrefRef = useRef<string | null>(null);

  function prefetchFrom(anchor: HTMLAnchorElement) {
    if (!transition?.curtainActive) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
    /* O router do Next já evita pedidos repetidos e sabe quando o cache venceu: sem cache próprio aqui. */
    try {
      router.prefetch(url.pathname + url.search);
    } catch {
      /* prefetch é só otimização: a navegação funciona sem ele */
    }
  }

  function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
    onMouseEnter?.(event);
    prefetchFrom(event.currentTarget);
  }

  function handleFocus(event: FocusEvent<HTMLAnchorElement>) {
    onFocus?.(event);
    prefetchFrom(event.currentTarget);
  }

  /* O onNavigate do Link não traz o elemento; guardamos o href resolvido no clique que o antecede. */
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    clickedHrefRef.current = event.defaultPrevented ? null : event.currentTarget.href;
  }

  function handleNavigate(event: { preventDefault: () => void }) {
    let prevented = false;
    onNavigate?.({
      preventDefault: () => {
        prevented = true;
        event.preventDefault();
      },
    });
    const href = clickedHrefRef.current;
    clickedHrefRef.current = null;
    if (prevented || !href || !transition?.curtainActive || scroll === false) return;

    const target = new URL(href, window.location.href);
    if (target.origin !== window.location.origin) return;
    if (target.pathname === window.location.pathname) return;

    event.preventDefault();
    transition.navigate(target.pathname + target.search + target.hash, { replace });
  }

  return (
    <Link
      {...rest}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
      onNavigate={handleNavigate}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    />
  );
}
