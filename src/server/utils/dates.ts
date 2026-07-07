export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function endOfMonth(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
}

export function isValidDateRange(start: Date, end: Date): boolean {
  return start.getTime() < end.getTime();
}

export function toDateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

/** Inclusive start and exclusive end for a YYYY-MM billing month (UTC date bounds). */
export function monthBoundsFromYYYYMM(yyyyMm: string): {
  start: Date;
  endExclusive: Date;
} {
  const [year, month] = yyyyMm.split("-").map(Number);
  const start = toDateOnly(`${yyyyMm}-01`);
  const endExclusive =
    month === 12
      ? toDateOnly(`${year + 1}-01-01`)
      : toDateOnly(`${year}-${String(month + 1).padStart(2, "0")}-01`);

  return { start, endExclusive };
}

export function currentMonthYYYYMM(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
