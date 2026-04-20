export function detectIntent(text) {
  const msg = text.toLowerCase();

  if (msg.includes("faturamento")) return "revenue";
  if (msg.includes("compra")) return "purchases";
  if (msg.includes("dre")) return "dre";
  if (msg.includes("lucro")) return "profit";

  return "generic";
}