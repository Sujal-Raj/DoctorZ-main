// src/utils/date.ts
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDayShort(date: Date) {
  // e.g., Mon, Tue
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function formatDateNumber(date: Date) {
  // e.g., 27
  return date.getDate().toString().padStart(2, "0");
}

export function formatFullDate(date: Date) {
  // e.g., 27 Sep, 2025
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function timeToDisplay(timeStr: string) {
  // "09:00" -> "09:00 AM" simplified
  const [hh, mm] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hh, mm);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// generate next N days as Date[]
export function nextNDays(n: number) {
  const arr: Date[] = [];
  const today = new Date();
  for (let i = 0; i < n; i++) arr.push(addDays(today, i));
  return arr;
}
