import ICAL from 'node-ical';

interface BlockedDate {
  date: string;
  reason: string;
  source: string;
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
        const start = new Date(event.start);
        const end = new Date(event.end);
        const summary = event.summary || 'Booked';
        
        console.log(`Processing event: ${summary} from ${start.toISOString()} to ${end.toISOString()}`);
        
        // Generate all dates between start and end (excluding end date as per booking convention)
        const currentDate = new Date(start);
        currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        while (currentDate < end) {
          blockedDates.push({
            date: currentDate.toISOString().split('T')[0],
            reason: summary,
            source: 'airbnb'
          });
          currentDate.setDate(currentDate.getDate() + 1);
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

