# Fluxo de Faturamento no Chat

Este documento explica o caminho completo desde a extração nos serviços Solar ate a resposta final do chat, incluindo como ajustar pesquisas por data, total e associacao.

## 1. Entrada do usuario

O usuario envia uma pergunta para um destes endpoints:

- `POST /api/chat`
- `POST /api/chatbot/process`
- `POST /api/billing/query`

Exemplos:

```text
qual o faturamento de hoje?
qual o faturamento de ontem por associacao?
qual o faturamento total de hoje?
qual o total da associacao UE?
```

## 2. Resolucao da data

A data em linguagem natural e resolvida em:

```text
src/services/chatbot/dateResolverService.js
```

Exemplos:

- `hoje` vira a data atual.
- `ontem` vira a data atual menos 1 dia.
- `semana` vira inicio da semana ate hoje.
- `mes` vira inicio do mes ate hoje.

Depois, antes de consultar os servicos, a data passa por:

```text
src/utils/date.js
```

A funcao `toYYYYMMDD()` garante o padrao esperado pelos servicos:

```text
2026-04-23 -> 20260423
20260423   -> 20260423
```

Regra importante: os servicos Solar devem sempre receber data no formato `YYYYMMDD`.

## 3. Deteccao da intencao

A intencao da mensagem e detectada em:

```text
src/services/chatbot/intentParserService.js
```

Se a mensagem tiver termos como:

```text
faturamento, fatura, receita, vendas, valor faturado
```

ela vira:

```text
intent = "revenue"
```

Quando a intencao e `revenue`, o fluxo evita o Ollama e responde direto com dados do servico. Isso reduz risco de timeout.

## 4. Escolha da consulta correta

A escolha entre consulta detalhada, total ou associacao especifica acontece em:

```text
src/services/chatbot/queryBuilderService.js
```

### Consulta detalhada por associacao

Usa o servico:

```text
src/services/solar/faturamento/resumoFaturamentoService.js
```

Endpoint Solar chamado:

```text
(LOJ_FAT_FATURA)
```

Parametro enviado:

```json
{
  "datalojfatura": "20260423"
}
```

Use quando a pergunta pedir associacoes:

```text
qual o faturamento de hoje por associacao?
faturamento de ontem por associacao
```

### Consulta total

Usa o servico:

```text
src/services/solar/faturamento/resumoFaturamentoTotalService.js
```

Endpoint Solar chamado:

```text
(LOJ_FAT_FATUTO)
```

Parametro enviado:

```json
{
  "datalojfatuto": "20260423"
}
```

Use quando a pergunta tiver termos como:

```text
total, geral, consolidado, resumo, meta, atingido, performance
```

Exemplos:

```text
qual o faturamento total de hoje?
resumo do faturamento de ontem
qual a meta de hoje?
```

### Associacao especifica

Se a pergunta tiver associacao especifica, por exemplo:

```text
qual o total da associacao UE?
```

o sistema nao usa a consulta total geral. Ele:

1. chama a consulta detalhada `LOJ_FAT_FATURA`;
2. le todas as associacoes retornadas;
3. identifica `UE` na pergunta;
4. filtra apenas o registro da associacao `UE`.

Isso permite frases com a palavra `total` sem confundir com o total geral.

## 5. Chamada ao servico Solar

As chamadas HTTP passam por:

```text
src/config/birelClient.js
```

Esse client:

- abre sessao no ISCOBOL quando necessario;
- mantem cookies com `tough-cookie`;
- usa timeout de `20000ms`;
- envia o payload para o endpoint Solar.

Os servicos finais sao:

```text
src/services/solar/faturamento/resumoFaturamentoService.js
src/services/solar/faturamento/resumoFaturamentoTotalService.js
```

Ambos chamam `toYYYYMMDD()` antes do POST. Isso garante que a data sempre saia no padrao correto.

## 6. Normalizacao do retorno

O retorno dos servicos e normalizado em:

```text
src/services/solar/responseUtils.js
```

A funcao `normalizeBidata()` garante que o resultado sempre seja array:

```text
null       -> []
objeto     -> [objeto]
array      -> array
outro tipo -> []
```

Isso evita erro quando o servico retorna um unico registro em vez de uma lista.

## 7. Montagem da resposta

A resposta final de faturamento e formatada em:

```text
src/services/chatbot/responseFormatterService.js
```

Atualmente a resposta foi mantida simples:

```text
Faturamento de hoje:
Total de registros: 12
Total Geral: R$ 11.562,96
UE: R$ 0,00
SU: R$ 0,00
MO: R$ 183,97
```

Quando existe apenas um registro, como na associacao especifica ou total geral, os campos principais sao listados:

```text
Faturamento de hoje:
Total de registros: 1
Total Geral: R$ 0,00
Associacao: UE
FatuDia: R$ 0,00
FatuMes: R$ 40,70
MargemDia: 0,00%
MargemMes: 57,30%
Atualizacao: 23/04/2026 08:32:51
```

## 8. Onde ajustar cada tipo de regra

### Adicionar nova palavra para detectar faturamento

Arquivo:

```text
src/services/chatbot/intentParserService.js
```

Editar:

```js
const revenueKeywords = [...]
```

### Adicionar nova palavra para consulta total

Arquivo:

```text
src/services/chatbot/queryBuilderService.js
```

Editar:

```js
const totalKeywords = [...]
```

### Ajustar regra de associacao especifica

Arquivo:

```text
src/services/chatbot/queryBuilderService.js
```

Funcoes relevantes:

```js
isAssociationQuestion()
filterByAssociation()
findRequestedAssociation()
```

### Alterar formato da resposta

Arquivo:

```text
src/services/chatbot/responseFormatterService.js
```

Funcoes relevantes:

```js
revenueResponse()
formatRecords()
formatValue()
```

### Alterar endpoints Solar ou parametros

Arquivos:

```text
src/services/solar/faturamento/resumoFaturamentoService.js
src/services/solar/faturamento/resumoFaturamentoTotalService.js
```

Parametros atuais:

```text
datalojfatura -> consulta detalhada
datalojfatuto -> consulta total
```

## 9. Como testar

### Testar total

```bash
curl -X POST http://127.0.0.1:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"qual o faturamento total de hoje"}'
```

Resultado esperado:

```text
queryType: total
count: 1
```

### Testar por associacao

```bash
curl -X POST http://127.0.0.1:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"qual o faturamento de hoje por associacao"}'
```

Resultado esperado:

```text
queryType: detail
count: varias associacoes
```

### Testar associacao especifica

```bash
curl -X POST http://127.0.0.1:3001/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"qual o total da associacao UE"}'
```

Resultado esperado:

```text
queryType: association
count: 1
Associacao: UE
```

## 10. Resumo do fluxo

```text
Mensagem do usuario
  -> resolveDateRange()
  -> detectIntent()
  -> buildRevenueQuery()
      -> decide total/detalhe/associacao
      -> toYYYYMMDD()
      -> servico Solar
      -> normalizeBidata()
  -> revenueResponse()
  -> resposta JSON para o frontend
```

## 11. Regra operacional

Para perguntas de faturamento, o backend deve responder direto com os dados dos servicos e evitar Ollama. O Ollama deve ficar reservado para perguntas gerais, porque enviar grandes contextos tabulares para o modelo aumenta latencia e pode gerar timeout.
