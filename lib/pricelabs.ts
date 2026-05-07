const DEFAULT_PRICELABS_BASE_URL = process.env.PRICELABS_BASE_URL || 'https://api.pricelabs.co';
const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 3;

export interface PriceLabsListingRequest {
  id: string;
  pms: string;
  dateFrom?: string;
  dateTo?: string;
  reason?: boolean;
}

export interface PriceLabsDailyPrice {
  date: string;
  price: number;
  min_stay?: number;
  check_in?: boolean;
  check_out?: boolean;
  unbookable?: number;
}

export interface PriceLabsListingPrices {
  id: string;
  pms: string;
  currency?: string;
  last_refreshed_at?: string;
  data: PriceLabsDailyPrice[];
}

function getApiKey(): string {
  const apiKey = process.env.PRICELABS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PRICELABS_API_KEY');
  }
  return apiKey;
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeDailyPrice(item: any): PriceLabsDailyPrice | null {
  if (!item || !isValidDateString(item.date)) return null;
  const price = Number(item.price);
  if (Number.isNaN(price) || price < 0) return null;

  return {
    date: item.date,
    price,
    min_stay: item.min_stay != null ? Number(item.min_stay) : undefined,
    check_in: typeof item.check_in === 'boolean' ? item.check_in : undefined,
    check_out: typeof item.check_out === 'boolean' ? item.check_out : undefined,
    unbookable: item.unbookable != null ? Number(item.unbookable) : undefined,
  };
}

function normalizeListing(item: any): PriceLabsListingPrices | null {
  if (!item || typeof item.id !== 'string' || typeof item.pms !== 'string') return null;
  const rows = Array.isArray(item.data) ? item.data : [];
  const data = rows.map(normalizeDailyPrice).filter(Boolean) as PriceLabsDailyPrice[];

  return {
    id: item.id,
    pms: item.pms,
    currency: typeof item.currency === 'string' ? item.currency : undefined,
    last_refreshed_at:
      typeof item.last_refreshed_at === 'string' ? item.last_refreshed_at : undefined,
    data,
  };
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(path: string, body: unknown): Promise<any> {
  const apiKey = getApiKey();
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRIES) {
    attempt += 1;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(`${DEFAULT_PRICELABS_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.ok) {
        return await res.json();
      }

      if (res.status === 429 || res.status >= 500) {
        const delayMs = Math.min(2 ** attempt * 500, 8_000);
        await sleep(delayMs);
        continue;
      }

      const rawText = await res.text();
      throw new Error(`PriceLabs request failed (${res.status}): ${rawText.slice(0, 500)}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown PriceLabs error');
      if (attempt < MAX_RETRIES) {
        const delayMs = Math.min(2 ** attempt * 500, 8_000);
        await sleep(delayMs);
        continue;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError || new Error('PriceLabs request failed after retries');
}

export async function fetchListingPrices(
  listings: PriceLabsListingRequest[]
): Promise<PriceLabsListingPrices[]> {
  if (!Array.isArray(listings) || listings.length === 0) {
    return [];
  }

  const payloadListings = listings.map((listing) => ({
    id: listing.id,
    pms: listing.pms,
    dateFrom: listing.dateFrom,
    dateTo: listing.dateTo,
    reason: listing.reason ?? false,
  }));

  const response = await requestWithRetry('/v1/listing_prices', { listings: payloadListings });
  if (!Array.isArray(response)) {
    throw new Error('Unexpected PriceLabs response shape from /v1/listing_prices');
  }

  return response.map(normalizeListing).filter(Boolean) as PriceLabsListingPrices[];
}
