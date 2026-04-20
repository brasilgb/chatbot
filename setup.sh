#!/bin/bash

# Script de inicialização do projeto Chatbot

echo "🚀 Inicializando Chatbot Backend..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "⚠️  Arquivo .env criado. Configure as variáveis antes de continuar."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Edite o arquivo .env se necessário"
echo "   2. Certifique-se de que Ollama está rodando:"
echo "      ollama serve"
echo "   3. Puxe o modelo Gemma (se não tem):"
echo "      ollama pull gemma3:4b"
echo "   4. Inicie o backend:"
echo "      npm start    (produção)"
echo "      npm run dev  (desenvolvimento)"
echo ""
echo "🔗 O backend estará disponível em http://localhost:3001"
