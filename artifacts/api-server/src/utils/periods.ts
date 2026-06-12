export function getWeekPeriod(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil((((d.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
  return `${year}-W${weekNum.toString().padStart(2, "0")}`;
}

export function getMonthPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}`;
}

export function getWeekRange(period: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = period.split("-W");
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() || 7) - 1));
  const start = new Date(startOfWeek1);
  start.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}

export function getMonthRange(period: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1;
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  return { start, end };
}

export function getPreviousWeekPeriod(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return getWeekPeriod(d);
}

export function getPreviousMonthPeriod(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return getMonthPeriod(d);
}

export function formatPeriodLabel(period: string): string {
  if (period.includes("-W")) {
    const [yearStr, weekStr] = period.split("-W");
    return `Week ${parseInt(weekStr)}, ${yearStr}`;
  } else {
    const [yearStr, monthStr] = period.split("-");
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
}
