export type AccommodationSearchForm = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: string;
};

export function hasActiveAccommodationSearch(params: {
  location?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
}): boolean {
  return Boolean(params.location && params.checkIn && params.checkOut);
}

export function formatSearchDateRange(checkIn: string, checkOut: string): string {
  if (!checkIn) return "Add dates";
  if (!checkOut) return formatShortDate(checkIn);

  const inDate = parseISODate(checkIn);
  const outDate = parseISODate(checkOut);
  if (!inDate || !outDate) return "Add dates";

  const sameYear = inDate.getFullYear() === outDate.getFullYear();
  const inStr = inDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const outStr = outDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${inStr} – ${outStr}`;
}

export function formatGuestLabel(guests: string): string {
  const count = parseInt(guests, 10);
  if (!guests || Number.isNaN(count)) return "Add guests";
  if (count >= 6) return "6+ guests";
  return `${count} guest${count === 1 ? "" : "s"}`;
}

function formatShortDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parseISODate(iso: string): Date | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function buildAccommodationSearchParams(form: AccommodationSearchForm): URLSearchParams {
  return new URLSearchParams({
    location: form.location,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    guests: form.guests,
  });
}

export function validateAccommodationSearch(form: AccommodationSearchForm): string | null {
  if (!form.location || !form.checkIn || !form.checkOut || !form.guests) {
    return "Please fill in all fields";
  }

  const checkInDate = new Date(form.checkIn);
  const checkOutDate = new Date(form.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return "Check-in date must be today or later";
  }

  if (checkOutDate <= checkInDate) {
    return "Check-out date must be after check-in date";
  }

  return null;
}
