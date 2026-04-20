import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const OLLAMA_URL = 'http://127.0.0.1:11434'
const MODEL = 'gemma3:4b'

app.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`)
    if (!response.ok) {
      return res.status(500).json({ ok: false, ollama: false })
    }

    const data = await response.json()
    return res.json({ ok: true, ollama: true, models: data.models ?? [] })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      ollama: false,
      error: error.message,
    })
  }
})

app.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida' })
    }

    const messages = [
      {
        role: 'system',
        content:
          'Você é um assistente para atendimento de chatbot. Responda em português do Brasil, de forma clara e objetiva.',
      },
      ...history,
      {
        role: 'user',
        content: message,
      },
    ]

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
      }),
    })

    if (!ollamaResponse.ok) {
      const text = await ollamaResponse.text()
      return res.status(500).json({
        error: 'Erro ao consultar Ollama',
        details: text,
      })
    }

    const data = await ollamaResponse.json()

    return res.json({
      reply: data?.message?.content ?? '',
      raw: data,
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: error.message,
    })
  }
})

app.listen(3001, () => {
  console.log('API IA rodando na porta 3001')
})