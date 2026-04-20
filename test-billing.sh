#!/bin/bash

# Script de teste da integração de faturamento

echo "🧪 Testando Integração de Faturamento"
echo ""

API_URL="http://localhost:3001"

# Teste 1: Health Check
echo "1️⃣  Health Check do Backend"
curl -s "$API_URL/health" | jq .
echo ""

# Teste 2: Chat Health
echo "2️⃣  Chat Health (Ollama)"
curl -s "$API_URL/api/chat/health" | jq .
echo ""

# Teste 3: Pergunta Simples
echo "3️⃣  Chat Simples"
curl -s -X POST "$API_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá! Quem é você?"
  }' | jq .
echo ""

# Teste 4: Pergunta sobre Faturamento
echo "4️⃣  Chat com Faturamento (Automático)"
curl -s -X POST "$API_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quanto faturamos hoje?",
    "includeBillingContext": true
  }' | jq .
echo ""

# Teste 5: Verificar Pergunta
echo "5️⃣  Verificar Tipo de Pergunta"
curl -s -X POST "$API_URL/api/billing/check-question" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual o total de vendas?"
  }' | jq .
echo ""

# Teste 6: Query de Faturamento
echo "6️⃣  Query Direta de Faturamento"
curl -s -X POST "$API_URL/api/billing/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Quanto faturamos?"
  }' | jq .
echo ""

echo "✅ Testes concluídos!"
