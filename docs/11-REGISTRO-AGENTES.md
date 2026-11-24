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

### R-0002 · 2026-11-24 16:30 · Gemini
- Branch: gemini/configuracao · Commit: pendente
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
