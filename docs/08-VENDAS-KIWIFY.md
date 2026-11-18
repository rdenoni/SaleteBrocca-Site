# 08 · Vendas pela Kiwify

Estado (18/11/2026): o produto do curso **existe** na Kiwify e está ativo. Só o curso é vendido por enquanto; a Loja continua com `kiwify: null` e mostra "Pagamento online em preparação".

| Campo | Valor |
| --- | --- |
| Produto | Dificuldades na Aprendizagem (loja da conta Rafael Denoni) |
| ID do produto | `44c49520-e2e8-11f1-9987-25084670ad29` |
| Checkout | `https://pay.kiwify.com.br/49R1AdE` |
| Preço | R$ 598,00 (confirmado pelo responsável) |

Os três estão em `src/lib/content/courses.ts` (`kiwify` e `commercial.price`). **Falta o webhook** (passos 3 a 6 abaixo): sem ele a compra é cobrada, mas a matrícula e o convite da Área do Aluno não são criados.

## Como funciona, do começo ao fim

1. A pessoa abre a página do curso (`/cursos/[slug]`) ou de um produto da Loja e clica em comprar. O site mostra `/cursos/[slug]/compra` ou `/loja/checkout`: resumo do pedido, explicação do fluxo e o botão **Ir para o pagamento**. O site **não coleta** nome, e-mail nem telefone do comprador.
2. O botão leva (mesma aba) ao checkout da Kiwify (`https://pay.kiwify.com.br/...`). Só links `https` em `kiwify.com.br` ou subdomínios são exibidos (`src/lib/kiwify/checkout-url.ts`); qualquer outro vira "em preparação".
3. A Kiwify cobra e avisa o site por webhook: `POST https://<site>/api/kiwify/webhook?signature=<hmac>`.
4. O site confere a assinatura, registra o evento e, se for compra aprovada de um **curso**, cria a matrícula (`public.enrollments`) e envia à compradora o convite do Supabase para criar a senha (`/auth/confirmar?next=/area-do-aluno/definir-senha`; o token do e-mail só é gasto quando a pessoa clica em **Continuar** nessa página). Se a pessoa já tem conta, nenhum convite é enviado: o banco liga a matrícula à conta pelo e-mail (só para conta com e-mail confirmado ou convidado).
5. Reembolso ou chargeback mudam o status da matrícula para `refunded` ou `chargeback`; o acesso à Área do Aluno some. Nada é apagado. A Kiwify não retira acesso por conta própria no chargeback; é este webhook que faz.
6. Produtos da Loja (materiais, jogos) **não** geram matrícula: a Kiwify entrega o produto digital. O pedido só fica registrado em `public.kiwify_events`.

### O que cada evento faz

| Evento (`webhook_event_type`) | `order_status` | Efeito |
| --- | --- | --- |
| `order_approved` | `paid` | Curso: matrícula `active` + convite. Produto da Loja ou desconhecido: só registra. |
| `order_refunded` | `refunded` | Matrículas do pedido passam a `refunded`. |
| `chargeback` | `chargedback` | Matrículas do pedido passam a `chargeback`. |
| `pix_created`, `billet_created` | `waiting_payment` | Só registra. |
| `order_rejected` | `refused` | Só registra. |
| `subscription_*` | | Só registra (o curso não é assinatura). |
| carrinho abandonado (sem `webhook_event_type`) | | Registra como `abandoned_cart` se tiver `order_id`; senão ignora. |

Uma aprovação que chegar **depois** de um reembolso do mesmo pedido não reativa o acesso: a revogação é um upsert que atualiza o status (vence uma aprovação concorrente), e a aprovação usa `ignoreDuplicates` (nunca desfaz uma revogação).

Limite conhecido: um reembolso **sem produto no payload** não tem curso para registrar. Ele revoga as matrículas que o pedido já tiver e fica `processed`, com a observação `revogou_pedido_inteiro` ou `sem_matricula_do_pedido` na resposta e no log; se a aprovação do mesmo pedido chegar depois, ela libera o acesso. Os formatos reais do webhook (veja "Ainda não verificado") dizem se isso acontece.

### Códigos de resposta do webhook

| Situação | HTTP |
| --- | --- |
| Método diferente de POST | 405 (`Allow: POST`) |
| Token ou configuração do Supabase ausente | 503 `{"error":"webhook não configurado"}` |
| Corpo maior que 512 KB | 413 |
| `signature` ausente ou inválida | 401 |
| Corpo que não é JSON | 400 |
| Processado ou ignorado (inclusive assinado sem `order_id`) | 200 `{"ok":true,...}`; revogação sem curso no payload traz `"note"` |
| Duplicado: o evento já foi **processado** (`processed_at` preenchido) | 200 `{"ok":true,"result":"duplicate"}` |
| Evento reservado por outra tentativa ainda em andamento (há menos de 60 s, sem erro, sem `processed_at`) | **409** `{"error":"evento em processamento"}` (a Kiwify reenvia) |
| Falha ao gravar ou convidar | 500 (a Kiwify reenvia) |

Por que 409 e não 200 para o evento em andamento: se aquela tentativa morrer (tempo esgotado, queda) sem registrar a falha, um 200 faria a Kiwify desistir e a venda se perderia. Não verificado: a documentação da Kiwify diz só que reenvia "em falha"; confirmar com um "Testar webhook" que ela trata o 409 como falha e reenvia.

### Segurança e idempotência

- A assinatura é o HMAC-SHA1 (hex, minúsculo) do **corpo bruto**, com o token do webhook como chave, comparado em tempo constante. A Kiwify não manda carimbo de data: um reenvio idêntico é válido, por isso há idempotência.
- Cada evento é reservado em `kiwify_events` pela chave única `(order_id, event_type)`. Um reenvio (a Kiwify repete em milissegundos e, em falha, em 1 a 10 minutos) é tratado assim (`classifyExistingEvent` em `src/lib/kiwify/handler.ts`, a mesma regra no banco e nos testes):
  - `processed_at` preenchido: "duplicado", 200, sem novo convite;
  - `error` preenchido: processado de novo;
  - sem `processed_at` nem `error`, reservado há **menos de 60 s**: 409 (em andamento);
  - o mesmo, há 60 s ou mais (a tentativa morreu no meio; a janela fica pouco acima do limite de uma função síncrona da Netlify): processado de novo. A retomada é atômica: só uma requisição concorrente a ganha, as outras recebem 409.
  A matrícula usa `(source, order_id, course_slug)` como chave.
- Se `markFailed` também falhar, a falha vai para o log (só `order_id` e tipo do evento) e o evento fica "em andamento" até vencer a janela de 60 s.
- Troca de token sem janela de erro: configure `KIWIFY_WEBHOOK_TOKEN` (novo) e `KIWIFY_WEBHOOK_TOKEN_PREVIOUS` (antigo), troque o token na Kiwify e depois apague o antigo.
- Os logs trazem só `order_id` e tipo do evento, nunca o e-mail nem o payload.
- **Retenção mínima (LGPD):** `kiwify_events.payload` guarda só `{ order_id, order_status, webhook_event_type, product_id }`. Nome, telefone, CPF e e-mail do comprador **não** são gravados ali (o e-mail fica em `enrollments`, que é o que libera o acesso). A tabela continua sem acesso pelo navegador. O corpo bruto da Kiwify não é guardado em lugar nenhum.

## O que a dona do site precisa fazer na Kiwify

1. ~~Criar o produto do curso na Kiwify~~ (feito; prazo de acesso, carga horária e certificado continuam sem confirmação).
2. ~~Preencher `kiwify: { checkoutUrl, productId }` em `src/lib/content/courses.ts`~~ (feito). Para cada produto futuro da Loja, o mesmo em `src/lib/content/shop.ts`.
3. Em **Apps > Webhooks**, criar um webhook:
   - URL: `https://saletebrocca.com/api/kiwify/webhook`
   - Produto: Dificuldades na Aprendizagem
   - Eventos: compra aprovada (`order_approved`), compra reembolsada (`order_refunded`) e chargeback. Opcionais: Pix gerado, boleto gerado, compra recusada.
   - Copiar o **token** do webhook.
4. No painel da Netlify (Site configuration > Environment variables), definir `KIWIFY_WEBHOOK_TOKEN` com esse token (além das variáveis do Supabase descritas em `docs/06-TECHNICAL-ARCHITECTURE.md`) e publicar de novo o site. Nunca colocar o token em arquivo do repositório.
5. Usar **Testar webhook** na Kiwify e conferir a resposta 200 (ou 503 se faltar variável, 401 se o token estiver errado).
6. Fazer uma compra de teste real (ou de valor mínimo) e conferir: matrícula criada, e-mail de convite recebido, acesso à Área do Aluno; depois um reembolso e a perda de acesso.

## Ainda não verificado

Só estes campos estão confirmados na documentação da Kiwify: `order_id`, `order_status`, `webhook_event_type`. Os nomes abaixo vêm de integrações da comunidade e **precisam ser conferidos com um webhook real**. Como `kiwify_events.payload` guarda só quatro campos (veja "Retenção mínima"), o formato real do corpo **não** pode ser lido do banco: confira-o pelo "Testar webhook" e pelo registro de envios do lado da Kiwify. O leitor (`src/lib/kiwify/payload.ts`) tenta vários caminhos:

- ID do produto: `Product.product_id`, depois `product_id`, depois `product.id` e `product.product_id`.
- E-mail do comprador: `Customer.email`, depois `customer.email`.

Se um webhook real trouxer outros nomes, uma compra aprovada fica em `kiwify_events` com `error` "sem_produto" ou "sem_email" e **nenhuma matrícula é criada** (a rota responde 200). Esses eventos não contam como processados: depois de ajustar `payload.ts` e publicar, um novo envio do mesmo evento é processado normalmente. Se a Kiwify não permitir reenviar um pedido antigo, a recuperação é manual: inserir em `public.enrollments` uma linha com `source = 'manual'` e o `order_id` do pedido (e convidar o aluno pelo painel do Supabase). Não verificado se a Kiwify permite reenviar o webhook de um pedido antigo. Também não verificado: o formato do carrinho abandonado e o conteúdo de `subscription_*`.

## Privacidade (LGPD)

A Kiwify (pagamento e dados do comprador) e o Supabase (matrículas, contas e e-mails) passam a tratar dados pessoais em nome do site. Do webhook, o site guarda apenas o e-mail (em `enrollments`) e os quatro campos técnicos de `kiwify_events.payload`. A **política de privacidade (`/privacidade`) precisa ser revisada pela cliente e por quem responde juridicamente** para refletir isso. Este documento e o código não contêm texto jurídico. O site deixou de coletar dados na tela de compra justamente para não guardar dados sem finalidade.

## Arquivos

- `src/app/api/kiwify/webhook/route.ts`: rota (Node, sem cache, só POST).
- `src/lib/kiwify/`: `signature.ts`, `payload.ts`, `decide.ts`, `handler.ts` (puros e testáveis), `supabase-store.ts` e `config.ts` (servidor), `product-map.ts`, `checkout-url.ts`.
- `src/components/shop/CheckoutView.tsx`: tela de compra.
- `tests/kiwify.spec.ts` e `tests/fixtures/kiwify-order-approved.json`: testes (valores fictícios).
