/** A calendar month in the `YYYY-MM` format. */
export type MonthKey = `${number}-${string}`;

const pad = (value: number): string => String(value).padStart(2, '0');

export function toMonthKey(date: Date): MonthKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function currentMonthKey(): MonthKey {
  return toMonthKey(new Date());
}

/** Month key of an ISO date string (`2026-04-15` -> `2026-04`). */
export function monthKeyOf(isoDate: string): MonthKey {
  return isoDate.slice(0, 7) as MonthKey;
}

export function addMonths(month: MonthKey, amount: number): MonthKey {
  const [year, monthIndex] = parseMonthKey(month);
  return toMonthKey(new Date(year, monthIndex + amount, 1));
}

/** Returns `count` consecutive months ending at (and including) `end`, oldest first. */
export function lastMonths(end: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, index) => addMonths(end, index - count + 1));
}

/** First day of the month as a local `Date`. */
export function monthStart(month: MonthKey): Date {
  const [year, monthIndex] = parseMonthKey(month);
  return new Date(year, monthIndex, 1);
}

function parseMonthKey(month: MonthKey): [number, number] {
  const [year, monthNumber] = month.split('-').map(Number);
  return [year, monthNumber - 1];
}

/** Formats a local date as `YYYY-MM-DD` without converting to UTC. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses `YYYY-MM-DD` into a local `Date` (midnight), avoiding the UTC shift of `new Date(iso)`. */
export function fromIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  return toIsoDate(fromIsoDate(value)) === value;
}
