# 06 - Arquitetura Técnica

Arquitetura decidida para a implementação. Plano de fases em [07](07-IMPLEMENTATION-PLAN.md).

## 1. Stack

| Item | Versão / detalhe |
|---|---|
| Next.js | 16.4.6 (App Router) |
| React | 19.3.1 |
| TypeScript | 5.9 |
| lucide-react | 1.66.0 |
| @playwright/test | 1.64.1 (executa no Microsoft Edge instalado via `channel: 'msedge'`; sem download de navegador) |
| Runtime | Node 24 |
| Controle de versão | Git |

| @supabase/supabase-js | 2.119.0 (aprovado, ver seções 9 e 12) |
| @supabase/ssr | 0.12.7 (sessão em cookies no Next) |
| server-only | 0.0.1 (impede importar código de servidor no navegador) |

Sem Tailwind. Serviços externos: Supabase (autenticação e banco, plano gratuito no início) e Kiwify (pagamento).

## 2. Estilização

| Arquivo | Função |
|---|---|
| `src/styles/tokens.css` | Custom properties geradas dos tokens do design system, com nomes idênticos: `--navy`, `--blue`, `--blue-strong`, `--cyan`, `--light-blue`, `--light-gray`, `--charcoal`, `--white`, `--text-muted`, `--on-navy-muted`, `--navy-raised`, `--photo-tint`, `--error`, `--success`, `--space-*`, `--radius-*`, `--container`, `--header-height`, `--shadow-*`. |
| `src/styles/globals.css` | Reset, tipografia base, foco, utilitários. |
| `Componente.module.css` | CSS Module por componente, ao lado do componente. |

Valores de cada token em [03](03-DESIGN-SYSTEM.md). A referência visual dos componentes é `bundle.css` (`.sb-*`).

### Fontes (`next/font/google`)

| Fonte | Pesos | Variável |
|---|---|---|
| `Noto_Sans` | 400-800, itálico 400 | `--font-sans` |
| `Martel` | 300, 400, 700 | `--font-serif` |

### Breakpoints e layout

- Tablet: 768px; desktop: 1100px.
- Container: 1200px.
- Header: 128px no desktop, 72px no tablet/mobile.

CSS custom properties não funcionam dentro de `@media`; os breakpoints são escritos como literais (`768px`, `1100px`) nos módulos CSS.

## 3. Estrutura de pastas

```
SALETE-BROCCA-WEBSITE/
├── CLAUDE.md
├── docs/
├── public/
│   ├── brand/
│   │   ├── logo/
│   │   └── patterns/
│   ├── images/
│   │   ├── hero/
│   │   ├── about/
│   │   ├── courses/
│   │   ├── testimonials/
│   │   └── articles/
│   └── icons/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── courses/
│   │   ├── content/
│   │   └── ui/
│   ├── styles/
│   ├── lib/
│   └── types/
├── tests/
├── package.json
└── README.md
```

## 4. Componentes

| Grupo | Componente | Notas |
|---|---|---|
| layout | `Header` | Inclui `MobileMenu` (client component). Área do Aluno sempre visível. |
| layout | `Footer` | Quatro colunas + sociais + faixa inferior. |
| ui | `Button` | Variantes `primary \| accent \| outline \| ghost`; tamanhos `md \| sm`; renderiza `<a>` via `next/link` ou `<button>`. |
| ui | `LinkArrow` | "Acesse >". |
| ui | `Container` | Largura máxima e margens laterais. |
| ui | `Field` | Label, input/textarea e erro. |
| ui | `SectionRule` | Fio ciano 120x6. |
| home | `Hero` | `priority` na imagem. |
| home | `EvaluationSection` | Contém `EvaluationForm` (client) e `Testimonial`. |
| home | `FeaturedContent` | Três blocos de cor. |
| home | `AboutPreview` | Retrato com blocos deslocados + texto. |
| home | `FeaturedCourses` | Usa `CourseCard`. |
| home | `FinalCta` | Light-blue com grafismo. |
| content | `ContentCard` | Card de conteúdo clicável. |
| courses | `CourseCard` | Sem preço até confirmação. |
| courses | `ModuleList` | Acordeão com `<details>`. |

Server Components por padrão; `"use client"` apenas em `MobileMenu` e `EvaluationForm`.

## 5. Dados e repositório

Conteúdo tipado em `src/lib/content/`:

| Arquivo | Conteúdo |
|---|---|
| `site.ts` | Navegação, footer, contatos. |
| `courses.ts` | Curso real com módulos e aulas (6 módulos, 21 aulas). |
| `articles.ts` | Artigos em destaque. |
| `testimonials.ts` | Depoimentos (apenas os autorizados). |

Tipos em `src/types/`: `Course`, `Module`, `Lesson`, `Article`, `Testimonial`, `NavItem`.

Padrão repositório: as páginas só chamam funções como `getCourses()`, `getCourse(slug)`, `getFeaturedArticles()`. Hoje elas leem os módulos locais; depois são trocadas por Supabase/CMS sem alterar os componentes.

## 6. Imagens

`next/image` com arquivos locais em `public/images/`. O hero usa `priority`. Fotos decorativas com `alt=""`; as demais descrevem a cena. Fotos de terceiros só com licença confirmada.

## 7. Acessibilidade

- Landmarks (`header`, `nav`, `main`, `footer`), um `h1` por página, skip link.
- Anéis de foco visíveis: `blue-strong` sobre fundo claro, `cyan` sobre escuro.
- `aria-current="page"` na navegação.
- Campos com label; `aria-invalid` e `aria-describedby` nos erros.
- `prefers-reduced-motion` respeitado.
- Alvos de toque de 48px.
- Contraste >= 4.5:1; texto navy sobre cyan, nunca branco.

## 8. SEO

Metadata API por rota, Open Graph, `lang="pt-BR"`, hierarquia de títulos semântica. `sitemap.ts` e `robots.ts` virão na fase de lançamento. Rotas da Área do Aluno com `noindex`.

## 9. Integrações

| Necessidade | Opção | Situação |
|---|---|---|
| Autenticação, matrículas, progresso | Supabase | **Instalado**, com aprovação do cliente (pedido: "Criar e conectar o banco de dados no supabase para a area de alunos login e senha"). Ver seção 12. |
| Pagamento | Kiwify | Vendas do curso e da loja; o webhook cria a matrícula (seção 12.4). |
| Vídeo | Mux ou Cloudflare Stream | Futuro: playback assinado, retomada da posição. |
| Artigos | CMS (a definir) | Conteúdo editável. |
| DNS | Cloudflare | Domínio. |

Cada integração nova exige aprovação prévia (custo e escolha de fornecedor).

## 10. Plano de testes

Playwright, executando no Edge (`channel: 'msedge'`).

| Teste | Tipo |
|---|---|
| Home renderiza as 10 seções na ordem | E2E |
| Links do header e Área do Aluno visíveis em 1440, 768 e 390 | E2E |
| Menu mobile abre/fecha por teclado e com Escape | E2E |
| Formulário de avaliação valida campos obrigatórios e telefone | E2E |
| Sem rolagem horizontal em 390 | E2E |
| Baselines de captura em 1440 e 390 | Visual |
| Checagem manual de títulos e rótulos (estilo axe) | Manual |

Lista manual: um `h1`, ordem de títulos sem saltos, todo campo com label, imagens com `alt` adequado, foco visível em todos os controles, contraste dos pares de cor.

## 11. Fora do escopo agora

Vídeo, CMS, analytics. (Autenticação, banco e pagamento: seção 12.)

## 12. Área do Aluno: Supabase Auth

Login por e-mail e senha. Pacotes: `@supabase/ssr` e `@supabase/supabase-js`. Banco: `supabase/migrations/20261117120000_area_do_aluno.sql` (`enrollments`, `kiwify_events`, `lesson_progress`, com RLS).

**Projeto Supabase (criado em 17/11/2026):** `salete-brocca`, ref `dhshqcrcusuuiqlvikha`, organização "Salete Brocca Denoni", região `sa-east-1` (São Paulo), **plano gratuito** (pausa depois de ~7 dias sem acesso e não tem backup automático: subir para o plano pago antes do lançamento). URL: `https://dhshqcrcusuuiqlvikha.supabase.co`. A migração acima já está aplicada (`area_do_aluno`) e as regras foram testadas no próprio banco: aluno só vê a própria matrícula, só marca aula de curso com matrícula ativa, matrícula reembolsada bloqueia o progresso, `anon` e `authenticated` não leem `kiwify_events` nem alteram matrícula, e a matrícula só se liga a conta confirmada ou convidada. O alerta "RLS sem política" em `kiwify_events` é intencional (só o servidor usa). Os tipos gerados pelo Supabase têm as mesmas colunas de `src/types/database.ts` (o arquivo à mão é mais estrito nos status).

### 12.1 Variáveis de ambiente

Lista em `.env.example` (só os nomes). Em desenvolvimento: `.env.local`. Em produção: painel da Netlify.

| Variável | Visibilidade | Uso |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | pública, opcional | Base dos links absolutos (e-mail de recuperação). Sem ela, `src/lib/site-url.ts` usa a `URL` da Netlify. **Em desenvolvimento local defina `http://localhost:3000`**, senão o link do e-mail aponta para o site publicado. |
| `NEXT_PUBLIC_SUPABASE_URL` | pública | URL do projeto. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | pública | Chave publicável (`sb_publishable_...`); em projeto antigo, a chave `anon` na mesma variável. |
| `SUPABASE_SERVICE_ROLE_KEY` | **secreta, só servidor** | Usada só em `src/lib/supabase/admin.ts` (webhook da Kiwify). Ignora o RLS. Nunca com prefixo `NEXT_PUBLIC`. |
| `KIWIFY_WEBHOOK_TOKEN` | **secreta** | Confere a origem do webhook. |

As variáveis `NEXT_PUBLIC_*` são gravadas no build: **precisam existir na Netlify antes do deploy**; trocar depois exige novo build.

### 12.2 Dois modos

`isSupabaseConfigured()` (`src/lib/supabase/config.ts`) decide, pelas duas variáveis públicas.

| | Sem Supabase (deploy anterior, testes) | Com Supabase |
|---|---|---|
| Área do Aluno | Demonstração: aviso "Demonstração", progresso de exemplo (`DEMO_PROGRESS`), login que só avisa "O login ainda não está ativo." | Login real. Nenhum dado de exemplo. Botão "Sair". |
| Rotas | Estáticas, como antes | Dinâmicas (leem cookies) |
| Cursos do aluno | Catálogo inteiro | Só cursos com matrícula **ativa** (`enrollments.status = 'active'`) |
| Progresso | Local da tela | `lesson_progress` (insere/apaga; revalida o painel) |
| `/area-do-aluno/recuperar-senha`, `/definir-senha`, `/auth/confirmar`, `/auth/confirm` | Avisam que o login não está ativo / voltam ao login | Fluxo completo |

`tests/area-do-aluno.spec.ts` só vale no modo sem Supabase.

### 12.3 Arquivos

| Arquivo | Função |
|---|---|
| `src/proxy.ts` + `src/lib/supabase/proxy.ts` | Next 16 `proxy` (antigo `middleware`). Em `/area-do-aluno/:path*` e `/auth/:path*` renova a sessão (`getClaims`) e manda quem não entrou para `/area-do-aluno/login?next=...`. Login e recuperar senha ficam públicos. Sem Supabase não faz nada. Repassa os cabeçalhos anti-cache do Supabase. |
| `src/lib/supabase/server.ts` | `createSupabaseServerClient()` (cookies de `next/headers`; um por requisição). |
| `src/lib/supabase/admin.ts` | `createSupabaseAdminClient()`: chave de serviço, `server-only`, sem sessão persistida. |
| `src/types/database.ts` | Tipo `Database` escrito à mão conforme a migração; trocar pelo gerado (`supabase gen types typescript`). |
| `src/lib/auth-paths.ts` | Caminhos e `safeNext()` (aceita só caminho relativo do site; bloqueia `//`, barra invertida e o que vira `//` depois de normalizado ou decodificado: `/.//host`, `/%2F%2Fhost`). Também `CONFIRM_PATH` e os tipos de link aceitos. |
| `src/lib/content/student.ts` | Sessão (`getStudentSession`, `requireStudentSession`), matrículas, progresso e cursos do aluno; `cache()` por requisição. As funções de progresso são puras e recebem o `ProgressByCourse` carregado pela página. |
| `src/app/area-do-aluno/auth-actions.ts` | Server Actions: `signIn`, `requestPasswordReset`, `updatePassword`, `signOut`. |
| `src/app/area-do-aluno/lesson-actions.ts` | `setLessonCompleted` (confere sessão, curso e aula; o RLS exige matrícula ativa). |
| `src/app/auth/confirmar/page.tsx` | **Destino dos links dos e-mails.** Só mostra o botão "Continuar" (campos ocultos `token_hash`, `type`, `next` ou `code`). Abrir a página não gasta o token. `referrer: no-referrer`, fora dos buscadores. |
| `src/app/auth/confirmar/actions.ts` | Server Action `confirmEmailLink`: **único** lugar que troca `token_hash` + `type` (`invite`, `recovery`, `email`, `signup`) por sessão (`verifyOtp`) ou `code` (PKCE) por sessão (`exchangeCodeForSession`), só no envio do formulário (POST; o Next confere a origem). Tipo e `next` são validados de novo. Erro: login com aviso. |
| `src/app/auth/confirm/route.ts` | Endereço antigo: o GET só repassa `token_hash`, `type`, `code` e `next` para `/auth/confirmar`; nunca chama o Supabase. Sem Supabase: login. |

### 12.4 Fluxos

- **Login:** e-mail + senha, por `signInWithPassword`. Qualquer credencial inválida mostra "E-mail ou senha incorretos." (sem revelar se o e-mail existe). Falha do serviço mostra mensagem própria. `?next=` só é respeitado se for caminho relativo seguro.
- **Compra e conta:** o webhook da Kiwify grava a matrícula e envia o convite do Supabase (`inviteUserByEmail` com `redirectTo` para `/auth/confirmar?next=/area-do-aluno/definir-senha`). Os gatilhos do banco ligam matrícula e conta pelo e-mail, **só para conta com e-mail confirmado ou convidado**. O aluno abre o e-mail, cai em `/auth/confirmar`, clica em **Continuar** (aí o token é trocado por sessão) e chega em `/area-do-aluno/definir-senha`.
- **Por que o botão:** programas de e-mail e antivírus (ex.: Safe Links) abrem os links antes da pessoa. Se o GET consumisse o token de uso único, o aluno veria "link inválido". Por isso o GET só mostra a página e o token é gasto no clique (POST, Server Action).
- **Recuperar senha:** `resetPasswordForEmail` com `redirectTo` = `absoluteUrl('/auth/confirmar?next=/area-do-aluno/definir-senha')`. A resposta é sempre a mesma, exista a conta ou não.
- **Definir senha:** exige sessão; mínimo de 8 e máximo de 72 caracteres, com confirmação; `updateUser({ password })`; depois `/area-do-aluno`.
- **Autorização:** o proxy é só a primeira barreira. Cada página e cada Server Action conferem o usuário no servidor. Páginas de curso e de aula redirecionam para `/area-do-aluno/cursos` sem matrícula ativa. O banco é a barreira final (RLS).
- **Permissões do banco:** a migração tira todo o acesso de `anon` e `authenticated` às três tabelas e concede só `select` em `enrollments` e `select/insert/delete` em `lesson_progress` (`authenticated`). O `service_role` (webhook) recebe `select/insert/update` em `enrollments` e `kiwify_events` e `select` em `lesson_progress`. O gatilho em `auth.users` (liga matrícula à conta) tem tratamento de exceção: um erro nele nunca bloqueia cadastro nem convite.

### 12.5 O que a dona do projeto configura no painel do Supabase

**Feito em 18/11/2026** (conferido recarregando cada página do painel): itens 1 a 4 abaixo. SMTP: `smtpout.secureserver.net`, porta 465, remetente e usuário `contato@saletebrocca.com`, nome "Salete Brocca" (senha digitada pelo responsável, fora do repositório). Modelos *Invite user* e *Reset password* em português, com os links `token_hash` abaixo. Ainda não verificado: a entrega real de um e-mail pelo SMTP (testar com "Esqueci minha senha" depois de publicar).

1. **Authentication > URL Configuration**
   - **Site URL:** `https://saletebrocca.com` (domínio próprio, já ligado ao projeto na Netlify).
   - **Redirect URLs:** `https://saletebrocca.com/**` e `http://localhost:3000/**`.
2. **Authentication > SMTP Settings:** configurar SMTP próprio **antes do lançamento**. O remetente embutido do Supabase tem limite muito baixo de e-mails por hora e (confirmar no painel) pode entregar só a membros da equipe do projeto; convites e recuperações de alunos não chegariam.
3. **Authentication > Email Templates:** trocar o link dos modelos para o fluxo por `token_hash`, que funciona no servidor e **só gasta o token no clique em "Continuar"**.
   - *Invite user*: `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=invite&next=/area-do-aluno/definir-senha`
   - *Reset password*: `{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=recovery&next=/area-do-aluno/definir-senha`
   - Links antigos para `/auth/confirm?...` continuam funcionando: o GET repassa para `/auth/confirmar`.
   - **Não use** o modelo padrão (`{{ .ConfirmationURL }}`): o Supabase o consome no próprio endereço de verificação (GET), sujeito ao mesmo problema dos antivírus, e entrega o token no fragmento da URL (`#access_token=...`), que o servidor não lê. Só os modelos com `token_hash` acima estão protegidos.
4. **Authentication > Sign In / Providers:** manter "Email" ligado e **desligar "Allow new users to sign up"** (as contas nascem só pelo convite da compra, sem cadastros soltos). **Bloqueia o lançamento:** com o cadastro aberto, qualquer pessoa cria conta com o e-mail de um aluno. A migração só liga a matrícula a conta com e-mail confirmado ou convidado, mas isso é a segunda barreira, não a primeira.
5. ~~Aplicar a migração~~ **Feito em 17/11/2026** no projeto `salete-brocca`. Migrações futuras: novo arquivo em `supabase/migrations/` aplicado pelo SQL Editor, CLI ou MCP.
6. **Project Settings > API:** copiar a URL e a chave publicável para `NEXT_PUBLIC_*` e a chave de serviço (secreta) para `SUPABASE_SERVICE_ROLE_KEY`, na Netlify (e em `.env.local` para testar).

Observação: com a página `/auth/confirmar`, a abertura automática do link (antivírus ou prévia) não gasta o token. Se mesmo assim um aluno cair em "link inválido" (link vencido, já usado ou aberto em outro navegador no fluxo PKCE), o caminho é "Esqueci minha senha".

### 12.6 Testes

`tests/area-do-aluno-auth.spec.ts`: os fluxos autenticados só rodam com `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `TEST_STUDENT_EMAIL` e `TEST_STUDENT_PASSWORD` definidos (conta de teste com matrícula ativa em `dificuldades-na-aprendizagem`). As variáveis podem vir do shell ou do `.env.local` (o teste o lê). Rodam só no projeto desktop, porque a conta de teste é uma só. Sem elas, os testes são ignorados com o motivo na tela. O teste do modo demonstração roda só sem Supabase.
