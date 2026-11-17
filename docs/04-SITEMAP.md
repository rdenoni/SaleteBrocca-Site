# 04 - Mapa do Site

Rotas do Next.js App Router. Wireframes de cada página em [05](05-WIREFRAMES.md).

Atualizado em 17/11/2026 com a proposta de mapa aprovada pela cliente (protótipo em `salete-motion-lab/src/app/mapa`,
texto em `salete-motion-lab/PROPOSTA-MAPA-DO-SITE.md`). Primeira etapa aplicada: menu, rodapé, `/avaliacao` e
`/termos-de-uso`. Segunda etapa aplicada: fim do curso duplicado na Loja, com redirecionamentos 301 (seção 8),
trilha de navegação nas páginas de nível 2 ou mais (seção 9), `sitemap.ts` e `robots.ts` (seção 10). Etapa seguinte,
já aprovada e ainda não feita: `/loja/categoria/[slug]` quando houver produto (com o 301 de `?categoria=`).

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
+-- AVALIAÇÃO                    /avaliacao
|     (serviço clínico; o formulário da Home continua e é o mesmo)
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
+-- LOJA (só no rodapé; só produtos avulsos: Materiais, Jogos e softwares; nenhum cadastrado ainda)
|     +-- Produtos               /loja
|     +-- Detalhes               /loja/[slug] (404 até existir produto)
|     +-- Checkout               /loja/checkout
|
+-- CONTATO                      /contato (canais gerais)
|     +-- Agendamento            #agendamento (bloco curto que leva a /avaliacao)
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
+-- Termos de uso                /termos-de-uso (texto [A CONFIRMAR]; noindex até existir)
```

A página `/privacidade` (LGPD) é necessária porque os formulários coletam nome e telefone.

## 2. Tabela de rotas

| Rota | Página | Seção do menu | Fase |
|---|---|---|---|
| `/` | Home | - | 1 |
| `/cursos` | Catálogo de cursos | Cursos | 2 |
| `/cursos/[slug]` | Detalhe do curso | Cursos | 2 |
| `/cursos/[slug]/compra` | Compra (visual) | Cursos | 2 |
| `/avaliacao` | Avaliação (serviço clínico, formulário Nome/Telefone) | Avaliação | 3 |
| `/sobre` | Sobre (âncoras `#historia`, `#formacao`, `#atuacao`) | Sobre | 3 |
| `/contato` | Contato: canais gerais (âncoras `#agendamento` → `/avaliacao`, `#whatsapp`, `#formulario`) | Contato | 3 |
| `/conteudo` | Biblioteca de artigos | Conteúdo | 4 |
| `/conteudo/categoria/[slug]` | Categoria | Conteúdo | 4 |
| `/conteudo/[slug]` | Artigo | Conteúdo | 4 |
| `/loja` | Catálogo de produtos avulsos (hoje sem produtos; aponta para `/cursos`) | Rodapé | 5 |
| `/loja/[slug]` | Produto avulso (sem produto cadastrado, todo slug responde 404) | Rodapé | 5 |
| `/loja/checkout` | Checkout de produto avulso (visual; sem produto mostra "Nenhum produto selecionado") | Rodapé | 5 |
| `/area-do-aluno/login` | Login | Área do Aluno | 6 |
| `/area-do-aluno` | Dashboard (inclui progresso) | Área do Aluno | 6 |
| `/area-do-aluno/cursos` | Meus cursos | Área do Aluno | 6 |
| `/area-do-aluno/cursos/[slug]` | Curso do aluno | Área do Aluno | 6 |
| `/area-do-aluno/cursos/[slug]/aulas/[aula]` | Player | Área do Aluno | 6 |
| `/area-do-aluno/materiais` | Materiais | Área do Aluno | 6 |
| `/privacidade` | Política de privacidade | Footer | 8 |
| `/termos-de-uso` | Termos de uso e de compra (texto [A CONFIRMAR]) | Footer | 8 |
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
| Centro | Avaliação | `/avaliacao` |
| Centro | Conteúdo | `/conteudo` |
| Centro | Sobre | `/sobre` |
| Centro | Contato | `/contato` |
| Direita (destaque, sempre visível) | Área do Aluno | `/area-do-aluno` (sem sessão: `/area-do-aluno/login`) |

Item da seção atual: `aria-current="page"`, gota ciano (na Home, a gota fica em Cursos, como na referência). No
tablet/mobile, o menu abre num painel; Área do Aluno permanece visível fora dele. A Loja saiu do header até existir
produto próprio; a rota continua no ar e aparece no rodapé.

## 5. Footer

Três colunas, só com páginas reais (sem âncoras):

| Coluna | Links | Destino |
|---|---|---|
| Atendimento | Marcar avaliação | `/avaliacao` |
| | Sobre a Salete | `/sobre` |
| | Contato | `/contato` |
| Cursos | Catálogo | `/cursos` |
| | Um link por curso (hoje: Dificuldades na Aprendizagem) | `/cursos/[slug]` |
| | Loja | `/loja` |
| | Área do Aluno | `/area-do-aluno` |
| Conteúdo | Todos os conteúdos | `/conteudo` |
| | Um link por categoria (gerado dos dados; categorias ainda provisórias) | `/conteudo/categoria/[slug]` |

Além das colunas: logo, ícones sociais (Instagram, Facebook, LinkedIn, WhatsApp; sem endereço confirmado mostram o
aviso "Endereço em confirmação"), e na faixa inferior: copyright, `/privacidade`, `/termos-de-uso` e Voltar ao topo.

## 6. Fluxos de navegação

### Visitante interessado em curso

```
Home (hero "Explorar cursos") -> /cursos -> /cursos/dificuldades-na-aprendizagem
   -> /cursos/dificuldades-na-aprendizagem/compra -> (futuro: pagamento) -> /area-do-aluno
```

### Visitante que quer avaliação

```
Busca "avaliação dificuldade de aprendizagem" -> /avaliacao -> formulário -> confirmação
   ou Header "Avaliação" -> /avaliacao
   ou Home (seção "Quer marcar uma avaliação?") -> envio do formulário (o mesmo de /avaliacao)
```

Todo "Marcar avaliação" do site leva ao mesmo destino, `/avaliacao`.

### Visitante que quer conhecer a profissional

```
Home (Apresentação de Maria Salete) -> /sobre#historia -> /cursos ou /contato
```

### Leitor de conteúdo

```
Home (Conteúdos em destaque, "Acesse >") -> /conteudo/[slug]
   -> /conteudo/categoria/[slug] -> /conteudo -> CTA para /cursos ou /contato
```

### Comprador de produto avulso

```
/loja -> /loja/[slug] -> /loja/checkout -> (futuro) Área do Aluno / Materiais
```

Curso não passa pela Loja: a compra é `/cursos/[slug]/compra`. A Loja traz um link "Ver o catálogo de cursos".

### Aluno

```
Header "Área do Aluno" -> /area-do-aluno/login -> /area-do-aluno (dashboard)
   -> /area-do-aluno/cursos -> /area-do-aluno/cursos/[slug]
   -> /area-do-aluno/cursos/[slug]/aulas/[aula] (player, retoma de onde parou)
   -> /area-do-aluno/materiais
```

### Chamada final (página Sobre)

A Home nova não tem mais chamada final (termina na frase-conceito). A chamada final da página Sobre leva a
`/avaliacao` ("Marcar avaliação") e a `/cursos`.

## 7. Conteúdo por rota

- Todo conteúdo é marcado `[A CONFIRMAR]` quando não houver fonte real (preço, carga horária, certificado, CRFa, depoimentos).
- Rotas dinâmicas (`[slug]`, `[aula]`) usam `generateStaticParams` a partir dos módulos de conteúdo (ver [06](06-TECHNICAL-ARCHITECTURE.md)).
- Rotas da Área do Aluno terão `robots: noindex`.

## 8. Redirecionamentos (301)

Os cursos deixaram a Loja e vivem só em `/cursos`. Os endereços antigos redirecionam com 301, definidos em
`next.config.ts` (`redirects()`, com `statusCode: 301`; a lista de cursos vem de `getCourses()`):

| Origem | Destino |
|---|---|
| `/loja/[slug do curso]` | `/cursos/[slug do curso]` |
| `/loja/checkout?produto=[slug do curso]` | `/cursos/[slug do curso]/compra` |
| `/loja?categoria=cursos` | `/cursos` |

- As fontes são explícitas, uma por curso (sem curinga), para `/loja/[slug]` ficar livre para produtos avulsos.
- O Next repassa a query da requisição ao destino e não a remove: o `Location` fica, por exemplo,
  `/cursos/[slug]/compra?produto=[slug]`. As páginas de destino ignoram esses parâmetros, e `/cursos` declara
  o canônico (`alternates.canonical`), para `/cursos?categoria=cursos` não contar como página duplicada.
- `/loja?categoria=materiais` e `?categoria=jogos` não redirecionam: continuam filtrando a Loja até existir
  `/loja/categoria/[slug]`.
- Testes: `tests/redirects.spec.ts`.

## 9. Trilha de navegação (breadcrumbs)

Um único componente, `src/components/layout/Breadcrumbs.tsx`: `nav` "Trilha de navegação", "Início" sempre primeiro,
o último item é a página atual (`aria-current="page"`, sem link) e um `BreadcrumbList` em JSON-LD com URLs absolutas
(`src/lib/site-url.ts`). Só em páginas de nível 2 ou mais:

| Página | Trilha |
|---|---|
| `/cursos/[slug]` | Início › Cursos › {Curso} |
| `/cursos/[slug]/compra` | Início › Cursos › {Curso} › Inscrição |
| `/conteudo/categoria/[slug]` | Início › Conteúdo › {Categoria} |
| `/conteudo/[slug]` | Início › Conteúdo › {Categoria} › {Artigo} |
| `/loja/[slug]` | Início › Loja › {Produto} |
| `/loja/checkout` | Início › Loja › Finalizar compra |

Páginas de nível 1 não têm trilha. A Área do Aluno usa as próprias abas e o "voltar ao curso". Testes:
`tests/breadcrumbs.spec.ts`.

## 10. `sitemap.xml` e `robots.txt`

- `src/app/sitemap.ts` lista só páginas indexáveis: `/`, `/cursos`, cada curso, `/avaliacao`, `/sobre`, `/contato`,
  `/loja` e `/privacidade`. A árvore `/conteudo` entra sozinha quando `ARTICLES_ARE_EXAMPLES` virar `false` (é a
  mesma flag que hoje põe noindex nela). Ficam fora as páginas com noindex: Área do Aluno, inscrição, checkout e
  `/termos-de-uso`. Sem `lastModified`/`priority`: não há datas reais.
- `src/app/robots.ts` libera o rastreamento e aponta o sitemap. Não bloqueia as páginas com noindex, para o buscador
  conseguir ler essa meta.
- Endereço absoluto: `NEXT_PUBLIC_SITE_URL`, senão a variável `URL` que a Netlify define no build (o endereço
  principal do projeto, hoje `saletebrocca.netlify.app`; vira o domínio próprio sozinha quando ele for ligado).
  O layout usa o mesmo valor em `metadataBase`.
- Testes: `tests/seo.spec.ts`.
