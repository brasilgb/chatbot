import 'dotenv/config'
import app from './src/app.js'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'
const NODE_ENV = process.env.NODE_ENV || 'development'

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend chatbot rodando em http://${HOST}:${PORT}`)
  console.log(`📝 Environment: ${NODE_ENV}`)
  console.log(`🤖 Ollama URL: ${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}`)
  console.log(`🧠 Model: ${process.env.MODEL || 'gemma3:4b'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...')
  server.close(() => {
    console.log('Servidor encerrado')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...')
  server.close(() => {
    console.log('Servidor encerrado')
    process.exit(0)
  })
})
