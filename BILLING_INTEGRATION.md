# Integração de Faturamento ao Chatbot

## 📋 Resumo

O sistema de faturamento Solar foi completamente integrado ao chatbot. Agora, quando o usuário pergunta sobre vendas, receitas ou faturamento, o chatbot automaticamente busca os dados reais e responde baseado em informações concretas, não em suposições.

## 🎯 O que foi implementado

### 1. Serviço de Contexto de Faturamento
**Arquivo:** `src/services/billingContextService.js`

Responsável por:
- ✅ Detectar automaticamente perguntas sobre faturamento
- ✅ Buscar dados reais do servidor Solar
- ✅ Formatar dados para serem usados como contexto pela IA
- ✅ Enriquecer mensagens com dados de faturamento

**Principais métodos:**
```javascript
- isBillingQuestion(message)          // Detecta se é pergunta sobre faturamento
- getBillingResume(date)              // Busca resumo de faturamento
- getBillingResumeTotal(date)         // Busca resumo total
- createBillingContextPrompt(message) // Cria prompt com contexto
- enrichMessageWithBillingData(msg)   // Enriquece mensagem com dados
```

### 2. Atualização do Chat Service
**Arquivo:** `src/services/chatService.js`

Melhorias:
- ✅ Integração automática de contexto de faturamento
- ✅ System prompt dinâmico baseado na pergunta
- ✅ Retorno de dados de faturamento na resposta
- ✅ Suporte a desabilitar contexto quando necessário

```javascript
// Agora inclui:
const result = await chatService.chat(
  message,
  history,
  includeBillingContext = true  // Novo parâmetro!
)

// Response agora inclui:
{
  success: true,
  reply: "...",
  hasBillingData: true,
  billingData: { ... }  // Novos dados!
}
```

### 3. Controller de Query de Faturamento
**Arquivo:** `src/controllers/billingQueryController.js`

Endpoints:
- `POST /api/billing/query` - Faz queries diretas sobre faturamento
- `POST /api/billing/check-question` - Verifica se é pergunta de faturamento

### 4. Rotas de Faturamento
**Arquivo:** `src/routes/billingRoutes.js`

Endpoints expostos:
```
GET  /api/billing/resumo-faturamento
GET  /api/billing/resumo-faturamento-total
POST /api/billing/query
POST /api/billing/check-question
```

### 5. Conversão para ESM
Todos os arquivos antigos foram convertidos de CommonJS para ES Modules:

✅ `config/birelClient.js`
✅ `utils/date.js`
✅ `controllers/solar/faturamento/resumoFaturamentoController.js`
✅ `services/solar/faturamento/resumoFaturamentoService.js`
✅ `services/solar/faturamento/resumoFaturamentoTotalService.js`
✅ `routes/resumoFaturamentoRouters.js`

## 📡 Endpoints Novos

### 1. Chat com Faturamento Automático
```
POST /api/chat

{
  "message": "Quanto faturamos hoje?",
  "history": [],
  "includeBillingContext": true
}
```

Resposta:
```json
{
  "success": true,
  "reply": "Baseado nos dados...",
  "hasBillingData": true,
  "billingData": {
    "success": true,
    "date": "20240120",
    "count": 15,
    "data": [...],
    "formatted": "..."
  }
}
```

### 2. Query Direta de Faturamento
```
POST /api/billing/query

{
  "question": "Quanto faturamos?",
  "type": "resume",
  "date": "2024-01-01"
}
```

### 3. Verificar Tipo de Pergunta
```
POST /api/billing/check-question

{
  "message": "Quanto vendemos este mês?"
}

// Resposta:
{
  "success": true,
  "isBillingQuestion": true
}
```

## 🔄 Fluxo de Funcionamento

```
Usuário: "Qual foi o faturamento de hoje?"
         ↓
    [Chatbot recebe mensagem]
         ↓
    [Detecta: é pergunta sobre faturamento?]
         ↓ SIM
    [Busca dados reais do servidor Solar]
         ↓
    [Formata dados como contexto]
         ↓
    [Passa contexto + pergunta para Gemma]
         ↓
    [Gemma responde baseado em dados reais]
         ↓
Resposta: "Baseado nos dados de hoje (20/01/2024)..."
```

## 🧪 Testando a Integração

### Teste 1: Detecção Automática
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quanto faturamos hoje?",
    "includeBillingContext": true
  }'
```

### Teste 2: Query Direta
```bash
curl -X POST http://localhost:3001/api/billing/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual o total de faturamento?",
    "type": "total"
  }'
```

### Teste 3: Verificar Pergunta
```bash
curl -X POST http://localhost:3001/api/billing/check-question \
  -H "Content-Type: application/json" \
  -d '{"message": "Quanto em vendas temos?"}'
```

## 📊 Estrutura de Dados Retornada

Quando uma pergunta sobre faturamento é feita:

```javascript
{
  success: true,
  reply: "...",  // Resposta do Gemma com contexto
  model: "gemma3:4b",
  hasBillingData: true,
  billingData: {
    success: true,
    date: "20240120",
    count: 15,  // Número de registros
    data: [     // Dados brutos
      {
        description: "...",
        valor: "...",
        status: "...",
        data: "..."
      },
      // ... mais registros
    ],
    formatted: "..." // String formatada legível
  }
}
```

## 🔧 Configuração

Nenhuma configuração especial é necessária! O sistema funciona automaticamente com:

- **OLLAMA_URL**: URL do servidor Ollama
- **MODEL**: Modelo (gemma3:4b padrão)
- **Conexão Solar**: Usa configuração existente de `config/birelClient.js`

## 🚀 Próximos Passos

1. **Treinar modelo customizado** para melhor reconhecimento de perguntas
2. **Adicionar caching** de dados de faturamento
3. **Implementar filtros** (por loja, período, etc.)
4. **Adicionar análises** (tendências, comparações)
5. **Integrar com frontend** Next.js para mostrar dados visualmente

## 💡 Exemplos de Uso no Frontend

```typescript
// lib/useChat.ts
const result = await chatService.sendMessage(
  "Qual foi o faturamento de janeiro?",
  messages,
  true  // includeBillingContext
)

if (result.hasBillingData) {
  console.log("Dados de faturamento encontrados!")
  console.log(result.billingData.formatted)
  // Pode renderizar os dados em um gráfico
}
```

## 📝 Changelog

- ✅ Criado `billingContextService.js`
- ✅ Atualizado `chatService.js` com suporte a contexto
- ✅ Criado `billingQueryController.js`
- ✅ Criado `billingRoutes.js`
- ✅ Convertido todo código para ESM
- ✅ Integrado rotas no `src/app.js`
- ✅ Atualizado `README.md`
- ✅ Adicionados exemplos em `requests.http`
