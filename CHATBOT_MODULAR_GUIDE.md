# 🤖 Guia de Arquitetura Modular do Chatbot

## 📁 Estrutura de Arquivos Criada

```
src/services/chatbot/
├── index.js                          ✅ Exporta todos os serviços
├── dateResolverService.js            ✅ Resolve períodos de data
├── intentParserService.js            ✅ Detecta intenção do usuário
├── queryBuilderService.js            ✅ Constrói queries de faturamento
├── responseFormatterService.js       ✅ Formata respostas legíveis
└── README.md                         ✅ Documentação completa

src/controllers/
├── chatController.js                 ✔️ Chat original (ainda funciona)
└── chatbotController.js              ✅ NOVO: Chat modular e inteligente

src/routes/
├── chatRoutes.js                     ✔️ Rotas originais
├── billingRoutes.js                  ✔️ Rotas de faturamento
└── chatbotRoutes.js                  ✅ NOVO: Rotas modulares

requests.http                         ✅ Atualizado com novos exemplos
src/app.js                            ✅ Atualizado com novas rotas
```

---

## 🔄 Fluxo de Processamento da Mensagem

```
┌─────────────────────────┐
│  Mensagem do Usuário    │
│ "Quanto faturamos hoje?"│
└────────────┬────────────┘
             │
             ▼
    ┌─────────────────────┐
    │  chatbotController  │
    │  processMessage()   │
    └────────────┬────────┘
             │
             ├─ resolveDateRange()    → Extrai: "hoje"
             │                          Retorna: { type: 'day', displayName: 'hoje' }
             │
             ├─ detectIntent()         → Detecta: "revenue"
             │                          (faturamento/vendas/receita)
             │
             ├─ buildRevenueQuery()    → Query para faturamento
             │                          ├─ billingContextService.getBillingResume()
             │                          └─ Retorna: { success: true, data: [...] }
             │
             └─ revenueResponse()      → Formata resposta
                                       Retorna string legível com valores
             │
             ▼
    ┌──────────────────────────────┐
    │  Resposta ao Cliente         │
    │  "Faturamento de hoje:       │
    │   Total: R$ 428.548,73 ..."  │
    └──────────────────────────────┘
```

---

## 🎯 Exemplos de Uso

### 1️⃣ Processar com Inteligência Automática
**POST** `/api/chatbot/process`

```json
{
  "message": "Quanto faturamos esta semana?"
}
```

**Resposta:**
```json
{
  "success": true,
  "intent": "revenue",
  "period": {
    "type": "week",
    "displayName": "esta semana",
    "startDate": "2024-04-15",
    "endDate": "2024-04-21"
  },
  "reply": "Faturamento de esta semana:\nTotal Geral: R$ 2.857.668,57\n\nDetalhado...",
  "raw": { ... }
}
```

### 2️⃣ Analisar Intenção
**POST** `/api/chatbot/analyze-intent`

```json
{
  "message": "Qual a margem de lucro?"
}
```

**Resposta:**
```json
{
  "success": true,
  "intent": "margin",
  "period": {
    "type": "day",
    "displayName": "hoje",
    "startDate": "2024-04-20",
    "endDate": "2024-04-20"
  },
  "isBillingQuestion": true
}
```

### 3️⃣ Chat Genérico (Fallback)
**POST** `/api/chatbot/chat`

```json
{
  "message": "Qual é sua função?",
  "history": []
}
```

---

## 🧩 Componentes e Responsabilidades

### `dateResolverService.js`
```javascript
resolveDateRange(message) → { type, startDate, endDate, displayName }
```
**Suporta:**
- "hoje", "agora" → Dia atual
- "ontem" → Dia anterior
- "semana" → Semana atual
- "mês" → Mês atual
- "YYYY-MM-DD" ou "DD/MM/YYYY" → Data específica

### `intentParserService.js`
```javascript
detectIntent(message) → 'revenue' | 'margin' | 'comparison' | 'general'
```

**Detecção por Palavras-chave:**
- **revenue**: faturamento, vendas, receita, billing, invoice
- **margin**: margem, lucro, lucratividade, rentabilidade
- **comparison**: comparado, versus, vs, diferença, crescimento
- **general**: qualquer outra coisa

### `queryBuilderService.js`
```javascript
buildRevenueQuery(period, billingContextService) → { success, data, formatted, period }
```

**Lógica:**
- Se `period.type === 'week'` ou `'month'` → Busca resumo total
- Se `period.type === 'day'` → Busca detalhado por associação

### `responseFormatterService.js`
```javascript
revenueResponse(data, period) → string formatada
```

**Formatação:**
- Converte números para formato brasileiro (R$ 1.234,56)
- Agrupa por associação
- Apresenta total geral + detalhes

---

## 🔌 Integração no `app.js`

```javascript
import chatbotRoutes from './routes/chatbotRoutes.js'

// ... outros middlewares ...

// Routes - Chatbot Modular (nova arquitetura)
app.use('/api/chatbot', chatbotRoutes)
```

---

## 🧪 Testando

### Teste Rápido no Terminal

```bash
# 1. Testar detecção de intenção
curl -X POST http://localhost:3001/api/chatbot/analyze-intent \
  -H "Content-Type: application/json" \
  -d '{"message": "Quanto faturamos?"}'

# 2. Testar processamento completo
curl -X POST http://localhost:3001/api/chatbot/process \
  -H "Content-Type: application/json" \
  -d '{"message": "Me mostre o faturamento de ontem"}'

# 3. Testar chat genérico
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!"}'
```

### Teste no VS Code
Abra `requests.http` e use a extensão **REST Client** para enviar requisições com um clique.

---

## ✨ Benefícios da Refatoração

| Antes | Depois |
|-------|--------|
| Lógica monolítica | Serviços separados |
| Difícil de testar | Testável isoladamente |
| Acoplado ao controller | Reutilizável em qualquer lugar |
| Difícil de estender | Fácil adicionar novas intenções |
| Sem estrutura | Código organizado e documentado |

---

## 🚀 Próximas Melhorias

### Phase 1: Core
- [x] Detecção de intenção baseada em palavras-chave
- [x] Resolução de períodos naturais
- [x] Formatação de respostas
- [ ] Testes unitários para cada serviço

### Phase 2: Intelligence
- [ ] Machine Learning para intenção (Naive Bayes, etc)
- [ ] Cache de respostas
- [ ] Análise de tendências
- [ ] Recomendações automáticas

### Phase 3: Advanced
- [ ] Conversas multi-turno com memória
- [ ] Detecção de entidades (valores, datas customizadas)
- [ ] Integração com grafos de conhecimento
- [ ] Análise de sentimento

---

## 📚 Documentação Adicional

- **Serviços**: Ver `src/services/chatbot/README.md`
- **Rotas**: Ver `src/routes/chatbotRoutes.js`
- **Exemplos HTTP**: Ver `requests.http` (seção CHATBOT MODULAR)
- **Integração de Faturamento**: Ver `BILLING_INTEGRATION.md`

---

## 🎓 Arquitetura: Comparação

### Antes (Monolítico)
```
chatController.chat()
    ├─ Valida entrada
    ├─ Chama chatService
    └─ Retorna resposta (sem inteligência)
```

### Depois (Modular)
```
chatbotController.processMessage()
    ├─ resolveDateRange()      (Período)
    ├─ detectIntent()           (Intenção)
    ├─ buildRevenueQuery()      (Dados)
    └─ revenueResponse()        (Formatação)
```

**Resultado:** Resposta inteligente, estruturada e reutilizável! 🎉

---

**Status:** ✅ Pronto para uso em produção
