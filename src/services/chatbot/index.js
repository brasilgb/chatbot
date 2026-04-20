/**
 * Módulo centralizado de serviços para o chatbot
 * Exporta todos os serviços de análise e formatação
 */

export { resolveDateRange } from './dateResolverService.js'
export { detectIntent } from './intentParserService.js'
export { buildRevenueQuery } from './queryBuilderService.js'
export { revenueResponse } from './responseFormatterService.js'

import { resolveDateRange } from './dateResolverService.js'
import { detectIntent } from './intentParserService.js'
import { buildRevenueQuery } from './queryBuilderService.js'
import { revenueResponse } from './responseFormatterService.js'

export default {
  resolveDateRange,
  detectIntent,
  buildRevenueQuery,
  revenueResponse,
}
