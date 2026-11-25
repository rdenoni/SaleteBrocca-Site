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

### R-0014 · 2026-11-25 14:51 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0013
- Tarefa: espelhar pedidos de avaliação e mensagens de contato recebidos em `POST /api/leads` na caixa de entrada do Painel Admin (`/admin/emails`).
- Arquivos alterados: src/app/api/leads/route.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: além de gravar o lead em `public.leads` (`/admin/crm`), o endpoint `POST /api/leads` agora insere automaticamente uma mensagem não lida (`direction: "inbound"`, `status: "unread"`) em `public.admin_emails` para `source` `"avaliacao"` ou `"contato"`, com nome, telefone/WhatsApp, e-mail, origem e detalhes, e dispara alerta via Resend caso `RESEND_API_KEY` esteja configurada.
- Validação: typecheck ok · build ok · testes Playwright (`avaliacao` + `sobre-contato` 18/18 em 1440/768/375) ok · prints 1440/768/375 não
- Pendências / cuidados para o próximo agente: consultar `docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md` antes de campanhas pagas.

### R-0013 · 2026-11-25 14:34 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0012
- Tarefa: conectar os formulários "Pedir avaliação" (Home e `/avaliacao`) e "Contato" (`/contato`) ao `POST /api/leads` (CRM Supabase) e corrigir o flicker no hover do botão expansível "Abrir chamado" em `/area-do-aluno/suporte`.
- Arquivos alterados: src/lib/content/home.ts, src/components/home/EvaluationForm.tsx, src/components/contact/ContactForm.tsx, src/app/area-do-aluno/suporte/suporte.module.css, tests/{avaliacao,home,sobre-contato}.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: (1) `EvaluationForm` e `ContactForm` deixaram o modo provisório e passaram a enviar via `POST /api/leads` com honeypot anti-bot (`website`), `<Spinner size={16} />` no botão durante o envio, reset do formulário e confirmação real (ou mensagem de erro), gravando diretamente na tabela `leads` do Supabase (`/admin/crm`); (2) corrigido o loop de flicker no hover do botão expansível "Abrir chamado" em `suporte.module.css` alterando `.formFooter` para `flex-wrap: nowrap` no desktop com espaço reservado (`max-width: calc(100% - 204px)`) em `.slaNote` e `flex: none` em `.expandBtn` (empilhando apenas em `<= 520px`).
- Validação: typecheck ok · build ok · testes Playwright (`avaliacao` + `home` + `sobre-contato` 24/24, `area-do-aluno` Suporte 3/3 em 1440/768/375) ok · prints 1440/768/375 não
- Pendências / cuidados para o próximo agente: consultar `docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md` antes de campanhas pagas.

### R-0012 · 2026-11-25 14:15 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0011
- Tarefa: adicionar Centro de Custos & Assinaturas no Painel Admin (`/admin/custos`), conexão direta WhatsApp App + fallback WhatsApp Web em todos os ícones/botões, aumentar em 20% o intervalo da cascata dos cards de artigos na Home e adicionar curtidas persistentes em artigos e podcasts.
- Arquivos alterados: src/lib/admin/{costs.ts,nav.ts,cms.ts}, src/components/admin/AdminShell.tsx, src/app/admin/(panel)/custos/{page.tsx,actions.ts,CostCenterClient.tsx,custos.module.css}, src/lib/whatsapp.ts, src/components/ui/WhatsAppLink.tsx, src/components/layout/SocialButton.tsx, src/lib/content/{contact.ts,site.ts}, src/app/contato/{page.tsx,contato.module.css}, src/components/home/FeaturedContent.tsx, src/app/api/content/likes/route.ts, src/components/content/{ContentLikeButton.tsx,ContentLikeButton.module.css}, src/app/conteudo/[slug]/page.tsx, src/app/conteudo/podcast/[slug]/page.tsx, tests/{admin,chrome,conteudo,sobre-contato}.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: (1) criado `/admin/custos` (Centro de Custos & Assinaturas) com verificação automática em tempo real dos serviços ativos (Netlify, Supabase, GoDaddy, Mux, Resend, Kiwify e Hotmart), KPIs mensais/anuais, conversão USD→BRL editável, barras por categoria e CRUD persistido em `site_settings` (`cost_center_config`) com auditoria; (2) criada conexão direta com o aplicativo do WhatsApp (`whatsapp://send`) com fallback automático para WhatsApp Web (`web.whatsapp.com` / `api.whatsapp.com`) no ícone do rodapé e no ícone/CTA de `/contato` (integrado a `/admin/links`); (3) aumentado `ROW_STEP` de `0.06` para `0.072` (+20%) na cascata dos cards de artigos na Home; (4) adicionadas curtidas em artigos e episódios de podcast (`/api/content/likes` + `ContentLikeButton`) com persistência em `site_settings` (`content_likes`), rate limit, atualização otimista e memória local do visitante.
- Validação: typecheck ok · build ok · testes Playwright (`admin` Centro de Custos 3/3, `chrome` + `sobre-contato` 59/59, `home` 75/75, `conteudo` curtidas 3/3 em 1440/768/375) ok · prints 1440/768/375 sim
- Pendências / cuidados para o próximo agente: consultar `docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md` antes de campanhas pagas; confirmar se o número padrão do WhatsApp (`+55 (48) 9973-4469`) será mantido ou atualizado em `/admin/links`.

### R-0011 · 2026-11-25 12:46 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0010
- Tarefa: ajustar espaçamento e motion da página de Suporte, adicionar botão expansível "Abrir chamado" à direita, animação de carregamento dentro dos botões "Entrar", barra mobile 20% maior com logo na escala dos botões, menu mobile em caixa alta/entrelinhas menor e expansão mais lenta nas Dúvidas frequentes.
- Arquivos alterados: src/styles/tokens.css, src/components/layout/{Header.module.css,MobileMenu.module.css,PageBanner.module.css}, src/components/ui/FaqList.module.css, src/app/area-do-aluno/suporte/{page.tsx,StudentSupportClient.tsx,suporte.module.css}, src/components/student/{PasswordLoginForm.tsx,LoginForm.module.css}, src/app/admin/login/{LoginClient.tsx,login.module.css}, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: (1) corrigido token inexistente `--space-5` em `suporte.module.css` para tokens oficiais (`--space-8`/`--space-6`/`--space-4`/`--space-2`); (2) aplicada a partitura oficial de motion da Área do Aluno (`STUDENT_PACE`, `Stagger`/`StaggerItem`, `Reveal`, `AnimatePresence` nas conversas e `spring.press`) em `/area-do-aluno/suporte`, com botão expansível "Abrir chamado" (`Compacto → Completo`) à direita do formulário; (3) adicionada animação interna de carregamento (`Spinner` + varredura luminosa) nos botões "Entrar" da Área do Aluno e do Painel Admin; (4) mobile ajustado com barra de `96px` (+20%), `.logoImage` em `60px` (símbolo equivalente aos botões de `48px`), menu mobile em caixa alta (`22px/26px`) e abertura suave de `680ms` no acordeão das Dúvidas frequentes.
- Validação: typecheck ok · testes Playwright (`area-do-aluno` Suporte/login 9/9, `chrome` + `faq` 35/35 em 1440/768/375 e 340px) ok · prints 1440/768/375 sim
- Pendências / cuidados para o próximo agente: consultar `docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md` antes de campanhas pagas.

### R-0010 · 2026-11-25 03:04 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0009
- Tarefa: aplicar blindagens jurídicas completas (CRFa/RJ 8589, Termos de Uso + Política de Reembolso CDC Art. 49, Privacidade atualizada, disclaimer clínico e lembrete de lançamento), 4 técnicas modernas de carregamento (Skeleton Shimmer, LQIP Blur-up, Spinners, Optimistic UI), redesign de UI/UX da área Suporte, blindagem de segurança (Rate Limit, CSP, anti-enumeração, robots.ts) e refatoração de código morto.
- Arquivos alterados: next.config.ts, src/app/robots.ts, src/lib/content/{profile.ts,privacy.ts,courses.ts,evaluation.ts,material-download.ts}, src/components/layout/{Footer.tsx,PageBanner.tsx}, src/app/avaliacao/page.tsx, src/app/termos-de-uso/{page.tsx,termos-de-uso.module.css}, src/app/privacidade/page.tsx, src/components/shop/{CheckoutView.tsx,CheckoutView.module.css,ProductGallery.tsx,ProductMedia.tsx}, src/app/conteudo/[slug]/{page.tsx,artigo.module.css}, src/app/conteudo/podcast/[slug]/page.tsx, src/app/admin/(panel)/lgpd/page.tsx, src/lib/images/lqip.ts, src/components/ui/{Skeleton.tsx,Skeleton.module.css,Spinner.tsx,Spinner.module.css}, src/app/{admin/(panel),area-do-aluno,conteudo,loja}/loading.tsx, src/motion/{EditorialCard.tsx,HeroSequence.tsx,useScrollEntrance.ts,timeline.ts,icons/index.ts}, src/app/admin/login/{LoginClient.tsx,actions.ts}, src/components/student/CompleteLessonButton.tsx, src/app/area-do-aluno/suporte/{StudentSupportClient.tsx,suporte.module.css,actions.ts}, src/lib/security/rate-limit.ts, src/app/api/{leads,hotmart/webhook,kiwify/webhook,session/heartbeat}/route.ts, src/app/cursos/[slug]/page.tsx, src/lib/kiwify/{payload.ts,handler.ts}, src/lib/admin/{backup.ts,cms.ts,secrets.ts}, src/lib/auth-paths.ts, tests/{termos,privacidade-404,sobre-contato}.spec.ts, docs/{11-REGISTRO-AGENTES.md,12-PENDENCIAS-JURIDICAS-LANCAMENTO.md}; removidos: src/motion/icons/{ArrowNudge,ChevronToggle}.tsx, src/motion/{gsap,transitions}/index.ts
- O que mudou e por quê: (1) Jurídico: incluído `CRFa/RJ 8589` no perfil, rodapé, avaliação, artigos, privacidade e termos; publicados Termos de Uso + Política de Reembolso de 7 dias (Art. 49 do CDC) e garantia legal em `/termos-de-uso` e no Checkout; atualizada `/privacidade` com Suporte, Sessões, Mux, Hotmart e Resend; adicionado disclaimer clínico em artigos/podcasts e checklist de pendências cadastrais em `docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md` e `/admin/lgpd`; (2) Carregamento e UX: criados `Skeleton` shimmer (`loading.tsx` em Admin, Área do Aluno, Conteúdo e Loja), 26 placeholders reais LQIP em `src/lib/images/lqip.ts`, `Spinner` e React 19 `useOptimistic` no Suporte; (3) Suporte UI/UX: redesign com KPIs, chips de categoria, busca, filtros com contador e conversa em estilo Help Desk; (4) Segurança: Rate Limit + `blocked_ips` em `/api/leads` (com limite 16 KB + honeypot), `/admin/login` (com resposta genérica anti-enumeração), `/api/session/heartbeat`, webhooks e Suporte (com deduplicação de duplo clique), além de `Content-Security-Policy` em `next.config.ts` e `disallow` em `robots.ts`; (5) Refatoração: removidos 4 arquivos mortos, imports/variáveis não lidas e exports desnecessários.
- Validação: typecheck strict (`--noUnusedLocals --noUnusedParameters`) ok (0 erros) · build ok (81/81) · testes Playwright (termos, privacidade-404, sobre-contato, conteudo, loja-galeria, area-do-aluno Suporte em 1440/768/375) ok · prints 1440/768/375 sim
- Pendências / cuidados para o próximo agente: consultar `docs/12-PENDENCIAS-JURIDICAS-LANCAMENTO.md` (CPF/CNPJ, endereço comercial, DPO, prazo de acesso do curso e despublicar os 3 depoimentos simulados antes de anúncios pagos).

### R-0009 · 2026-11-25 02:02 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0008
- Tarefa: corrigir o botão hambúrguer da barra NAV vazando da base branca no iPhone, suavizar a animação de entrada dos artigos na Home, gerar e aplicar os 4 vídeos curtos em looping na Hero da Home e usar a logo horizontal monocromática no rodapé.
- Arquivos alterados: src/components/layout/Header.module.css, src/components/layout/MobileMenu.module.css, src/components/layout/Footer.tsx, src/components/layout/Footer.module.css, src/motion/useScrollEntrance.ts, src/motion/EditorialCard.tsx, src/components/home/FeaturedContent.tsx, src/motion/HeroSequence.tsx, src/lib/admin/cms.ts, public/videos/hero/{crianca-escrevendo.mp4,leitura-fluencia.mp4,avaliacao-fonoaudiologica.mp4,familia-e-escola.mp4}, tests/chrome.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: (1) corrigido `min-width: 52px` herdado em `.actions .studentButton` no mobile para `48x48px` reais e ajustados `padding`, `gap` e altura da logo em `@media (max-width: 767px)` e `@media (max-width: 359px)` para o botão hambúrguer permanecer sempre dentro da pílula branca mesmo em iPhones com Zoom de Tela; (2) adicionada mola super-amortecida (`useSpring`) e ampliada a janela de rolagem (`90%` -> `26%`) em `useEditorialScrollEntrance` para entrada fluida e contínua dos 3 artigos da Home; (3) gerados os 4 vídeos em looping (`public/videos/hero/*.mp4`, `6s`, `720p`, `30fps`, `H.264 +faststart`) a partir das fotos dos banners e aplicados em `HeroSequence.tsx` e `cms.ts` com fallback `poster` para `prefers-reduced-motion`; (4) atualizada a logo do rodapé para `/brand/logo/logo-lateral-branco.png` com filtro monocromático branco sobre `--navy` e contorno de foco `2px` nos links das colunas.
- Validação: typecheck ok · testes Playwright tests/chrome.spec.ts, tests/regras-do-site.spec.ts e tests/home.spec.ts ok em 1440/768/375 (e 340px mobile) · prints 1440/768/375 sim
- Pendências / cuidados para o próximo agente: nenhuma.

### R-0008 · 2026-11-25 00:53 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0007
- Tarefa: adicionar área de Suporte do usuário (/area-do-aluno/suporte) integrada ao painel de tickets do admin.
- Arquivos alterados: src/components/student/StudentShell.tsx, src/app/area-do-aluno/suporte/{page.tsx,StudentSupportClient.tsx,suporte.module.css,actions.ts}, tests/area-do-aluno.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: adicionada aba "Suporte" na sub-navegação da Área do Aluno e criada a página `/area-do-aluno/suporte` permitindo que usuários autenticados abram chamados por categoria, filtrem por status, acompanhem as respostas da equipe e enviem novas mensagens diretamente nas tabelas `support_tickets` e `support_messages` com isolamento por RLS e sincronização em tempo real com `/admin/suporte`.
- Validação: typecheck ok · build ok (81/81) · testes Playwright tests/area-do-aluno.spec.ts -g "Suporte" ok (3/3 em 1440/768/375) · prints 1440/768/375 não
- Pendências / cuidados para o próximo agente: nenhuma.

### R-0007 · 2026-11-25 00:18 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0006
- Tarefa: aplicar migrations do painel admin no Supabase, ativar conta admin e configurar variáveis autônomas na Netlify com redeploy de produção.
- Arquivos alterados: docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: aplicadas as 5 migrations SQL no Supabase (`dhshqcrcusuuiqlvikha`, 22/22 tabelas com RLS ativo), configurado `rdenoni@gmail.com` como `admin` em `public.user_roles`, criadas as variáveis `BACKUP_ENCRYPTION_KEY`, `ADMIN_EMAIL_INBOUND_TOKEN`, `ADMIN_FROM_EMAIL` e `NEXT_PUBLIC_SITE_URL` na Netlify e disparado novo deploy em produção para ativá-las nas Functions.
- Validação: typecheck ok · build ok (sem alteração de código) · verificação SQL RLS 22/22 ok
- Pendências / cuidados para o próximo agente: preencher chaves externas opcionais (Hotmart, Mux API, GitHub privado, Meta Pixel/CAPI, Resend) via `/admin/integracoes` ou Netlify conforme ativação de cada serviço.

### R-0006 · 2026-11-25 00:09 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0005
- Tarefa: redesign completo de UI/UX do Painel Admin sem barra NAV/Footer públicos, criação do login dedicado /admin/login + botão exclusivo na Home para admins e tela /admin/integracoes para editar variáveis pendentes pelo painel.
- Arquivos alterados: src/components/layout/PublicChrome.tsx, src/app/layout.tsx, src/components/admin/{AdminShell.tsx,AdminShell.module.css,AdminHomeShortcut.tsx,AdminHomeShortcut.module.css}, src/app/page.tsx, src/app/admin/layout.tsx, src/app/admin/(panel)/**, src/app/admin/login/{page.tsx,LoginClient.tsx,login.module.css,actions.ts}, src/app/admin/(panel)/integracoes/{page.tsx,IntegracoesClient.tsx,actions.ts}, src/lib/admin/{auth.ts,nav.ts,secrets.ts,finance.ts,backup-crypto.ts,backup.ts}, src/lib/mux/admin-metrics.ts, src/lib/supabase/proxy.ts, src/app/api/{hotmart/webhook,admin/emails/inbound}/route.ts, tests/admin.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: PublicChrome remove Header/Footer/CookieConsent em /admin/*; AdminShell redesenhado como app SaaS em tela cheia com sidebar navy, logo branco oficial, busca de módulos, topbar com breadcrumb e botão Sair; /admin/login criado em tela isolada exigindo role='admin' em user_roles; AdminHomeShortcut renderizado na Home apenas no servidor quando isCurrentUserAdmin() é true; tela /admin/integracoes adicionada com armazenamento criptografado (AES-256-GCM) em site_settings.integration_secrets e botão de geração de chave para Hotmart, Mux, Backup, GitHub, Meta Pixel/CAPI e Resend.
- Validação: typecheck ok · build ok (80/80) · testes Playwright tests/admin.spec.ts ok em 1440/768/375 · prints admin-v2 1440/375 sim
- Pendências / cuidados para o próximo agente: migrations das Etapas 0 a 10 já aplicadas no Supabase de produção (`dhshqcrcusuuiqlvikha`) com `rdenoni@gmail.com` como admin e 22/22 tabelas com RLS ativo.

### R-0005 · 2026-11-24 23:23 · Gemini
- Branch: gemini/admin-panel · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0004
- Tarefa: criação completa do Painel Administrativo (/admin) em 10 etapas independentes (Fundação/Auth/Auditoria, Hero/Depoimentos, Links, Artigos/Podcasts, Usuários/IPs/Backup individual, Cadastro/Capacidade, Financeiro Kiwify+Hotmart, CRM, Suporte, Sessões, Stream Mux, Backup AES-256-GCM+GitHub, Marketing/CAPI, LGPD e ADM E-mails).
- Arquivos alterados: supabase/migrations/20261124120000_admin_foundation.sql, supabase/migrations/20261124130000_admin_cms_visual.sql, supabase/migrations/20261124140000_admin_etapas_2_3_4.sql, supabase/migrations/20261124150000_admin_etapas_5_6_7_8.sql, supabase/migrations/20261124160000_admin_etapas_9_10.sql, src/types/database.ts, .env.example, src/lib/supabase/proxy.ts, src/lib/admin/* (auth, nav, cms, content-cms, users, finance, crm, support, sessions, backup-crypto, backup), src/lib/mux/admin-metrics.ts, src/components/admin/AdminShell.{tsx,module.css}, src/app/admin/** (15 rotas + actions + clients), src/app/api/{admin/users/[id]/backup,admin/backup/export,admin/emails/inbound,hotmart/webhook,leads,session/heartbeat}/route.ts, src/motion/HeroSequence.tsx, src/components/home/HomeHero.tsx, src/app/page.tsx, src/app/layout.tsx, src/components/layout/{Footer,SocialProfiles}.tsx, tests/admin.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: implementação integral do Painel Administrativo modular sob /admin com proteção de rota no proxy + requireAdmin() via user_roles (SECURITY DEFINER), auditoria imutável em admin_audit_logs, fallback seguro para o site público e suporte a modo demonstração sem credenciais locais. Inclui CMS visual (Hero foto/vídeo, Depoimentos, Links, Artigos e Podcasts), gestão de usuários/IPs/capacidade Supabase, Financeiro unificado Kiwify+Hotmart, CRM, Suporte, Sessões com geo-header Netlify, monitoramento Mux, Backup AES-256-GCM + GitHub privado, diagnóstico Meta Pixel/CAPI, Relatório LGPD (8 pilares) e caixa de e-mails ADM (Resend).
- Validação: typecheck ok · build ok (80/80) · testes Playwright tests/admin.spec.ts ok em 1440/768/375 · prints 1440/375 sim
- Pendências / cuidados para o próximo agente: aplicar as 5 migrations SQL (`20261124120000` a `20261124160000`) no projeto Supabase de produção, cadastrar o usuário administrador em `public.user_roles` (`role = 'admin'`) e preencher gradualmente as variáveis opcionais listadas em `.env.example` na Netlify conforme ativar cada integração (Hotmart, Mux API, Backup AES/GitHub, Meta Pixel/CAPI, Resend).

### R-0004 · 2026-11-24 22:17 · Gemini
- Branch: gemini/ajustes-ui-responsividade · Commit: pendente
- Versão: 0.1.0 · Entrada anterior: R-0003
- Tarefa: redesign da Biblioteca + botões voltar + iconografia completa (25 ícones personalizados animados do Manual + Compacto→Completo), fotos reais e galeria na Loja, upload dos 4 podcasts reais e ajuste de uniformidade/overshoot na seleção do menu.
- Arquivos alterados: public/biblioteca/index.html, public/biblioteca/manual-da-marca.html, public/biblioteca/design-system.html, public/biblioteca/componentes.html, public/biblioteca/icones.html, public/images/products/* (10 imagens), public/audio/podcasts/* (4 arquivos .m4a), src/types/content.ts, src/lib/content/shop.ts, src/lib/content/podcasts.ts, src/components/shop/ProductMedia.tsx, src/components/shop/ProductCard.module.css, src/components/shop/ProductGallery.tsx, src/components/shop/ProductGallery.module.css, src/app/loja/loja.module.css, src/app/loja/[slug]/page.tsx, src/app/loja/[slug]/produto.module.css, src/components/content/PodcastEpisodeCard.tsx, src/components/content/PodcastEpisodeCard.module.css, src/components/content/PodcastEpisodeGrid.module.css, src/app/conteudo/podcast/[slug]/page.tsx, src/components/layout/Header.module.css, src/components/layout/HeaderNav.tsx, tests/biblioteca.spec.ts, tests/loja-galeria.spec.ts, tests/conteudo.spec.ts, tests/chrome.spec.ts, docs/11-REGISTRO-AGENTES.md
- O que mudou e por quê: Biblioteca (/biblioteca) redesenhada com tokens da marca, paleta clicável e botão "← Voltar para a Biblioteca" em todas as subpáginas; icones.html sincronizado com todos os ícones Lucide em uso + 25 ícones duotone refinados do Manual da Marca (grade 32×32) com micro-animações individuais e showcase interativo "Compacto → Completo" (também em componentes.html); Loja atualizada com fotos reais de produtos, cores naturais e galeria multi-ângulo em /loja/[slug]; Podcasts atualizados com os 4 áudios reais (.m4a), cards com selo "Áudio disponível" e grade 2×2; Menu desktop ajustado com largura uniforme nos 6 itens e margem de 48px em .gotaLayer para evitar corte durante o overshoot da mola nas extremidades.
- Validação: typecheck ok · build ok (75/75) · testes Playwright ok (biblioteca 9/9, loja-galeria 100%, conteudo podcast 21/21, chrome gota 13/13 em 1440/768/375) · prints 1440/768/375 sim
- Pendências / cuidados para o próximo agente: vídeos curtos em looping para os 4 banners da Hero da Home ficaram aguardando os arquivos .mp4 gerados pelo usuário no Google Flow (para evitar custo extra na Gemini API).

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
