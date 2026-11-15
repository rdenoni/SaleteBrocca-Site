# Salete Brocca — website

Site oficial de Maria Salete Brocca Denoni, professora e fonoaudióloga clínica: apresentação profissional, cursos e, no futuro, Área do Aluno.

## Rodar localmente

Requisitos: Node.js 20.9+ (testado no 24) e Microsoft Edge (para os testes).

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Testes

```bash
npm test
```

Playwright no Edge instalado, em 1440px, 768px e 375px: ordem das seções, menu, Área do Aluno, formulário, imagens, rolagem horizontal e prints de página inteira (`tests/screenshots/current/`).

## Estado atual

- **Pronto**: fundação (tokens, fontes, layout, header, footer, menu móvel), Home, Cursos (`/cursos`, `/cursos/dificuldades-na-aprendizagem`, `/cursos/dificuldades-na-aprendizagem/compra` — compra só visual), Sobre (`/sobre`), Contato (`/contato`) Loja (`/loja`, `/loja/dificuldades-na-aprendizagem`, `/loja/checkout` — checkout só visual) e Área do Aluno em demonstração (`/area-do-aluno`, `/login`, `/cursos`, curso, player das 21 aulas, `/materiais`).
- **Conteúdo**: biblioteca (`/conteudo`), categorias (`/conteudo/categoria/[slug]`) e artigo (`/conteudo/[slug]`). Os três títulos vêm do layout de referência e são **exemplos** (docs/07, pendência 8); as categorias são uma proposta. Enquanto `ARTICLES_ARE_EXAMPLES` for `true` (`src/lib/content/articles.ts`), o site avisa "Conteúdo de exemplo", o artigo mostra "Texto em preparação" e a seção fica com `noindex`. Ao receber a pauta real, preencher `body` e `publishedAt` e trocar a flag para `false`.
- **Privacidade e 404**: `/privacidade` descreve só o que o site faz hoje (dados de cada formulário, nada enviado, sem cookies nem análise de acesso) e os direitos da LGPD; finalidade, base legal, prazo, responsável e e-mail ficam "A confirmar" até o texto jurídico (`src/lib/content/privacy.ts`). A página 404 (`src/app/not-found.tsx`) tem atalhos para Início, Cursos, Conteúdo e Contato. O rodapé ganhou o link da política.
- **Todas as páginas do mapa do site existem.** Próximo passo: revisão geral com a cliente e as integrações (fase 7), cada uma com aprovação. Ver `docs/07-IMPLEMENTATION-PLAN.md`.
- Área do Aluno: sem login, vídeo nem banco. O progresso é de exemplo (`DEMO_PROGRESS` em `src/lib/content/student.ts`) e toda tela avisa "Demonstração"; desligar com `IS_DEMO` ao integrar. Materiais e compras aparecem vazios até existirem. "Marcar como concluída" só muda na tela.
- Loja: o único produto é o curso (dados de `courses.ts`). Materiais e Jogos e softwares aparecem "Em preparação" até a cliente confirmar os produtos; cadastrar em `STANDALONE_PRODUCTS` (`src/lib/content/shop.ts`). O checkout da Loja e a inscrição do curso usam o mesmo componente (`CheckoutView`).
- Os formulários (avaliação e contato) validam os campos, mas o envio não está conectado.
- Dados "A confirmar" (preencher em `src/lib/content/`): preço, carga horária, certificado e acesso do curso (`courses.ts`); CRFa, ano da especialização e cidade do consultório (`profile.ts`); WhatsApp, e-mail, local e horários (`contact.ts`, que só vira link quando `href` é preenchido); perfis sociais (`site.ts`).

## Documentação

`docs/01` a `docs/07`: brief, marca, design system, mapa do site, wireframes, arquitetura e plano. Regras para o Claude Code: `CLAUDE.md`.
