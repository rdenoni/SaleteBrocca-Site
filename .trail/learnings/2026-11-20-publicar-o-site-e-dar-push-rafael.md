---
title: "Publicar o site é dar push no main: a Netlify faz o build sozinha a partir do GitHub"
author: Rafael
date: 2026-11-20
branch: feat/home-motion
id: l-acd242a3
scope: repo
status: active
src: agent
touches:
  - docs/02-BRAND-GUIDELINES.md
  - src/app/contato/contato.module.css
  - src/app/contato/page.tsx
  - src/app/sobre/page.tsx
  - src/app/sobre/sobre.module.css
  - src/components/about/ActivityGrid.module.css
  - src/components/about/ActivityGrid.tsx
  - src/components/about/FormationTimeline.module.css
  - src/components/about/FormationTimeline.tsx
  - src/components/contact/ContactForm.module.css
---

## Decided
O projeto `salete-brocca` (time msd-fono) está ligado ao repositório GitHub rdenoni/SaleteBrocca-Site, branch `main`, com builds ativos. Publicar = commit + push no `main`; a Netlify builda no Linux dela e põe em produção (saletebrocca.com). Outros branches só geram deploy preview.

## Tried and ruled out
- O envio de zip para POST /api/v1/sites/{id}/builds (aprendizado de 16/11) ficou desnecessário depois da ligação com o GitHub. Só use se a ligação cair.
- Build local no Windows continua falhando no plugin da Netlify: não publicar com `netlify deploy --build` daqui.

## Watch out
- O checkout SALETE-BROCCA-WEBSITE recebe trabalho de várias sessões: commitar só os próprios arquivos, nunca `git add -A`.
- Antes do push, conferir que HEAD contém origin/main (fetch) para não sobrescrever nada.

In the code: netlify.toml (build `npm run build`, publish `.next`, plugin @netlify/plugin-nextjs). Conferir com `npx netlify-cli api getSite --data '{"site_id":"ebc174d9-38c7-4c80-b3de-ca34e88b5484"}'` (build_settings.repo_branch = main) e `listSiteDeploys`.
