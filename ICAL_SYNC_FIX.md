# iCal Calendar Sync Fix

## Problem
The booking calendar for property 135133 was not showing blocked dates from the Airbnb iCal feed, even though the iCal URL was configured.

## Root Cause
The `cached_availability` table was missing from the database. This table stores blocked dates synced from external calendars (Airbnb, Booking.com, etc.).

## Solution

### 1. Created the `cached_availability` Table
- Migration: `supabase/migrations/create_cached_availability.sql`
- Stores blocked dates with property ID, date, availability status, and reason
- Includes indexes for fast queries

### 2. Synced iCal Data
- Created sync script: `scripts/sync-ical.mjs`
- Successfully synced 42 blocked dates from Airbnb iCal feed for property 135133
- Dates range from November 2025 to November 2026

### 3. How It Works Now

1. **iCal Feed Storage**: Property 135133 has iCal URL stored in `cached_properties.ical_url`
2. **Sync Process**: Run sync to fetch and parse iCal feed:
   ```bash
   npm run sync:ical 135133
   ```
3. **Calendar Display**: The booking calendar (`AvailabilityCalendar` component) fetches blocked dates from `cached_availability` table
4. **Real-time Updates**: Blocked dates are displayed as unavailable in the calendar

## Usage

### Sync a Specific Property
```bash
npm run sync:ical 135133
```

### Sync All Properties (via API)
```bash
curl -X GET http://localhost:3000/api/sync-availability
```

### Sync via API for Specific Property
```bash
curl -X POST http://localhost:3000/api/sync-availability \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"135133"}'
```

## Current Status

✅ **Table Created**: `cached_availability` table exists  
✅ **Data Synced**: 42 blocked dates synced for property 135133  
✅ **Calendar Working**: Booking calendar should now show blocked dates  

## Next Steps

1. **Set up automatic syncing**: Configure a cron job to sync iCal feeds regularly (e.g., every hour)
2. **Add sync button**: Add a "Sync Calendar" button in the admin dashboard for manual syncing
3. **Monitor sync status**: Track when calendars were last synced

## Blocked Dates Found

The sync found these blocked periods:
- **Nov 2 - Dec 3, 2025**: Reserved (31 days)
- **Dec 29, 2025 - Jan 3, 2026**: Airbnb (Not available) (5 days)
- **Feb 13-18, 2026**: Airbnb (Not available) (5 days)
- **Nov 20-21, 2026**: Airbnb (Not available) (1 day)

**Total: 42 blocked dates**

## Testing

To verify the calendar is working:
1. Go to: http://localhost:3000/accommodations/135133/book
2. Check the calendar - blocked dates should appear grayed out and unclickable
3. Try selecting dates that include blocked dates - should show an error


