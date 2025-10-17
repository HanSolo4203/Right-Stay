# iCal Sync Setup Guide

## Quick Start

Follow these steps to enable Airbnb calendar synchronization for property 135133.

### Step 1: Run Database Migration

You need to add the `ical_url` column to your database. Choose one of these methods:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add iCal URL field to cached_properties table
ALTER TABLE cached_properties 
ADD COLUMN IF NOT EXISTS ical_url TEXT;

-- Add comment
COMMENT ON COLUMN cached_properties.ical_url IS 'iCal feed URL for syncing availability from external calendars (e.g., Airbnb, Booking.com)';

-- Create index for properties with iCal URLs
CREATE INDEX IF NOT EXISTS idx_cached_properties_ical_url 
ON cached_properties(ical_url) 
WHERE ical_url IS NOT NULL;

-- Update property 135133 with the Airbnb iCal URL
UPDATE cached_properties 
SET ical_url = 'https://www.airbnb.co.za/calendar/ical/1323863386746095841.ics?s=8fef6db13fedb2dcbb0b9f6d70844bb5'
WHERE uplisting_id = '135133';
```

5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success message

#### Option B: Via Supabase CLI

If you have Supabase CLI installed:

```bash
cd "/Users/fareedsolomons/Documents/UI DESIGN TEST"
supabase db push
```

### Step 2: Verify Migration

Check that the column was added and the URL is set:

```sql
SELECT uplisting_id, ical_url, data->>'attributes'->>'name' as name
FROM cached_properties 
WHERE uplisting_id = '135133';
```

Expected result:
- `uplisting_id`: 135133
- `ical_url`: https://www.airbnb.co.za/calendar/ical/1323863386746095841.ics?s=...
- `name`: (your property name)

### Step 3: Test Initial Sync

Once migration is complete, test the sync:

```bash
curl -X POST http://localhost:3003/api/sync-availability \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "135133"}'
```

Expected response:
```json
{
  "success": true,
  "propertyId": "135133",
  "blockedDates": 45,
  "message": "Synced 45 blocked dates for property 135133",
  "lastSynced": "2025-10-17T..."
}
```

### Step 4: Verify Blocked Dates

Check that blocked dates were saved:

```sql
SELECT 
  date,
  blocked_reason,
  last_synced
FROM cached_availability
WHERE property_id = '135133'
  AND available = false
ORDER BY date
LIMIT 10;
```

### Step 5: Test Booking Page

1. Navigate to: http://localhost:3003/accommodations/135133/book
2. Select dates that are blocked (from the query above)
3. You should see a yellow warning: "Dates Not Available"
4. The booking button should be disabled

### Step 6: Test Available Dates

1. Select dates that are NOT in the blocked list
2. Pricing should calculate automatically
3. No warning should appear
4. Booking button should be enabled

## Troubleshooting

### Migration Error: "column already exists"

This is fine! Run just the UPDATE statement:

```sql
UPDATE cached_properties 
SET ical_url = 'https://www.airbnb.co.za/calendar/ical/1323863386746095841.ics?s=8fef6db13fedb2dcbb0b9f6d70844bb5'
WHERE uplisting_id = '135133';
```

### Sync Error: "Property not found"

Check that property 135133 exists:

```sql
SELECT * FROM cached_properties WHERE uplisting_id = '135133';
```

If it doesn't exist, the property ID might be different. Check all properties:

```sql
SELECT uplisting_id, data->>'attributes'->>'name' as name 
FROM cached_properties;
```

### No Blocked Dates After Sync

1. Check the iCal URL is accessible:
   ```bash
   curl "https://www.airbnb.co.za/calendar/ical/1323863386746095841.ics?s=8fef6db13fedb2dcbb0b9f6d70844bb5"
   ```

2. Check server logs for errors (in the terminal where `npm run dev` is running)

3. The property might genuinely have no bookings - check the raw iCal data

## Next Steps

After successful setup:

1. **Add more properties**: Update other properties with their iCal URLs
   ```sql
   UPDATE cached_properties 
   SET ical_url = 'YOUR_ICAL_URL'
   WHERE uplisting_id = 'PROPERTY_ID';
   ```

2. **Setup automated sync**: See ICAL_INTEGRATION.md for cron setup instructions

3. **Monitor sync status**: Use the SQL queries in ICAL_INTEGRATION.md

## Support

If you encounter issues:
1. Check the server logs in your terminal
2. Review ICAL_INTEGRATION.md for detailed troubleshooting
3. Verify your iCal URL is valid and accessible
4. Ensure your Supabase database connection is working

---

**Current Status**: ✅ Code deployed, ⏳ Awaiting database migration

