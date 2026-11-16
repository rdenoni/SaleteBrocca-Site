---
title: Publicar na Netlify (msd-fono) e domínio GoDaddy
author: Rafael
date: 2026-11-16
branch: main
id: l-b9a73c28
scope: repo
status: active
src: agent
touches:
  - ".gitignore"
  - package.json
---

O site é publicado na Netlify, projeto `salete-brocca` do time msd-fono (conta da Salete), com saletebrocca.com na GoDaddy: A `@` → 75.2.60.5 e CNAME `www` → salete-brocca.netlify.app. O projeto `saletebrocca` no time "Gabarito Final" é sobra de uma primeira tentativa na conta errada (é a conta ligada ao MCP da Netlify).

O que foi descartado e por quê:
- `netlify deploy --build` no Windows: o build do Next passa, mas o @netlify/plugin-nextjs falha no onPostBuild com "Failed publishing static content". O caminho que funciona é o build na nuvem: enviar um zip do código (só arquivos do git: `git ls-files -co --exclude-standard`) para POST /api/v1/sites/{id}/builds.
- O enviador do MCP da Netlify (`npx @netlify/mcp --proxy-path`) não respeita o .gitignore: zipava .next, graft/, .agents/ e o upload dava 500. Por isso o deploy parte de uma cópia limpa.
- Sem `[[plugins]] package = "@netlify/plugin-nextjs"` no netlify.toml, o deploy por upload (sem Git) publica o .next cru e todas as rotas dão 404. Não fixar a versão do plugin.
- No Git Bash, `tar.exe` é o GNU tar e gera .tar com nome .zip (Netlify recusa "not a valid zip"); usar /c/Windows/System32/tar.exe --format=zip e caminho relativo (o tar lê "C:" como host remoto).
- O time msd-fono cria projetos privados por padrão (todas as rotas 401). Ficou: produção pública, deploy previews privadas (Visitor access → Private + "Previews only").
- O login da GoDaddy recusa o navegador embutido do app ("seu navegador está agindo de forma estranha"); a edição de DNS foi feita pelo Chrome do usuário (Claude in Chrome), onde ele já estava logado.
