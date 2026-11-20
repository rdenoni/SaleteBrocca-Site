---
title: "Entradas animadas seguem a hierarquia: título, subtítulo, texto, resto; banner antes das seções; símbolo antes do nome no cabeçalho"
author: Rafael
date: 2026-11-20
branch: feat/home-motion
id: l-1f5eb868
scope: repo
status: active
src: agent
touches:
  - docs/02-BRAND-GUIDELINES.md
  - docs/03-DESIGN-SYSTEM.md
  - src/app/contato/page.tsx
  - src/app/sobre/page.tsx
  - src/components/about/AboutIntro.tsx
  - src/components/about/AboutQuote.tsx
  - src/components/about/ActivityGrid.tsx
  - src/components/about/FormationTimeline.tsx
  - src/components/contact/ContactForm.tsx
  - src/components/layout/Header.tsx
---

## Decided
A cliente (via Rafael) corrigiu a ordem das animações de Sobre e Contato: toda cascata segue a hierarquia da informação.
- Cascata: título (e seus elementos) → subtítulo → texto → o resto (foto, índice, botões). Na Sobre: nome → função → "Sou fonoaudióloga..." → só então a foto e as peças; depois "Da sala de aula..." e o parágrafo.
- Página: banner/topo antes das outras seções.
- Cabeçalho: símbolo → logotipo → links → gota → botões.
- Nenhuma animação da página começa antes de a entrada do cabeçalho estar 80% feita; a logo começa logo que a pílula branca desce (antes esperava a pílula pousar e parecia lenta).
- A foto da Sobre não pode aparecer antes do texto: a moldura se desvela (clip-path) mesmo sendo a provável LCP; a cliente pediu.
- Mensagens/frases de destaque (a frase-conceito "Toda criança...") usam a leitura guiada (scroll), não o título palavra a palavra.
- Cada passo começa por volta da metade do anterior, para a ordem ficar clara sem alongar demais a entrada.

## Watch out
Um `delay: 0` explícito na transição de um filho anula o `delayChildren`/stagger do pai no Motion: os itens de um Stagger entravam todos juntos. revealVariants só põe a chave `delay` quando ela é > 0.
Verificar a ordem com medição (amostrar opacity/transform por rAF desde a navegação), não só com print.

In the code: src/motion/transitions/useEntranceReady.ts (openPageGateAfterHeader, useCurtainReady), src/motion/timeline.ts (heroTimeline, afterBanner, afterTitle, headerTimeline; módulo puro, usável em página de servidor com motionTokens), src/motion/GuidedReading.tsx (portado do salete-motion-lab), src/motion/Reveal.tsx (ownDelay), docs/03-DESIGN-SYSTEM.md §16.
