export function revenueResponse(total, period) {
  return `
O faturamento entre ${period.from} e ${period.to}
foi de R$ ${Number(total).toLocaleString("pt-BR", {
  minimumFractionDigits: 2
})}.
`;
}