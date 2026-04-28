import billingContextService from '../services/billingContextService.js'

async function test() {
  console.log('Testing billing context prompt generation...')
  
  const questions = [
    'Qual o faturamento de hoje?',
    'Como foram as vendas ontem?',
    'Oi, tudo bem?'
  ]

  for (const q of questions) {
    console.log(`\nQuestion: "${q}"`)
    try {
      const isBilling = billingContextService.isBillingQuestion(q)
      console.log(`Is billing: ${isBilling}`)
      
      if (isBilling) {
        const prompt = await billingContextService.createBillingContextPrompt(q)
        console.log('Generated Prompt snippet:', prompt?.substring(0, 200) + '...')
      }
    } catch (error) {
      console.error(`Error for "${q}":`, error.message)
    }
  }
}

test()
