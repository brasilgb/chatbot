# Backend Chatbot - Configuração e Uso

## 📋 Pré-requisitos

- Node.js 18+
- Ollama instalado e rodando (https://ollama.ai)
- Modelo Gemma instalado no Ollama

## 🚀 Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
```env
PORT=3001
HOST=127.0.0.1
NODE_ENV=development
OLLAMA_URL=http://127.0.0.1:11434
MODEL=gemma3:4b
FRONTEND_URL=http://localhost:3000
```

### 3. Garantir que Ollama está rodando

Se Ollama não está instalado:
```bash
# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# macOS
# Download em https://ollama.ai

# Windows
# Download em https://ollama.ai
```

Puxar o modelo Gemma:
```bash
ollama pull gemma3:4b
# ou
ollama pull gemma2:7b
```

### 4. Iniciar o servidor

**Modo produção:**
```bash
npm start
```

**Modo desenvolvimento (com auto-reload):**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

## 📡 Endpoints da API

### 1. Health Check
```
GET /health
```

Resposta:
```json
{
  "status": "ok",
  "message": "Backend está rodando"
}
```

### 2. Chat - Resposta Simples
```
POST /api/chat
Content-Type: application/json

{
  "message": "Olá, como você funciona?",
  "history": []
}
```

Resposta:
```json
{
  "success": true,
  "reply": "Sou um assistente de IA...",
  "model": "gemma3:4b"
}
```

### 3. Chat - Com Histórico
```
POST /api/chat
Content-Type: application/json

{
  "message": "E qual é seu nome?",
  "history": [
    {
      "role": "user",
      "content": "Olá, como você funciona?"
    },
    {
      "role": "assistant",
      "content": "Sou um assistente de IA..."
    }
  ],
  "includeBillingContext": true
}
```

### 4. Chat - Com Dados de Faturamento (automático) ⭐
Quando você envia uma mensagem sobre faturamento, o sistema **automaticamente** busca os dados reais:

```
POST /api/chat
Content-Type: application/json

{
  "message": "Qual foi o total de faturamento de hoje?",
  "includeBillingContext": true
}
```

**Mensagens que ativam contexto de faturamento:**
- "Quanto faturamos?"
- "Qual o total de vendas?"
- "Me mostre o resumo de faturamento"
- "Quanto foi faturado?"
- Qualquer mensagem contendo: faturamento, fatura, vendas, receita, etc.

Resposta:
```json
{
  "success": true,
  "reply": "Baseado nos dados de hoje, o faturamento total foi de R$ 5.432,10...",
  "model": "gemma3:4b",
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

### 5. Chat - Stream (Server-Sent Events)
```
POST /api/chat/stream
Content-Type: application/json

{
  "message": "Conte uma história",
  "history": [],
  "includeBillingContext": true
}
```

Receberá eventos em tempo real via Server-Sent Events

### 6. Chat - Health Check do Ollama
```
GET /api/chat/health
```

Resposta:
```json
{
  "ok": true,
  "ollama": true,
  "models": [
    {
      "name": "gemma3:4b",
      "modified_at": "2024-01-01T00:00:00Z",
      "size": 1234567
    }
  ]
}
```

### 7. Billing - Resumo de Faturamento
```
GET /api/billing/resumo-faturamento?data=2024-01-01
```

Resposta:
```json
{
  "success": true,
  "data": "20240101",
  "total": 15,
  "results": [...]
}
```

### 8. Billing - Resumo Total
```
GET /api/billing/resumo-faturamento-total?data=2024-01-01
```

### 9. Billing - Query Direta sobre Faturamento
```
POST /api/billing/query
Content-Type: application/json

{
  "question": "Quanto faturamos hoje?",
  "type": "resume",
  "date": "2024-01-01"
}
```

### 10. Billing - Verificar Pergunta sobre Faturamento
```
POST /api/billing/check-question
Content-Type: application/json

{
  "message": "Quanto vendemos este mês?"
}
```

Resposta:
```json
{
  "success": true,
  "message": "Quanto vendemos este mês?",
  "isBillingQuestion": true
}
```

### 11. WhatsApp - Webhook de Verificação
```
GET /api/whatsapp/webhook
```

Este endpoint é usado pela Meta para validar o webhook. Configure no painel do WhatsApp Business:

```txt
https://seu-dominio.com/api/whatsapp/webhook
```

O token informado na Meta deve ser igual ao `WHATSAPP_VERIFY_TOKEN` do `.env`.

### 12. WhatsApp - Recebimento de Mensagens
```
POST /api/whatsapp/webhook
```

A Meta envia mensagens recebidas neste endpoint. O backend extrai mensagens de texto, chama `chatService.chat()` e responde pelo WhatsApp usando a Cloud API.

## 🏢 Integração de Faturamento

O chatbot foi integrado com o sistema de faturamento Solar! Agora ele consegue:

✅ **Detectar automaticamente** quando o usuário pergunta sobre faturamento
✅ **Buscar dados reais** do sistema de faturamento
✅ **Enriquecer respostas** com informações de vendas, receitas e totalizações
✅ **Usar dados de contexto** para respostas mais precisas

### Como Funciona

1. **Detecção Inteligente**: Quando uma mensagem contém palavras como "faturamento", "vendas", "fatura", etc., o sistema:
   - Busca os dados reais no servidor Solar
   - Passa os dados como contexto para o Gemma
   - Retorna uma resposta baseada em dados reais

2. **Sem Alucinations**: O Gemma responde baseado em dados concretos, não em suposições

3. **Palavras-chave Reconhecidas**:
   - faturamento, fatura, faturar, faturas
   - quantidade faturada, total faturado, valor faturado
   - receita, vendas, billing, invoice
   - faturação

### Exemplo de Uso

**Usuário pergunta:**
```
"Qual foi o total de faturamento de hoje?"
```

**Sistema faz internamente:**
1. ✓ Detecta que é pergunta sobre faturamento
2. ✓ Busca dados: GET /api/billing/resumo-faturamento?data=2024-01-20
3. ✓ Passa dados para o Gemma como contexto
4. ✓ Gemma responde com base nos dados reais

**Resposta:**
```
"Baseado nos dados de hoje (20/01/2024), o faturamento total foi de R$ 15.450,32 distribuído em 12 transações. 
Os maiores valores vieram de vendas diretas no período da manhã..."
```

### Desabilitar Contexto de Faturamento

Se quiser que o chatbot responda sem usar dados de faturamento:

```json
POST /api/chat
{
  "message": "Como funciona faturamento em geral?",
  "includeBillingContext": false
}
```

## 🔌 Integração com Next.js

### 1. Criar projeto Next.js

```bash
# Na pasta de projetos
npx create-next-app@latest frontend --typescript --tailwind
cd frontend
```

### 2. Configurar variáveis de ambiente do frontend

Criar `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Em produção com Nginx fazendo proxy no mesmo domínio do frontend, use:

```env
NEXT_PUBLIC_API_URL=/api
```

Se o backend ficar em um subdomínio separado, use a URL pública completa:

```env
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com/api
```

### 3. Criar hook para usar o chat

```typescript
// lib/useChat.ts
import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (content: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            history: messages,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      const data = await response.json()

      if (data.success) {
        setMessages([
          ...messages,
          { role: 'user', content },
          { role: 'assistant', content: data.reply },
        ])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro desconhecido'
      )
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
  }
}
```

### 4. Usar o hook em um componente

```typescript
// app/page.tsx
'use client'

import { useChat } from '@/lib/useChat'
import { useState } from 'react'

export default function Home() {
  const { messages, loading, sendMessage } = useChat()
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white ml-auto max-w-sm'
                : 'bg-gray-300 text-black'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Digite uma mensagem..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}
```

## 🚀 Produção Bare Metal com Nginx

Este projeto foi preparado para rodar direto no servidor, sem Docker:

- Backend Node.js escutando em `http://127.0.0.1:3001`
- Ollama escutando em `http://127.0.0.1:11434`
- Modelo padrão: `gemma3:4b`
- Nginx expondo o backend para o frontend/domínio público

### Variáveis do backend

No `.env` do backend:

```env
PORT=3001
HOST=127.0.0.1
NODE_ENV=production
OLLAMA_URL=http://127.0.0.1:11434
MODEL=gemma3:4b
FRONTEND_URL=https://seu-dominio.com
WHATSAPP_VERIFY_TOKEN=troque_por_um_token_seguro
WHATSAPP_ACCESS_TOKEN=token_da_meta
WHATSAPP_PHONE_NUMBER_ID=id_do_numero
WHATSAPP_API_VERSION=v20.0
```

As variáveis `WHATSAPP_*` são necessárias somente se o canal WhatsApp Business estiver ativo.

### Processo com systemd

Exemplo de unidade em `/etc/systemd/system/chatbot-back.service`:

```ini
[Unit]
Description=Chatbot Backend Ollama
After=network.target

[Service]
Type=simple
WorkingDirectory=/caminho/para/chatbot-back
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Aplicar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable chatbot-back
sudo systemctl start chatbot-back
sudo systemctl status chatbot-back
```

### Nginx

Se o frontend e a API usam o mesmo domínio, publique a API em `/api` e o health check em `/health`:

```nginx
server {
    server_name seu-dominio.com;

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Teste local no servidor:

```bash
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3001/api/chat/health
curl -X POST http://127.0.0.1:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Responda exatamente: TESTE_GEMMA_OK"}'
```

## 📝 Estrutura do Projeto

```
.
├── src/
│   ├── app.js              # Configuração principal do Express
│   ├── controllers/
│   │   ├── chatController.js    # Controladores de chat
│   │   └── solar/               # Controladores de faturamento
│   ├── routes/
│   │   ├── chatRoutes.js        # Rotas de chat
│   │   └── billingRoutes.js     # Rotas de faturamento
│   ├── services/
│   │   ├── chatService.js       # Integração com Ollama
│   │   └── solar/               # Integração Solar
│   ├── config/
│   └── utils/
├── server.js               # Ponto de entrada
├── package.json
├── .env                    # Variáveis de ambiente (local)
├── .env.example           # Template de variáveis
└── README.md
```

## 🔒 Segurança

- Ajuste `FRONTEND_URL` no `.env` para sua URL de produção
- Use HTTPS em produção
- Considere adicionar rate limiting
- Valide e sanitize todas as entradas

## 🐛 Troubleshooting

### Ollama não está respondendo
```bash
# Verifique se Ollama está rodando
curl http://127.0.0.1:11434/api/tags

# Inicie Ollama
ollama serve
```

### Modelo não encontrado
```bash
ollama pull gemma3:4b
```

### Erro de CORS
Verifique se `FRONTEND_URL` no `.env` está correto. Em desenvolvimento, o frontend normalmente usa `http://localhost:3001/api`. Em produção no mesmo domínio via Nginx, use `NEXT_PUBLIC_API_URL=/api`.

## 📚 Recursos Úteis

- [Ollama](https://ollama.ai)
- [Express.js](https://expressjs.com)
- [Next.js](https://nextjs.org)
- [Documentação da API Ollama](https://github.com/jmorganca/ollama/blob/main/docs/api.md)
