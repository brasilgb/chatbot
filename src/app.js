import express from 'express'
import cors from 'cors'
import { loggerMiddleware, rateLimitMiddleware, jsonValidationMiddleware } from './middlewares/index.js'
import chatRoutes from './routes/chatRoutes.js'
import billingRoutes from './routes/billingRoutes.js'
import chatbotRoutes from './routes/chatbotRoutes.js'
import whatsappRoutes from './routes/whatsappRoutes.js'

const app = express()

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(loggerMiddleware)
}

// Middleware de corpo
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Middleware de validação JSON
// app.use(jsonValidationMiddleware)

// CORS - Configurado para Next.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Rate limiting
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimitMiddleware(60000, 30)) // 30 requisições por minuto
}

// Health check
app.get('/health', (req, res) => {
  return res.json({ status: 'ok', message: 'Backend está rodando' })
})

// Routes - Chat (com integração de faturamento automática)
app.use('/api/chat', chatRoutes)

// Routes - Billing (queries diretas e endpoints de dados)
app.use('/api/billing', billingRoutes)

// Routes - Chatbot Modular (nova arquitetura)
app.use('/api/chatbot', chatbotRoutes)

// Routes - WhatsApp Business Cloud API
app.use('/api/whatsapp', whatsappRoutes)

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err)
  return res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

export default app
