# Salete Brocca — site oficial

Site híbrido (institucional, comercial, educacional) de Maria Salete Brocca Denoni, professora e fonoaudióloga clínica. Next.js 16 (App Router) + React 19 + TypeScript + CSS Modules + Lucide.

Leia antes de qualquer tarefa: `docs/01-MASTER-BRIEF.md`, `docs/03-DESIGN-SYSTEM.md`, `docs/06-TECHNICAL-ARCHITECTURE.md`.
Design system publicado: https://claude.ai/artifact/98Na8LzuRWuqfqsYqQjzBn

## Regras que não mudam

- **Referência visual**: o site da cliente (`docs/` e `assets/Referencias` no design system). Preservar header branco arredondado, hero azul fotográfico, avaliação + depoimento navy, blocos de cor, footer navy, assimetria. Nada de template genérico.
- **Marca**: só os tokens de `src/styles/tokens.css` (paleta do Manual TCC). Noto Sans + Martel via `next/font`. Não usar Myriad, Museo ou Roboto. Não redesenhar o logo (`public/brand/logo/`).
- **Contraste**: texto sobre ciano é sempre `--navy`. `--blue` nunca em texto pequeno; use `--blue-strong`.
- **Conteúdo**: nunca inventar depoimentos, preços, carga horária, certificados, números ou dados clínicos. Curso confirmado: *Dificuldades na Aprendizagem*, 6 módulos, 21 aulas (`src/lib/content/courses.ts`). Pendências: `docs/07-IMPLEMENTATION-PLAN.md`.
- **Integrações** (Supabase, vídeo, pagamento, CMS): não instalar sem aprovação.
- Uma `h1` por página; foco visível; campos com rótulo; alvos de 48px; sem rolagem horizontal em 375px.

## Estrutura

- `src/app/` rotas · `src/components/{layout,home,content,courses,ui}/` componentes com `.module.css` ao lado
- `src/lib/content/` dados tipados (trocar por Supabase/CMS mantendo as mesmas funções) · `src/types/content.ts`
- `public/brand/` logos e grafismos oficiais · `public/images/` fotos reais

## Comandos

- `npm run dev` (porta 3000) · `npm run build` · `npm run typecheck`
- `npm test` — Playwright no Edge instalado (desktop 1440, tablet 768, mobile 375). Gera prints em `tests/screenshots/current/`.

## Validação de cada página

Compilar não basta: rodar no navegador, capturar prints nas três larguras, comparar com a referência/wireframe (`docs/05-WIREFRAMES.md`) e corrigir layout, tipografia, cores, espaçamento e responsividade antes de dar por concluída.
