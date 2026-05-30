/**
 * Pricing utility to calculate booking costs based on PriceLabs data
 */

import { parseLocalDate } from '@/lib/date-utils';

interface PriceData {
  date: string;
  price: number;
  minStay: number;
  available: boolean;
}

export const DEFAULT_NIGHTLY_PRICE = 1500;
export const DEFAULT_CLEANING_FEE = 450;
export const DEFAULT_SERVICE_FEE_PERCENT = 5;
export const DEFAULT_MINIMUM_STAY_NIGHTS = 2;

/** Nights between check-in and check-out (checkout day excluded). */
export function calculateNightsBetween(checkInDate: string, checkOutDate: string): number {
  const start = parseLocalDate(checkInDate);
  const end = parseLocalDate(checkOutDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Each bookable night in a stay (check-in inclusive, check-out exclusive). */
export function getStayNightDates(checkInDate: string, checkOutDate: string): string[] {
  const nights = calculateNightsBetween(checkInDate, checkOutDate);
  if (nights <= 0) return [];

  const dates: string[] = [];
  const current = parseLocalDate(checkInDate);
  for (let i = 0; i < nights; i++) {
    dates.push(formatDateLocal(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
export const SERVICE_FEE_RATE = 0.05;

export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * First bookable nightly rate in the lookahead window (matches book page display).
 */
export function getNextAvailableNightlyPrice(options: {
  dailyPrices: Record<string, number>;
  blockedDates?: Set<string> | string[];
  pricing?: {
    pricingEnabled?: boolean;
    basePrice?: number | null;
    startingNightlyPrice?: number | null;
  } | null;
  maxDaysAhead?: number;
  fallbackPrice?: number;
}): number {
  const blockedSet =
    options.blockedDates instanceof Set
      ? options.blockedDates
      : new Set(options.blockedDates || []);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDays = options.maxDaysAhead ?? 365;

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = formatDateLocal(d);
    if (blockedSet.has(key)) continue;
    const price = options.dailyPrices[key];
    if (price != null) return price;
  }

  if (options.pricing?.startingNightlyPrice != null) {
    return options.pricing.startingNightlyPrice;
  }

  if (options.pricing?.pricingEnabled && options.pricing.basePrice != null) {
    return options.pricing.basePrice;
  }

  return options.fallbackPrice ?? DEFAULT_NIGHTLY_PRICE;
}

// Parse CSV data and create a price map
const parsePriceLabsCSV = (csvText: string): Map<string, PriceData> => {
  const priceMap = new Map<string, PriceData>();
  const lines = csvText.trim().split('\n');
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    // Parse CSV line (handling quoted fields)
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 7) continue;
    
    const date = matches[0].replace(/"/g, '');
    const priceStr = matches[4].replace(/"/g, ''); // "Price with Default Customization" column
    const minStayStr = matches[3].replace(/"/g, '');
    const availableStr = matches[6].replace(/"/g, '');
    
    const price = parseFloat(priceStr);
    const minStay = parseInt(minStayStr) || 1;
    const available = availableStr.toLowerCase() === 'true';
    
    if (!isNaN(price) && date) {
      priceMap.set(date, { date, price, minStay, available });
    }
  }
  
  return priceMap;
};

// Calculate total pricing for a date range
export const calculateBookingPricing = (
  checkInDate: string,
  checkOutDate: string,
  priceMap: Map<string, PriceData>
) => {
  const nights = calculateNightsBetween(checkInDate, checkOutDate);

  if (nights <= 0) {
    return null;
  }

  const nightlyPrices: { date: string; price: number }[] = [];
  let totalAccommodation = 0;

  for (const dateStr of getStayNightDates(checkInDate, checkOutDate)) {
    const priceData = priceMap.get(dateStr);

    if (priceData) {
      nightlyPrices.push({ date: dateStr, price: priceData.price });
      totalAccommodation += priceData.price;
    } else {
      const defaultPrice = DEFAULT_NIGHTLY_PRICE;
      nightlyPrices.push({ date: dateStr, price: defaultPrice });
      totalAccommodation += defaultPrice;
    }
  }
  
  // Calculate fees
  const cleaningFee = DEFAULT_CLEANING_FEE; // default flat cleaning fee
  const serviceFee = totalAccommodation * SERVICE_FEE_RATE; // default service fee %
  const total = totalAccommodation + cleaningFee + serviceFee;
  
  return {
    numberOfNights: nights,
    nightlyPrices,
    basePrice: totalAccommodation,
    averagePricePerNight: totalAccommodation / nights,
    cleaningFee,
    serviceFee,
    total
  };
};

// Get price for a specific date
export const getPriceForDate = (date: string, priceMap: Map<string, PriceData>): number => {
  const priceData = priceMap.get(date);
  return priceData ? priceData.price : DEFAULT_NIGHTLY_PRICE; // Default fallback
};

/**
 * Resolve price for a date: use daily override if present, else base price.
 * Optionally clamp to min/max range.
 */
export const resolvePriceForDate = (
  date: string,
  dailyOverride: number | null | undefined,
  basePrice: number,
  minPrice?: number | null,
  maxPrice?: number | null
): number => {
  let price = dailyOverride != null ? dailyOverride : basePrice;
  if (minPrice != null && price < minPrice) price = minPrice;
  if (maxPrice != null && price > maxPrice) price = maxPrice;
  return price;
};

/**
 * Calculate booking pricing from a date->price map (e.g. from DB daily overrides + base).
 */
export const calculateBookingPricingFromMap = (
  checkInDate: string,
  checkOutDate: string,
  priceMap: Map<string, number>,
  defaultPrice: number = DEFAULT_NIGHTLY_PRICE,
  options?: {
    cleaningFee?: number;
    serviceFeePercent?: number;
  }
) => {
  const nights = calculateNightsBetween(checkInDate, checkOutDate);
  if (nights <= 0) return null;

  const nightlyPrices: { date: string; price: number }[] = [];
  let totalAccommodation = 0;

  for (const dateStr of getStayNightDates(checkInDate, checkOutDate)) {
    const price = priceMap.get(dateStr) ?? defaultPrice;
    nightlyPrices.push({ date: dateStr, price });
    totalAccommodation += price;
  }

  const cleaningFee = options?.cleaningFee ?? DEFAULT_CLEANING_FEE;
  const serviceFeePercent = options?.serviceFeePercent ?? DEFAULT_SERVICE_FEE_PERCENT;
  const serviceFee = totalAccommodation * (serviceFeePercent / 100);
  const total = totalAccommodation + cleaningFee + serviceFee;

  return {
    numberOfNights: nights,
    nightlyPrices,
    basePrice: totalAccommodation,
    averagePricePerNight: totalAccommodation / nights,
    cleaningFee,
    serviceFee,
    total,
  };
};

export const buildDatePriceMap = (
  checkInDate: string,
  checkOutDate: string,
  basePrice: number,
  dailyOverrideMap: Record<string, number>,
  minPrice?: number | null,
  maxPrice?: number | null
) => {
  const map = new Map<string, number>();

  for (const dateStr of getStayNightDates(checkInDate, checkOutDate)) {
    const override = dailyOverrideMap[dateStr];
    const price = resolvePriceForDate(dateStr, override, basePrice, minPrice, maxPrice);
    map.set(dateStr, price);
  }

  return map;
};

// Check minimum stay requirement
export const getMinimumStay = (checkInDate: string, priceMap: Map<string, PriceData>): number => {
  const priceData = priceMap.get(checkInDate);
  return priceData ? priceData.minStay : 2; // Default minimum stay
};

// Export parser for use in API/components
export { parsePriceLabsCSV };
export type { PriceData };

