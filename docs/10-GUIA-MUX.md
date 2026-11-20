# Guia Mux: upload e configuração dos vídeos das aulas

Decisão confirmada em 20/11/2026: os vídeos pagos do curso ficam na **Mux**, com **reprodução assinada** (Signed
Playback) e qualidade **Basic**. Kiwify, YouTube e Netlify foram descartados para os vídeos pagos (YouTube só para
conteúdo público). Fonte das regras: plano de vídeo (`SALETE-BROCCA-WEBSITE/docs/09-PLANO-VIDEO-E-VENDAS.md`).

Tudo abaixo foi conferido na documentação oficial da Mux em 20/11/2026 (links no fim). O que não foi encontrado nela
está marcado como **não confirmado**.

---

## Visão geral do fluxo

1. O arquivo de vídeo de cada aula é enviado para a Mux com política **signed**.
2. A Mux devolve um **asset_id** e um **playback_id** por aula.
3. Esses IDs são gravados no banco, na tabela `lesson_videos`
   (`supabase/migrations/20261120120000_lesson_videos.sql`, **aplicada** em 20/11/2026).
4. Quando o aluno abre a aula, o servidor do site confere o login e a **matrícula ativa**, assina um **token
   temporário** (JWT) com a chave de assinatura e entrega o player com esse token.
5. Sem token válido o vídeo não toca. Link copiado expira.

---

## Passo 1. Ambiente da Mux

- Cada conta Mux tem **ambientes** separados (por exemplo, um de produção e um de testes). Cada ambiente tem seus
  próprios vídeos, chaves de acesso e **chaves de assinatura**. Nada passa de um ambiente para o outro.
- Use **um ambiente só** para os vídeos do curso (o de produção). A chave de assinatura (passo 3) precisa ser criada
  **no mesmo ambiente** dos vídeos, senão o token não funciona.
- Confira no topo do painel (dashboard.mux.com) qual ambiente está selecionado antes de enviar qualquer coisa.

## Passo 2. Preparar os arquivos

- Um arquivo por aula, já editado e final (trocar depois exige novo upload e novo playback_id).
- Nome do arquivo começando pelo **código da aula**, para não haver troca: `M00_A01 - Apresentação da Maria Salete.mp4`.
  Os 21 códigos estão em `src/lib/content/courses.ts` (M00_A01 a M05_A02).
- Formato comum (MP4 H.264 + áudio AAC) e resolução até 1080p. Não é preciso exportar em várias resoluções: a Mux cria
  as versões adaptativas sozinha.

## Passo 3. Chave de assinatura (Signing Key)

1. No painel da Mux, abra **Settings → Signing Keys** (https://dashboard.mux.com/settings/signing-keys), no ambiente
   do curso.
2. Gere uma chave nova. A Mux mostra um **Key ID** e uma **Private Key** (texto em base64).
3. Guarde a Private Key em lugar seguro **na hora**. Se o painel a mostra de novo depois: **não confirmado** na
   documentação; trate como se aparecesse uma vez só.
4. No Netlify (site saletebrocca.com → Site configuration → Environment variables), crie duas variáveis
   **secretas**, com os nomes que o código vai usar:
   - `MUX_SIGNING_KEY_ID` = o Key ID
   - `MUX_SIGNING_PRIVATE_KEY` = a Private Key (base64)
5. Nunca colar a chave privada no código, no Git, em e-mail ou no chat. Quem cola no Netlify é você.

A chave de assinatura **não é** uma chave de API: ela só assina tokens de reprodução, não mexe na conta.

## Passo 4. Upload das aulas

### Caminho recomendado: pelo Claude (MCP da Mux + curl)

Na sessão que tem a Mux conectada, para cada aula:

1. É criado um **Direct Upload** com as configurações abaixo (todas documentadas pela Mux).
2. O arquivo local é enviado com `curl -X PUT --upload-file "<arquivo>" "<url devolvida>"` (o envio pode ser retomado
   se cair).
3. Quando a Mux termina o processamento, o asset_id, o playback_id e a duração são gravados em `lesson_videos`.

Configurações de cada vídeo (`new_asset_settings`):

```json
{
  "playback_policies": ["signed"],
  "video_quality": "basic",
  "meta": {
    "title": "M00_A01 - Apresentação da Maria Salete",
    "external_id": "dificuldades-na-aprendizagem:M00_A01"
  },
  "passthrough": "dificuldades-na-aprendizagem:M00_A01",
  "inputs": [{ "generated_subtitles": [{ "language_code": "pt", "name": "Português (automático)" }] }]
}
```

- `playback_policies: ["signed"]`: obrigatório. Com "public" qualquer pessoa com o link assistiria.
- `video_quality: "basic"`: a do plano; a entrada em Basic é gratuita.
- `meta` aparece no painel e na API. **Não colocar dados pessoais** aí (o navegador consegue ler).
- **Legendas automáticas em português** (`generated_subtitles`, código `pt`): a Mux diz que não há cobrança extra.
  Opcional: decidir se quer (ajudam acessibilidade; a transcrição automática pode ter erros de termos técnicos).
- **Não** pedir `static_renditions` (MP4 para download). Vídeo novo nasce sem MP4 (`mp4_support: none`), o que
  dificulta baixar a aula.

### Caminho alternativo: pelo painel da Mux

O painel tem upload de arquivo, mas a documentação da Mux **não descreve** essa tela (botão, campos, limite de tamanho:
**não confirmado**). Se usar esse caminho, confira antes de enviar que a política de reprodução está como **signed**,
não "public", e depois passe os IDs de cada aula para serem gravados no banco.

## Passo 5. Banco de dados

- Aprovar e aplicar a migration `20261120120000_lesson_videos.sql`: uma linha por aula com `asset_id`,
  `playback_id` e duração.
- O aluno só consegue ler as linhas de um curso em que tem **matrícula ativa**. Reembolso, chargeback ou cancelamento
  tiram o acesso na hora.

## Passo 6. Site (Área do Aluno)

**Feito (20/11/2026): emissão do token.** `GET /api/aulas/{slug}/{aula}/playback`
(`src/app/api/aulas/[slug]/[aula]/playback/route.ts` → `src/lib/mux/lesson-playback.ts`):

- A cada pedido confere aula do catálogo, login e **matrícula ativa**; lê o `playback_id` em `lesson_videos` (o RLS
  repete a conferência) e assina três tokens JWT com `node:crypto`, sem pacote novo (`src/lib/mux/playback-token.ts`):
  `RS256`, `sub` = playback_id, `aud` = `"v"` vídeo / `"t"` miniatura / `"s"` storyboard, `kid` = Key ID,
  `exp` = agora + duração da aula + 2 h (4 h quando a duração não está no banco). A Mux exige `exp` além do fim do vídeo.
- Respostas: 200 `{ playbackId, expiresAt, tokens }`; 401 sem login; 403 sem matrícula ativa; 404 aula inexistente ou
  vídeo ainda não gravado; 503 sem Supabase ou sem a chave (ou chave colada errada, registrada no log). Nunca em cache.
- Token já emitido não pode ser revogado: depois de um reembolso, vale até o `exp` (no máximo a duração + 2 h).

**Falta: o player.** Toca `https://stream.mux.com/{playback_id}.m3u8?token={JWT}`. Nada de parâmetros extras na URL
assinada (eles invalidam a assinatura). O Mux Player é pacote novo e depende de aprovação.

## Passo 7. Testes antes de liberar

- Aluno com matrícula ativa assiste.
- Sem login: redireciona para o login.
- Logado sem matrícula, ou com matrícula cancelada/reembolsada: não recebe token.
- URL do vídeo copiada e aberta depois de expirar: não toca.
- Celular (375 px), tablet e desktop.

---

## Fontes (documentação oficial da Mux, lida em 20/11/2026)

- Reprodução segura (signed): https://www.mux.com/docs/guides/secure-video-playback
- Assinatura de JWT: https://www.mux.com/docs/guides/signing-jwts
- Upload direto: https://www.mux.com/docs/guides/upload-files-directly
- Níveis de qualidade: https://www.mux.com/docs/guides/use-video-quality-levels
- Metadados: https://www.mux.com/docs/guides/add-metadata-to-your-videos
- Legendas automáticas: https://www.mux.com/docs/guides/add-autogenerated-captions-and-use-transcripts
- MP4 estático: https://www.mux.com/docs/guides/enable-static-mp4-renditions
- Conceitos (ambientes): https://www.mux.com/docs/core/mux-fundamentals
