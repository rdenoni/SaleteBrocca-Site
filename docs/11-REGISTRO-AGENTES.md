# Registro de alterações dos agentes

Diário compartilhado entre Gemini (Antigravity) e Claude. Quem mexe no projeto registra aqui; quem começa uma sessão lê aqui primeiro.
Entradas mais novas no topo. Nunca apague nem reescreva entradas antigas.

## Formato de cada entrada

```
### R-NNNN · AAAA-MM-DD HH:MM · <Agente: Gemini | Claude>
- Branch: <nome> · Commit: <hash curto ou "pendente">
- Versão: <package.json version> · Entrada anterior: R-NNNN
- Tarefa: <o que foi pedido, em uma frase>
- Arquivos alterados: <lista>
- O que mudou e por quê: <2 a 5 linhas>
- Validação: typecheck <ok|falhou> · testes <ok|falhou|não rodou> · prints 1440/768/375 <sim|não>
- Pendências / cuidados para o próximo agente: <lista ou "nenhuma">
```

Numeração R-NNNN sequencial, somando 1 ao maior número já existente.

## Entradas

### R-0003 · 2026-11-24 20:35 · Gemini
- Branch: gemini/ajustes-ui-responsividade · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0002
- Tarefa: rodada completa de ajustes de UI, motion, responsividade mobile, performance (Lenis + cache/fontes), experiência na Área do Aluno e revisão de segurança.
- Arquivos alterados: next.config.ts, package.json, package-lock.json, public/images/hero/avaliacao-fonoaudiologica.jpg, src/app/api/kiwify/webhook/route.ts, src/app/area-do-aluno/conta/page.tsx, src/app/area-do-aluno/cursos/[slug]/aulas/[aula]/page.tsx, src/app/area-do-aluno/cursos/[slug]/aulas/[aula]/player.module.css, src/app/area-do-aluno/cursos/page.tsx, src/app/area-do-aluno/materiais/page.tsx, src/app/area-do-aluno/page.tsx, src/app/avaliacao/avaliacao.module.css, src/app/avaliacao/page.tsx, src/app/cursos/[slug]/curso.module.css, src/app/cursos/[slug]/page.tsx, src/app/cursos/page.tsx, src/app/layout.tsx, src/components/courses/CourseCard.module.css, src/components/courses/ModuleList.module.css, src/components/courses/ModuleList.tsx, src/components/home/AboutPreview.module.css, src/components/home/CourseCard.module.css, src/components/home/EvaluationSection.module.css, src/components/home/EvaluationSection.tsx, src/components/home/FeaturedContent.module.css, src/components/home/FeaturedContent.tsx, src/components/home/FraseConceito.module.css, src/components/home/FraseConceito.tsx, src/components/home/TestimonialSlider.module.css, src/components/home/TestimonialSlider.tsx, src/components/layout/Footer.module.css, src/components/layout/Footer.tsx, src/components/layout/Header.module.css, src/components/layout/Header.tsx, src/components/layout/HeaderNav.tsx, src/components/layout/MobileMenu.module.css, src/components/layout/MobileMenu.tsx, src/components/layout/SocialProfiles.tsx, src/components/student/LessonEntranceOnce.tsx, src/components/student/StudentShell.module.css, src/components/student/StudentShell.tsx, src/components/ui/FaqList.module.css, src/components/ui/FaqList.tsx, src/components/ui/LinkArrow.module.css, src/components/ui/SocialIcon.tsx, src/components/ui/StickyActionBar.module.css, src/components/ui/StickyActionBar.tsx, src/lib/content/courses.ts, src/lib/content/evaluation.ts, src/lib/content/footer.ts, src/lib/content/student.ts, src/motion/DrawRule.tsx, src/motion/EditorialCard.module.css, src/motion/EditorialCard.tsx, src/motion/GuidedReading.tsx, src/motion/HeroSequence.module.css, src/motion/HeroSequence.tsx, src/motion/MotionProvider.tsx, src/motion/Reveal.tsx, src/motion/SmoothScroll.tsx, src/motion/Stagger.tsx, src/motion/TextReveal.tsx, src/motion/gsap/CourseTrail.module.css, src/motion/gsap/CourseTrail.tsx, src/motion/gsap/courseTrailEngine.ts, src/motion/transitions/PageTransitionProvider.tsx, src/motion/useScrollEntrance.ts, src/styles/tokens.css, tests/anchors.spec.ts, tests/area-do-aluno.spec.ts, tests/avaliacao.spec.ts, tests/chrome.spec.ts, tests/home.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: Home (hero rotativo em 4 slides com fade e foto dedicada em alta resolução para Avaliação fonoaudiológica, depoimentos limpos sem play/pause nem aviso de simulação, card Gagueira com fundo navy distinto de PAC, trilha de módulos ampliada com feather largo e micro-reação, entradas por scroll travadas em 1 sem reverter ao subir); Header/Footer/Cursos/Avaliação (logo NAV com reação suave, botão Área do Aluno compacto→expandido, cabeçalho mobile 80px, rodapé simplificado no mobile, cursos sem foto no banner e FAQ/módulos em cascata, /avaliacao com depoimentos rotativos e sem seção "Como funciona"); Área do Aluno (saudação com nome do usuário logado, entrada única persistida em localStorage nas aulas em vídeo mantendo micro-animações, abas suavizadas com MotionPace e botões Anterior/Próximo compactos→expandidos); Performance e Segurança (Lenis no desktop + preservação de scroll ao recarregar, fonte variável Noto Sans, cabeçalhos HTTP de segurança globais em next.config.ts e limite de 256 KB no webhook da Kiwify).
- Validação: typecheck ok · build ok (74/74) · testes Playwright ok (home, avaliacao, anchors, area-do-aluno, cursos, faq, regras-do-site em 1440/768/375) · prints 1440/768/375 sim
- Pendências / cuidados para o próximo agente: (1) Rive não foi instalado por ainda não haver arquivos `.riv` no projeto; (2) ao integrar com `main`, conferir falhas pré-existentes fora do escopo em `tests/loja.spec.ts` e `tests/chrome.spec.ts:413` (outline-width 3px vs 2px); (3) opcionalmente adicionar CSP explícita em produção após validar domínios finais de Mux/Supabase.

### R-0002 · 2026-11-24 16:30 · Gemini
- Branch: gemini/configuracao · Commit: 44e8bce
- Versão: 0.1.0 · Entrada anterior: R-0001
- Tarefa: sessão inicial de leitura das regras, configuração do hub +GEMINI e registro compartilhado.
- Arquivos alterados: docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: leitura obrigatória das regras do projeto e docs do Next.js 16, criação do worktree isolado em `ENTRADA\+GEMINI\site` e inclusão da entrada R-0002 para sincronizar o trabalho entre Gemini e Claude sem alterar o código do site.
- Validação: typecheck ok · testes não rodou · prints 1440/768/375 não
- Pendências / cuidados para o próximo agente: R-0001 e as atualizações de AGENTS.md, CLAUDE.md e GEMINI.md ainda estavam sem commit na working tree de SALETE-BROCCA-DEPLOY; integrar R-0002 considerando essa base.

### R-0001 · 2026-11-24 · Claude
- Branch: main · Commit: pendente
- Versão: ver package.json · Entrada anterior: nenhuma
- Tarefa: preparar o projeto para o Gemini/Antigravity trabalhar junto.
- Arquivos alterados: AGENTS.md, GEMINI.md, CLAUDE.md, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: regras e fluxo de trabalho para qualquer agente, e este registro para o Claude saber o que o Gemini mexeu.
- Validação: não se aplica (somente documentação).
- Pendências / cuidados para o próximo agente: nenhuma.
