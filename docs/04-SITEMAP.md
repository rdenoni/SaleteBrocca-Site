# 04 - Mapa do Site

Rotas do Next.js App Router. Wireframes de cada página em [05](05-WIREFRAMES.md).

## 1. Árvore

```
HOME  /
|
+-- CURSOS
|     +-- Catálogo               /cursos
|     +-- Detalhe do curso       /cursos/[slug]
|     |     (primeiro: /cursos/dificuldades-na-aprendizagem)
|     +-- Compra                 /cursos/[slug]/compra
|
+-- SOBRE                        /sobre
|     +-- História               #historia
|     +-- Formação               #formacao
|     +-- Atuação                #atuacao
|
+-- CONTEÚDO
|     +-- Artigos                /conteudo
|     +-- Categorias             /conteudo/categoria/[slug]
|     +-- Leitura                /conteudo/[slug]
|
+-- LOJA
|     +-- Produtos               /loja
|     +-- Detalhes               /loja/[slug]
|     +-- Checkout               /loja/checkout
|
+-- CONTATO                      /contato
|     +-- Agendamento            #agendamento
|     +-- WhatsApp               #whatsapp
|     +-- Formulário             #formulario
|
+-- ÁREA DO ALUNO
|     +-- Login                  /area-do-aluno/login
|     +-- Dashboard              /area-do-aluno
|     +-- Meus cursos            /area-do-aluno/cursos
|     +-- Curso (módulos/aulas)  /area-do-aluno/cursos/[slug]
|     +-- Player                 /area-do-aluno/cursos/[slug]/aulas/[aula]
|     +-- Materiais              /area-do-aluno/materiais
|     +-- Progresso              (dentro do dashboard)
|
+-- 404                          not-found
+-- Política de privacidade      /privacidade
```

A página `/privacidade` (LGPD) é necessária porque os formulários coletam nome e telefone.

## 2. Tabela de rotas

| Rota | Página | Seção do menu | Fase |
|---|---|---|---|
| `/` | Home | - | 1 |
| `/cursos` | Catálogo de cursos | Cursos | 2 |
| `/cursos/[slug]` | Detalhe do curso | Cursos | 2 |
| `/cursos/[slug]/compra` | Compra (visual) | Cursos | 2 |
| `/sobre` | Sobre (âncoras `#historia`, `#formacao`, `#atuacao`) | Sobre | 3 |
| `/contato` | Contato (âncoras `#agendamento`, `#whatsapp`, `#formulario`) | Contato | 3 |
| `/conteudo` | Biblioteca de artigos | Conteúdo | 4 |
| `/conteudo/categoria/[slug]` | Categoria | Conteúdo | 4 |
| `/conteudo/[slug]` | Artigo | Conteúdo | 4 |
| `/loja` | Catálogo de produtos | Loja | 5 |
| `/loja/[slug]` | Produto | Loja | 5 |
| `/loja/checkout` | Checkout (visual) | Loja | 5 |
| `/area-do-aluno/login` | Login | Área do Aluno | 6 |
| `/area-do-aluno` | Dashboard (inclui progresso) | Área do Aluno | 6 |
| `/area-do-aluno/cursos` | Meus cursos | Área do Aluno | 6 |
| `/area-do-aluno/cursos/[slug]` | Curso do aluno | Área do Aluno | 6 |
| `/area-do-aluno/cursos/[slug]/aulas/[aula]` | Player | Área do Aluno | 6 |
| `/area-do-aluno/materiais` | Materiais | Área do Aluno | 6 |
| `/privacidade` | Política de privacidade | Footer | 8 |
| (not-found) | 404 | - | 1 |

## 3. Prioridade

1. Home
2. Cursos
3. Sobre
4. Contato
5. Conteúdo
6. Loja
7. Área do Aluno

(Privacidade e 404 acompanham a primeira página que tenha formulário/rota inexistente.)

## 4. Header

| Posição | Item | Destino |
|---|---|---|
| Esquerda | Logo | `/` |
| Centro | Cursos | `/cursos` |
| Centro | Sobre | `/sobre` |
| Centro | Conteúdo | `/conteudo` |
| Centro | Loja | `/loja` |
| Centro | Contato | `/contato` |
| Direita (destaque, sempre visível) | Área do Aluno | `/area-do-aluno` (sem sessão: `/area-do-aluno/login`) |

Item da seção atual: `aria-current="page"`, gota ciano. No tablet/mobile, o menu abre num painel; Área do Aluno permanece visível fora dele.

## 5. Footer

| Coluna | Links | Destino |
|---|---|---|
| Profissão | História | `/sobre#historia` |
| | Formação | `/sobre#formacao` |
| | Atuação | `/sobre#atuacao` |
| Cursos | Catálogo | `/cursos` |
| | Loja | `/loja` |
| | Área do Aluno | `/area-do-aluno` |
| Conteúdo | Artigos | `/conteudo` |
| | Categorias | `/conteudo` (lista de categorias) |
| Contato | Agendamento | `/contato#agendamento` |
| | WhatsApp | `/contato#whatsapp` |
| | Formulário | `/contato#formulario` |

Além das colunas: logo, ícones sociais (WhatsApp, Instagram, LinkedIn: `[A CONFIRMAR]` canais oficiais), link para `/privacidade` e copyright na faixa inferior.

## 6. Fluxos de navegação

### Visitante interessado em curso

```
Home (hero "Explorar cursos") -> /cursos -> /cursos/dificuldades-na-aprendizagem
   -> /cursos/dificuldades-na-aprendizagem/compra -> (futuro: pagamento) -> /area-do-aluno
```

### Visitante que quer avaliação

```
Home (seção "Quer marcar uma avaliação?") -> envio do formulário
   ou Home/Header -> /contato#agendamento | #whatsapp | #formulario
```

### Visitante que quer conhecer a profissional

```
Home (Apresentação de Maria Salete) -> /sobre#historia -> /cursos ou /contato
```

### Leitor de conteúdo

```
Home (Conteúdos em destaque, "Acesse >") -> /conteudo/[slug]
   -> /conteudo/categoria/[slug] -> /conteudo -> CTA para /cursos ou /contato
```

### Comprador de produto digital

```
/loja -> /loja/[slug] -> /loja/checkout -> (futuro) Área do Aluno / Materiais
```

### Aluno

```
Header "Área do Aluno" -> /area-do-aluno/login -> /area-do-aluno (dashboard)
   -> /area-do-aluno/cursos -> /area-do-aluno/cursos/[slug]
   -> /area-do-aluno/cursos/[slug]/aulas/[aula] (player, retoma de onde parou)
   -> /area-do-aluno/materiais
```

### Chamada final (Home)

Leva a `/cursos` (ação principal) e `/contato` (secundária).

## 7. Conteúdo por rota

- Todo conteúdo é marcado `[A CONFIRMAR]` quando não houver fonte real (preço, carga horária, certificado, CRFa, depoimentos).
- Rotas dinâmicas (`[slug]`, `[aula]`) usam `generateStaticParams` a partir dos módulos de conteúdo (ver [06](06-TECHNICAL-ARCHITECTURE.md)).
- Rotas da Área do Aluno terão `robots: noindex`.
