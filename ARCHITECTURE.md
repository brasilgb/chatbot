```
📦 chatbot-backend/
├── 📄 server.js                          # Entry point
├── 📄 package.json                       # Dependencies
├── 📄 .env.example                       # Environment template
├── 📄 .env                               # Local config (git-ignored)
├── 📄 .gitignore
├── 📄 Dockerfile                         # Container setup
├── 📄 docker-compose.yml                 # Ollama + Backend
├── 📄 setup.sh                          # Setup script
├── 📄 test-billing.sh                   # Test script
│
├── 📚 Documentation
│   ├── 📖 README.md                     # Full documentation
│   ├── 📖 BILLING_INTEGRATION.md        # Billing integration details
│   ├── 📖 FRONTEND.md                   # Next.js integration guide
│   └── 📖 IMPLEMENTATION_SUMMARY.md     # What was done
│
├── 🔧 Configuration
│   ├── 📄 config/
│   │   └── birelClient.js              # Solar server client (ESM)
│   └── 📄 utils/
│       └── date.js                     # Date utilities (ESM)
│
├── 🚀 src/ (New modular structure)
│   ├── app.js                          # Express app with all routes
│   │
│   ├── controllers/
│   │   ├── chatController.js           # Chat endpoints
│   │   └── billingQueryController.js   # Billing queries
│   │
│   ├── routes/
│   │   ├── chatRoutes.js               # /api/chat routes
│   │   └── billingRoutes.js            # /api/billing routes
│   │
│   ├── services/
│   │   ├── chatService.js              # Chat + Ollama integration
│   │   ├── billingContextService.js    # ⭐ NEW: Billing context
│   │   └── [old structure below]
│   │
│   ├── middlewares/
│   │   └── index.js                    # Logging, CORS, rate limit
│   │
│   └── utils/
│       └── chatUtils.js                # Chat utilities
│
├── ☀️ Legacy Solar Structure (ESM converted)
│   ├── config/
│   │   └── birelClient.js              # Solar authentication
│   │
│   ├── controllers/
│   │   └── solar/
│   │       └── faturamento/
│   │           └── resumoFaturamentoController.js
│   │
│   ├── routes/
│   │   └── resumoFaturamentoRouters.js
│   │
│   ├── services/
│   │   └── solar/
│   │       └── faturamento/
│   │           ├── resumoFaturamentoService.js
│   │           └── resumoFaturamentoTotalService.js
│   │
│   └── utils/
│       └── date.js
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
```

## 📊 Data Flow

```
User → [Frontend/API] → POST /api/chat
                            ↓
                    [ChatController]
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
        │   └─→ birelClient.js (Solar)
        ├─→ resumoFaturamentoTotalService.js
        │   └─→ birelClient.js (Solar)
        └─→ date.js (dayjs)
```

## 📈 Statistics

- **Total Routes**: 8 endpoints
- **Total Services**: 3 (chat, billing context, legacy)
- **Total Controllers**: 2 (chat, billing)
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

## 🚀 Deployment Ready

- Docker support (Dockerfile + docker-compose.yml)
- Environment configuration (.env)
- Error handling and logging
- Rate limiting
- CORS security
- Health endpoints for monitoring
