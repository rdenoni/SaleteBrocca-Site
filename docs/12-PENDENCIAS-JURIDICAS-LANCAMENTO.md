# Pendências Jurídicas e Comerciais antes do Lançamento

Checklist de itens que dependem de definição ou confirmação da titular (**Maria Salete Brocca Denoni · CRFa/RJ 8589**) para eliminar qualquer pendência marcada como `"A confirmar"` antes de campanhas pagas ou escala de vendas.

## 1. Identificação do Fornecedor (Decreto 7.962/2013 e LGPD)
- [ ] **CPF ou CNPJ** da titular/empresa responsável pelo site e pelas vendas.
- [ ] **Endereço comercial ou físico** para constar em `/privacidade` e `/termos-de-uso`.
  - Onde atualizar no código: `src/app/privacidade/page.tsx` e `src/app/termos-de-uso/page.tsx`.

## 2. Encarregado LGPD (DPO — Art. 41) e Canais Oficiais
- [ ] **Nome completo e e-mail do Encarregado pelo Tratamento de Dados (DPO)**.
- [ ] **WhatsApp oficial e e-mail de atendimento** ativos (configuráveis direto em `/admin/links` no Painel Administrativo).
- [ ] **Prazos de guarda (retenção) de dados** e **mecanismo de transferência internacional** em `src/app/privacidade/page.tsx` (remover o selo `"Versão provisória"` e preencher `PRIVACY_UPDATED_AT` em `src/lib/content/privacy.ts` após validação jurídica final).

## 3. Oferta do Curso (CDC Art. 30 e Art. 31)
- [ ] Definir e preencher em `src/lib/content/courses.ts` (`commercial`) para o curso **Dificuldades na Aprendizagem** (`R$ 598,00`):
  - **Tempo de acesso** (ex.: `12 meses`, `24 meses` ou vitalício — importante definir para evitar obrigação implícita de acesso perpétuo).
  - **Carga horária** total das 21 aulas.
  - **Emissão de certificado** (se há certificado e quais as regras).

## 4. Depoimentos e Direito de Imagem (CFFa Res. 640/2021 e ECA)
- [ ] **Despublicar os 3 depoimentos simulados** em `/admin/hero` antes de iniciar anúncios/vendas, mantendo apenas depoimentos reais autorizados (Daniele Schlichting Fusinato e novos alunos/pais).
- [ ] Manter arquivadas as **licenças comerciais das fotos de banco de imagens** (Hero/Artigos) e, caso alguma foto seja de aluno/paciente real, o **Termo de Autorização de Uso de Imagem** assinado pelos responsáveis legais.

## 5. Tracking / Anúncios (quando ativar)
- [ ] Ao preencher o **Meta Pixel / CAPI** em `/admin/integracoes`, garantir que o script de marketing no navegador só dispare quando o visitante tiver aceitado a categoria **Marketing** no aviso de cookies (`readConsent()?.marketing === true`).

---
*Última revisão: 2026-11-25 (R-0010).*
