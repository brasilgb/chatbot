# 🤖 Serviços de Processamento de Chat Modular

Arquitetura modular para processamento inteligente de mensagens de chat com detecção automática de intenção e período.

## 📋 Serviços

### `dateResolverService.js`
**Função:** `resolveDateRange(message)`

Extrai e normaliza períodos de data a partir de texto em linguagem natural.

```javascript
import { resolveDateRange } from './dateResolverService.js'

const period = resolveDateRange("Quanto faturamos esta semana?")
// Retorna:
// {
//   type: 'week',
//   startDate: '2024-04-15',
//   endDate: '2024-04-21',
//   displayName: 'esta semana'
// }
```

**Períodos Suportados:**
- Hoje, agora, de hoje
- Ontem, de ontem
- Semana (esta semana, essa semana)
- Mês (este mês, esse mês)
- Data específica (YYYY-MM-DD ou DD/MM/YYYY)

---

### `intentParserService.js`
**Função:** `detectIntent(message)`

Detecta a intenção do usuário baseado em palavras-chave.

```javascript
import { detectIntent } from './intentParserService.js'

const intent = detectIntent("Qual foi o faturamento de hoje?")
// Retorna: 'revenue'
```

**Intenções Disponíveis:**
- `'revenue'` - Faturamento, vendas, receita
- `'margin'` - Margem, lucro, lucratividade
- `'comparison'` - Comparação, diferença, crescimento
- `'general'` - Conversa geral (padrão)

---

### `queryBuilderService.js`
**Função:** `buildRevenueQuery(period, billingContextService)`

Constrói a query de dados de faturamento para o período especificado.

```javascript
import { buildRevenueQuery } from './queryBuilderService.js'
import billingContextService from '../billingContextService.js'

const period = {
  type: 'day',
  startDate: '2024-04-20',
  displayName: 'hoje'
}

const query = await buildRevenueQuery(period, billingContextService)
// Retorna:
// {
//   success: true,
//   data: [...dados do faturamento...],
//   formatted: '...formatado...',
//   period: {...}
// }
```

---

### `responseFormatterService.js`
**Função:** `revenueResponse(data, period)`

Formata dados de faturamento em uma resposta legível e bem estruturada.

```javascript
import { revenueResponse } from './responseFormatterService.js'

const period = { displayName: 'hoje' }
const data = [...]

const response = revenueResponse(data, period)
// Retorna uma string formatada:
// "Faturamento de hoje:
// Total Geral: R$ 428.548,73
// ...detalhes..."
```

---

## 🔄 Fluxo de Processamento

```
Mensagem do Usuário
    ↓
[1. resolveDateRange] → Extrai período
    ↓
[2. detectIntent] → Identifica intenção
    ↓
[3. buildRevenueQuery] → Busca dados
    ↓
[4. revenueResponse] → Formata resposta
    ↓
Resposta ao Usuário
```

---

## 📚 Integração no Controller

### Exemplo no `chatbotController.js`

```javascript
import {
  resolveDateRange,
  detectIntent,
  buildRevenueQuery,
  revenueResponse,
} from '../services/chatbot/index.js'

async processMessage(req, res) {
  const { message } = req.body

  // 1. Resolver período
  const period = resolveDateRange(message)

  // 2. Detectar intenção
  const intent = detectIntent(message)

  // 3. Se é sobre faturamento...
  if (intent === 'revenue') {
    const revenueData = await buildRevenueQuery(period, billingContextService)
    const reply = revenueResponse(revenueData.data, period)

    return res.json({
      success: true,
      intent,
      period,
      reply
    })
  }

  // 4. Senão, usar chat genérico
  return res.json(await chatService.chat(message))
}
```

---

## 🧪 Testando

### Via cURL

```bash
# Teste de intenção
curl -X POST http://localhost:3001/api/chatbot/analyze-intent \
  -H "Content-Type: application/json" \
  -d '{"message": "Quanto faturamos esta semana?"}'

# Resposta esperada:
# {
#   "success": true,
#   "intent": "revenue",
#   "period": {
#     "type": "week",
#     "displayName": "esta semana",
#     ...
#   }
# }
```

### Via JavaScript

```javascript
import { resolveDateRange, detectIntent } from './services/chatbot/index.js'

// Testes rápidos
console.log(resolveDateRange("Quanto faturamos em 2024-04-20?"))
console.log(detectIntent("Qual a margem de lucro?"))
```

---

## ✨ Benefícios da Arquitetura Modular

✅ **Separação de Responsabilidades** - Cada serviço tem uma função clara  
✅ **Reutilizável** - Importar apenas os serviços necessários  
✅ **Testável** - Cada função pode ser testada isoladamente  
✅ **Extensível** - Fácil adicionar novas intenções ou períodos  
✅ **Maintível** - Código limpo e bem documentado  

---

## 🔮 Próximas Melhorias

- [ ] Suporte a períodos customizados ("últimos 30 dias", "Q1", etc)
- [ ] Detecção de comparação temporal ("vs mês passado")
- [ ] Cache de resultados de faturamento
- [ ] Análise de tendências
- [ ] Recomendações inteligentes baseadas em dados
