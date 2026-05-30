export type BlockedDateRow = {
  date: string;
  blocked_reason?: string | null;
  available?: boolean;
};

/** Airbnb manual blocks — not confirmed guest reservations. */
export function isSoftCalendarBlock(reason: string | null | undefined): boolean {
  return /not available/i.test(reason ?? "");
}

export function isHardCalendarBlock(reason: string | null | undefined): boolean {
  return !isSoftCalendarBlock(reason);
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Stay nights: check-in inclusive, check-out exclusive. */
export function enumerateStayNights(startDate: string, endDate: string): string[] {
  const nights: string[] = [];
  let current = startDate;
  while (current < endDate) {
    nights.push(current);
    current = addDaysYmd(current, 1);
  }
  return nights;
}

/**
 * Confirmed reservations always block a stay. Manual "Not available" blocks only
 * block when every night in the stay is covered (e.g. host closed the whole period).
 */
export function evaluateStayAvailability(
  blockedDates: BlockedDateRow[],
  startDate: string,
  endDate: string
): { available: boolean; blockingDates: BlockedDateRow[] } {
  const stayNights = enumerateStayNights(startDate, endDate);
  const byDate = new Map(blockedDates.map((row) => [row.date, row]));

  const blockingDates = stayNights
    .map((date) => byDate.get(date))
    .filter((row): row is BlockedDateRow => !!row);

  const hardBlocks = blockingDates.filter((row) => isHardCalendarBlock(row.blocked_reason));
  if (hardBlocks.length > 0) {
    return { available: false, blockingDates: hardBlocks };
  }

  const softBlocks = blockingDates.filter((row) => isSoftCalendarBlock(row.blocked_reason));
  if (softBlocks.length === stayNights.length && stayNights.length > 0) {
    return { available: false, blockingDates: softBlocks };
  }

  return { available: true, blockingDates: [] };
}

/** Hide isolated single-day manual Airbnb blocks from calendar UI. */
export function filterCalendarBlockedDates(blockedDates: BlockedDateRow[]): BlockedDateRow[] {
  if (blockedDates.length === 0) return blockedDates;

  const sorted = [...blockedDates].sort((a, b) => a.date.localeCompare(b.date));
  const dateSet = new Set(sorted.map((row) => row.date));

  return sorted.filter((row) => {
    if (isHardCalendarBlock(row.blocked_reason)) return true;

    const prev = addDaysYmd(row.date, -1);
    const next = addDaysYmd(row.date, 1);
    const prevSoft = dateSet.has(prev) && isSoftCalendarBlock(
      sorted.find((r) => r.date === prev)?.blocked_reason
    );
    const nextSoft = dateSet.has(next) && isSoftCalendarBlock(
      sorted.find((r) => r.date === next)?.blocked_reason
    );

    return prevSoft || nextSoft;
  });
}
