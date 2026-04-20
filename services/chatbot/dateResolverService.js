import dayjs from "dayjs";
import "dayjs/locale/pt-br.js";

dayjs.locale("pt-br");

export function resolveDateRange(text) {
  const today = dayjs();
  const msg = text.toLowerCase();

  if (msg.includes("ontem")) {
    const d = today.subtract(1, "day");
    return { from: d.format("YYYY-MM-DD"), to: d.format("YYYY-MM-DD") };
  }

  if (msg.includes("hoje")) {
    return {
      from: today.format("YYYY-MM-DD"),
      to: today.format("YYYY-MM-DD")
    };
  }

  if (msg.includes("anteontem")) {
    const d = today.subtract(2, "day");
    return { from: d.format("YYYY-MM-DD"), to: d.format("YYYY-MM-DD") };
  }

  if (msg.includes("este mês")) {
    return {
      from: today.startOf("month").format("YYYY-MM-DD"),
      to: today.endOf("month").format("YYYY-MM-DD")
    };
  }

  if (msg.includes("mês passado")) {
    const last = today.subtract(1, "month");
    return {
      from: last.startOf("month").format("YYYY-MM-DD"),
      to: last.endOf("month").format("YYYY-MM-DD")
    };
  }

  if (msg.includes("esta semana")) {
    return {
      from: today.startOf("week").format("YYYY-MM-DD"),
      to: today.endOf("week").format("YYYY-MM-DD")
    };
  }

  return null;
}