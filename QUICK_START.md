# 🎯 Quick Start - Como Usar a Integração de Faturamento

## 1️⃣ Iniciar o Backend

```bash
cd /home/anderson/projects/nodejs/chatbot

# Garantir que Ollama está rodando (em outro terminal)
ollama serve

# Instalar dependências (primeira vez)
npm install

# Iniciar servidor
npm start
# ou para desenvolvimento:
npm run dev
```

Você verá:
```
🚀 Backend chatbot rodando na porta 3001
📝 Environment: development
🤖 Ollama URL: http://127.0.0.1:11434
🧠 Model: gemma3:4b
```

## 2️⃣ Testar a API

### Opção A: Usar requests.http (VS Code)

1. Abra o arquivo `requests.http`
2. Clique em "Send Request" acima de cada exemplo
3. Veja o resultado no painel de saída

### Opção B: Usar o script de teste

```bash
chmod +x test-billing.sh
./test-billing.sh
```

### Opção C: Usar curl

**Chat Simples:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá! Tudo bem?"
  }'
```

**Chat com Faturamento (automático):**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quanto faturamos hoje?",
    "includeBillingContext": true
  }'
```

**Query de Faturamento:**
```bash
curl -X POST http://localhost:3001/api/billing/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual o total de faturamento?",
    "type": "total"
  }'
```

**Verificar Tipo de Pergunta:**
```bash
curl -X POST http://localhost:3001/api/billing/check-question \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quanto vendemos este mês?"
  }'
```

## 3️⃣ Integrar com Frontend Next.js

### Instalar Next.js

```bash
# Em uma pasta diferente
cd ~/projects
npx create-next-app@latest chatbot-frontend --typescript --tailwind

cd chatbot-frontend
```

### Criar arquivo .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Copiar código do FRONTEND.md

No arquivo `FRONTEND.md` tem exemplos prontos para:
- Hook `useChat`
- Componentes React (`ChatBox`, `MessageList`, `MessageInput`)
- Configuração de CORS

### Executar Frontend

```bash
npm run dev
# Acesse http://localhost:3000
```

## 4️⃣ Fluxo Completo de Uso

```
User abre http://localhost:3000
    ↓
    Vê interface de chat
    ↓
    Digita: "Qual foi o faturamento de hoje?"
    ↓
    Frontend faz POST para http://localhost:3001/api/chat
    ↓
    Backend processa:
    - Detecta pergunta sobre faturamento
    - Busca dados do servidor Solar
    - Passa para Gemma com contexto
    ↓
    Backend responde:
    {
      "reply": "Baseado nos dados de hoje...",
      "hasBillingData": true,
      "billingData": { ... }
    }
    ↓
    Frontend exibe resposta + dados (opcional)
```

## 5️⃣ Comandos Úteis

```bash
# Verificar se servidor está rodando
curl http://localhost:3001/health

# Ver models disponíveis no Ollama
curl http://localhost:3001/api/chat/health

# Listar modelos instalados
ollama list

# Puxar novo modelo
ollama pull gemma3:4b
ollama pull qwen2.5-coder:3b

# Testar Ollama diretamente
curl -X POST http://127.0.0.1:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma3:4b",
    "messages": [{"role": "user", "content": "Olá!"}],
    "stream": false
  }'
```

## 6️⃣ Estrutura de Pastas Recomendada

```
~/projects/
├── nodejs/
│   └── chatbot/              ← Backend (já existe)
│       ├── src/
│       ├── server.js
│       └── package.json
│
└── chatbot-frontend/         ← Frontend (criar)
    ├── app/
    ├── components/
    ├── lib/
    ├── package.json
    └── .env.local
```

## 7️⃣ Troubleshooting

### Porta 3001 em uso
```bash
# Encontrar processo
lsof -i :3001
# Matar
kill -9 <PID>
```

### Ollama não responde
```bash
# Iniciar Ollama
ollama serve

# Em outro terminal, puxar modelo
ollama pull gemma3:4b
```

### CORS Error
- Verifique se `FRONTEND_URL` no `.env` está correto
- Padrão: `http://localhost:3000`

### Import Error
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

## 8️⃣ Arquivos Importantes

| Arquivo | Função |
|---------|--------|
| `server.js` | Entry point |
| `src/app.js` | Express app |
| `src/services/chatService.js` | Integração Ollama |
| `src/services/billingContextService.js` | Integração Faturamento |
| `README.md` | Documentação completa |
| `BILLING_INTEGRATION.md` | Detalhes técnicos |
| `FRONTEND.md` | Guia Next.js |
| `requests.http` | Exemplos de requisições |

## 9️⃣ Endpoints Resumido

| Método | Endpoint | O que faz |
|--------|----------|-----------|
| GET | `/health` | Verifica se backend está ativo |
| GET | `/api/chat/health` | Verifica Ollama + modelos |
| POST | `/api/chat` | Chat com auto-contexto de faturamento |
| POST | `/api/chat/stream` | Chat em tempo real (SSE) |
| GET | `/api/billing/resumo-faturamento` | Dados de faturamento |
| POST | `/api/billing/query` | Query direta |
| POST | `/api/billing/check-question` | Verifica tipo de pergunta |

## 🔟 Próximas Etapas

1. ✅ Backend rodando
2. ⏭️ Criar frontend Next.js (see FRONTEND.md)
3. ⏭️ Integrar componentes
4. ⏭️ Testar fluxo completo
5. ⏭️ Deploy em produção

---

**Dúvidas?** Veja os arquivos de documentação:
- `README.md` - Completo e detalhado
- `BILLING_INTEGRATION.md` - Técnico
- `FRONTEND.md` - Next.js específico
- `ARCHITECTURE.md` - Estrutura visual
