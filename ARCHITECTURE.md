```
📦 chatbot-backend/
├── 📄 server.js                          # Entry point
├── 📄 package.json                       # Dependencies
├── 📄 .env.example                       # Environment template
├── 📄 .env                               # Local config (git-ignored)
├── 📄 .gitignore
├── 📄 setup.sh                          # Setup script
├── 📄 test-billing.sh                   # Test script
│
├── 📚 Documentation
│   ├── 📖 README.md                     # Full documentation
│   ├── 📖 BILLING_INTEGRATION.md        # Billing integration details
│   ├── 📖 FRONTEND.md                   # Next.js integration guide
│   └── 📖 IMPLEMENTATION_SUMMARY.md     # What was done
│
├── 🚀 src/
│   ├── app.js                          # Express app with all routes
│   │
│   ├── config/
│   │   └── birelClient.js              # Solar server client (ESM)
│   │
│   ├── controllers/
│   │   ├── chatController.js           # Chat endpoints
│   │   ├── billingQueryController.js   # Billing queries
│   │   ├── whatsappController.js       # WhatsApp webhook
│   │   └── solar/faturamento/          # Solar billing controllers
│   │
│   ├── routes/
│   │   ├── chatRoutes.js               # /api/chat routes
│   │   ├── billingRoutes.js            # /api/billing routes
│   │   └── whatsappRoutes.js           # /api/whatsapp routes
│   │
│   ├── services/
│   │   ├── chatService.js              # Chat + Ollama integration
│   │   ├── billingContextService.js    # Billing context
│   │   ├── whatsappService.js          # WhatsApp Cloud API
│   │   └── solar/faturamento/          # Solar billing services
│   │
│   ├── middlewares/
│   │   └── index.js                    # Logging, CORS, rate limit
│   │
│   └── utils/
│       ├── date.js                     # Date utilities
│       └── chatUtils.js                # Chat utilities
│
└── 🧪 Testing
    └── requests.http                   # HTTP request examples

```

## 🔗 Routing Architecture

```
GET  /health
     ├─→ Server status

GET  /api/chat/health
     └─→ Ollama status + available models

POST /api/chat
     ├─→ Message with auto billing context
     ├─→ Params: message, history, includeBillingContext
     └─→ Response: reply + billingData (if applicable)

POST /api/chat/stream
     └─→ Real-time streaming response (SSE)

GET  /api/billing/resumo-faturamento
     └─→ Billing summary for date

GET  /api/billing/resumo-faturamento-total
     └─→ Total billing for date

POST /api/billing/query
     ├─→ Direct billing query
     └─→ Params: question, type, date

POST /api/billing/check-question
     └─→ Verify if message is about billing

GET  /api/whatsapp/webhook
     └─→ Meta webhook verification

POST /api/whatsapp/webhook
     └─→ Receives WhatsApp messages and replies using chatService
```

## 📊 Data Flow

```
User → [Frontend/API or WhatsApp] → POST /api/chat or /api/whatsapp/webhook
                            ↓
                    [ChatController or WhatsAppController]
                            ↓
                    [ChatService.chat()]
                            ↓
            [Is billing question?] ← [BillingContextService]
                   ↓          ↓
                  YES        NO
                   ↓         ↓
            [Fetch Data]    [Default]
            from Solar      Prompt
                   ↓         ↓
                  └─→[Format Context]
                         ↓
                  [Build Messages]
                  [System + Context]
                  [History + User]
                         ↓
                  [Ollama/Gemma]
                         ↓
                  [Parse Response]
                         ↓
                  [Add BillingData]
                  (if applicable)
                         ↓
                  [Return Response] → User
```

## 🧠 Billing Context Detection

```
Input Message
    ↓
Contains Keyword? ┌─────────────────────────────┐
    ├─ faturamento    │                             │
    ├─ fatura         │  YES → Fetch Solar Data     │
    ├─ vendas         │        Format for Context   │
    ├─ receita        │        Pass to Gemma        │
    ├─ valor faturado │                             │
    ├─ total faturado │                             │
    ├─ billing        │                             │
    └─ invoice        └─────────────────────────────┘
          ↓
          NO → Use Default System Prompt
              (No billing context)
```

## 🔄 Service Dependencies

```
chatController.js
    ↓
chatService.js
    ├─→ Ollama (fetch)
    └─→ billingContextService.js
        ├─→ resumoFaturamentoService.js
        │   └─→ src/config/birelClient.js (Solar)
        ├─→ resumoFaturamentoTotalService.js
        │   └─→ src/config/birelClient.js (Solar)
        └─→ src/utils/date.js (dayjs)
```

## 📈 Statistics

- **Total Routes**: 10 endpoints
- **Total Services**: chat, billing context, WhatsApp, chatbot helpers and Solar billing services
- **Total Controllers**: 3 (chat, billing, whatsapp)
- **Middlewares**: 3 (logging, validation, rate limit)
- **ESM Modules**: 100% (including legacy code)
- **Code Lines**: ~1000+ (services + controllers + routes)

## ✨ Key Features

✅ Auto-detect billing questions
✅ Fetch real Solar data
✅ Format data for LLM context
✅ Eliminate hallucinations
✅ Handle streaming responses
✅ Rate limiting (production)
✅ CORS configured for Next.js
✅ Error handling
✅ Health checks
✅ Session management with Solar
✅ WhatsApp Business webhook support

## 🚀 Bare Metal Ready

- Backend Node.js on `127.0.0.1:3001`
- Ollama on `127.0.0.1:11434`
- Nginx proxy for `/api` and `/health`
- Environment configuration (.env)
- Error handling and logging
- Rate limiting
- CORS security
- Health endpoints for monitoring
