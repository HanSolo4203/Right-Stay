import {
  calculateNightsBetween,
  DEFAULT_MINIMUM_STAY_NIGHTS,
} from "@/lib/pricing";

export type AccommodationSearchForm = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: string;
};

export type StoredAccommodationDates = {
  checkIn: string;
  checkOut: string;
  guests?: string;
  location?: string;
};

export type AccommodationSearchParams = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: string;
};

function readSearchParam(
  searchParams: Pick<URLSearchParams, "get"> | null | undefined,
  canonical: string,
  aliases: string[] = []
): string {
  const direct = searchParams?.get(canonical)?.trim();
  if (direct) return direct;

  for (const alias of aliases) {
    const value = searchParams?.get(alias)?.trim();
    if (value) return value;
  }

  return "";
}

/** Read stay-with-us search params, accepting common URL aliases (checkin, checkout, etc.). */
export function readAccommodationSearchParams(
  searchParams: Pick<URLSearchParams, "get"> | null | undefined
): AccommodationSearchParams {
  return {
    location: readSearchParam(searchParams, "location"),
    checkIn: readSearchParam(searchParams, "checkIn", ["checkin", "check-in"]),
    checkOut: readSearchParam(searchParams, "checkOut", ["checkout", "check-out"]),
    guests: readSearchParam(searchParams, "guests") || "2",
  };
}

const ACCOMMODATION_DATES_STORAGE_KEY = "right-stay:accommodation-dates";

let reloadStorageCleared = false;

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultAccommodationDates(): Pick<
  StoredAccommodationDates,
  "checkIn" | "checkOut"
> {
  return {
    checkIn: getTodayISO(),
    checkOut: "",
  };
}

/** Clears persisted search dates on full page reload so the calendar resets to defaults. */
export function clearStoredAccommodationDatesOnPageReload(): void {
  if (typeof window === "undefined" || reloadStorageCleared) return;
  reloadStorageCleared = true;

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (nav?.type === "reload") {
    sessionStorage.removeItem(ACCOMMODATION_DATES_STORAGE_KEY);
  }
}

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

/** Stay-with-us results URL when search is complete; otherwise the browse landing page. */
export function buildStayWithUsUrl(
  form: Partial<AccommodationSearchForm>
): string {
  const location = form.location?.trim() ?? "";
  const checkIn = form.checkIn?.trim() ?? "";
  const checkOut = form.checkOut?.trim() ?? "";
  const guests = form.guests?.trim() || "2";

  if (
    location &&
    checkIn &&
    checkOut &&
    isValidAccommodationDateRange(checkIn, checkOut)
  ) {
    return `/stay-with-us?${buildAccommodationSearchParams({
      location,
      checkIn,
      checkOut,
      guests,
    }).toString()}`;
  }

  return "/stay-with-us";
}

export function buildPropertyBookUrl(
  propertyId: string,
  form: Partial<AccommodationSearchForm>
): string {
  const location = form.location?.trim() ?? "";
  const checkIn = form.checkIn?.trim() ?? "";
  const checkOut = form.checkOut?.trim() ?? "";
  const guests = form.guests?.trim() || "2";

  const params = new URLSearchParams();
  if (location) params.set("location", location);
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);
  if (guests) params.set("guests", guests);

  const qs = params.toString();
  return `/accommodations/${propertyId}/book${qs ? `?${qs}` : ""}`;
}

export function isValidAccommodationDateRange(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;

  const checkInDate = parseISODate(checkIn);
  const checkOutDate = parseISODate(checkOut);
  if (!checkInDate || !checkOutDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) return false;
  if (checkOutDate <= checkInDate) return false;

  return true;
}

export function isValidAccommodationSearchDateRange(checkIn: string, checkOut: string): boolean {
  if (!isValidAccommodationDateRange(checkIn, checkOut)) return false;

  return (
    calculateNightsBetween(checkIn, checkOut) >= DEFAULT_MINIMUM_STAY_NIGHTS
  );
}

export function getStoredAccommodationDates(): StoredAccommodationDates | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(ACCOMMODATION_DATES_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredAccommodationDates;
    if (!parsed.checkIn || !parsed.checkOut) return null;

    if (!isValidAccommodationSearchDateRange(parsed.checkIn, parsed.checkOut)) {
      sessionStorage.removeItem(ACCOMMODATION_DATES_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredAccommodationDates(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ACCOMMODATION_DATES_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export function setStoredAccommodationDates(dates: StoredAccommodationDates): void {
  if (typeof window === "undefined") return;
  if (!isValidAccommodationSearchDateRange(dates.checkIn, dates.checkOut)) return;

  try {
    sessionStorage.setItem(
      ACCOMMODATION_DATES_STORAGE_KEY,
      JSON.stringify({
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        ...(dates.guests ? { guests: dates.guests } : {}),
        ...(dates.location ? { location: dates.location } : {}),
      })
    );
  } catch {
    // Ignore quota errors
  }
}

export function persistAccommodationDatesIfValid(
  checkIn: string,
  checkOut: string,
  guests?: string,
  location?: string
): void {
  if (isValidAccommodationSearchDateRange(checkIn, checkOut)) {
    setStoredAccommodationDates({
      checkIn,
      checkOut,
      guests,
      ...(location ? { location } : {}),
    });
  }
}

export function validateAccommodationSearch(form: AccommodationSearchForm): string | null {
  if (!form.location || !form.checkIn || !form.checkOut || !form.guests) {
    return "Please fill in all fields";
  }

  if (!isValidAccommodationDateRange(form.checkIn, form.checkOut)) {
    const checkInDate = parseISODate(form.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!checkInDate || checkInDate < today) {
      return "Check-in date must be today or later";
    }

    return "Check-out date must be after check-in date";
  }

  const nights = calculateNightsBetween(form.checkIn, form.checkOut);
  if (nights < DEFAULT_MINIMUM_STAY_NIGHTS) {
    return `Minimum stay is ${DEFAULT_MINIMUM_STAY_NIGHTS} nights.`;
  }

  return null;
}
