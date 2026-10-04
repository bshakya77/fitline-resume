const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const UNIT_MS: Record<string, number> = {
  minute: 60_000,
  hour: 3_600_000,
  day: DAY_MS,
  week: 7 * DAY_MS,
  month: MONTH_MS,
};

/** Reads an ISO timestamp, a US date, or a relative age such as "5 days ago". */
export function parsePostedAt(value: string, now = Date.now()): number | null {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return null;
  const relative = /\b(\d+)\s+(minute|hour|day|week|month)s?\s+ago\b/i.exec(text);
  if (relative) {
    const amount = Number(relative[1]);
    const step = UNIT_MS[relative[2].toLowerCase()];
    if (!step || !Number.isFinite(amount)) return null;
    return now - amount * step;
  }
  const us = /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/.exec(text);
  if (us) {
    let year = Number(us[3]);
    if (year < 100) year += 2000;
    const month = Number(us[1]);
    const day = Number(us[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return Date.UTC(year, month - 1, day, 12);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [year, month, day] = text.split("-").map(Number);
    return Date.UTC(year, month - 1, day, 12);
  }
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function postedWithinMonth(postedAt: number, now = Date.now()): boolean {
  return postedAt <= now + DAY_MS && now - postedAt <= MONTH_MS;
}
