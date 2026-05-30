/** Hour stored as 0–23 (e.g. 15 = 3:00 PM), matching admin property settings. */
export function formatPropertyCheckTime(hour: number | null | undefined): string | null {
  if (hour == null || !Number.isFinite(Number(hour))) return null;
  const h = ((Math.round(Number(hour)) % 24) + 24) % 24;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:00 ${period}`;
}

export function resolvePropertyCheckTimes(attributes?: {
  check_in_time?: number | null;
  check_out_time?: number | null;
} | null): { checkIn: string | null; checkOut: string | null } {
  const checkIn = formatPropertyCheckTime(attributes?.check_in_time ?? 15);
  const checkOut = formatPropertyCheckTime(attributes?.check_out_time ?? 11);
  return { checkIn, checkOut };
}
