import ICAL from 'node-ical';

interface BlockedDate {
  date: string;
  reason: string;
  source: string;
}

type IcalDateValue = Date & { dateOnly?: boolean };

/** Convert node-ical date (incl. VALUE=DATE) to YYYY-MM-DD without timezone drift */
export function icalDateToYmd(value: IcalDateValue | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const dateOnly = 'dateOnly' in value && Boolean((value as IcalDateValue).dateOnly);

  if (dateOnly && date.getUTCHours() !== 0) {
    const adjusted = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
    );
    return adjusted.toISOString().slice(0, 10);
  }

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Add one calendar day to a YYYY-MM-DD string */
function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

/**
 * Parse an iCal feed URL and extract blocked dates
 * @param icalUrl - The URL of the iCal feed (e.g., from Airbnb, Booking.com)
 * @returns Array of blocked dates with reasons
 */
export async function parseIcalFeed(icalUrl: string): Promise<BlockedDate[]> {
  try {
    console.log('Fetching iCal feed from:', icalUrl);
    const events = await ICAL.async.fromURL(icalUrl);
    const blockedDates: BlockedDate[] = [];

    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT') {
        const startYmd = icalDateToYmd(event.start as IcalDateValue);
        const endYmd = icalDateToYmd(event.end as IcalDateValue);
        const summary = event.summary || 'Booked';

        console.log(`Processing event: ${summary} from ${startYmd} to ${endYmd}`);

        // DTEND is exclusive for all-day events (last blocked night is day before end)
        let currentYmd = startYmd;
        while (currentYmd < endYmd) {
          blockedDates.push({
            date: currentYmd,
            reason: summary,
            source: 'airbnb',
          });
          currentYmd = addDaysYmd(currentYmd, 1);
        }
      }
    }

    console.log(`Parsed ${blockedDates.length} blocked dates from iCal feed`);
    return blockedDates;
  } catch (error) {
    console.error('Error parsing iCal feed:', error);
    throw new Error(`Failed to parse iCal feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a date range has any blocked dates
 * @param blockedDates - Array of blocked dates
 * @param startDate - Check-in date (YYYY-MM-DD)
 * @param endDate - Check-out date (YYYY-MM-DD)
 * @returns True if any dates in the range are blocked
 */
export function hasBlockedDates(
  blockedDates: BlockedDate[],
  startDate: string,
  endDate: string
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return blockedDates.some(blocked => {
    const blockedDate = new Date(blocked.date);
    return blockedDate >= start && blockedDate < end;
  });
}

