# iCal Export for Airbnb Integration

## Overview
This feature allows you to export your direct bookings as an iCal feed that can be imported into Airbnb (or other booking platforms) to automatically block dates and prevent double bookings.

## How It Works

1. **Generate iCal Feed**: Your site generates a live iCal feed URL containing all confirmed bookings
2. **Import to Airbnb**: You provide this URL to Airbnb in their calendar sync settings
3. **Automatic Updates**: Airbnb regularly checks the feed and automatically blocks dates when you have direct bookings
4. **Two-Way Sync**: Combined with your existing iCal import, you have full two-way calendar synchronization

## iCal Feed Endpoints

### Export All Bookings for a Property

```
GET /api/export-ical?propertyId={APARTMENT_ID}
```

**Example:**
```
https://yourdomain.com/api/export-ical?propertyId=550e8400-e29b-41d4-a716-446655440000
```

### Export by Apartment Number

```
GET /api/export-ical?apartmentNumber={APARTMENT_NUMBER}
```

**Example:**
```
https://yourdomain.com/api/export-ical?apartmentNumber=CPT-101
```

### Export All Bookings (All Properties)

```
GET /api/export-ical
```

**Example:**
```
https://yourdomain.com/api/export-ical
```

## Setting Up in Airbnb

### Step 1: Get Your Property ID

You can find your property/apartment ID from your database:

```sql
SELECT id, apartment_number, address 
FROM apartments 
ORDER BY apartment_number;
```

### Step 2: Generate Your iCal URL

For a specific property, your URL will be:
```
https://yourdomain.com/api/export-ical?propertyId=YOUR_PROPERTY_ID
```

Or if you prefer to use apartment number:
```
https://yourdomain.com/api/export-ical?apartmentNumber=CPT-101
```

### Step 3: Import to Airbnb

1. **Log into Airbnb** as a host
2. **Go to Calendar** for your listing
3. Click **Availability** or **Availability settings**
4. Look for **Sync calendars** or **Import calendar**
5. Click **Import new calendar**
6. Paste your iCal export URL
7. Give it a name like "Right Stay Africa - Direct Bookings"
8. Click **Import calendar** or **Save**

### Step 4: Verify the Import

1. After importing, Airbnb will show you how many events were imported
2. Check your Airbnb calendar to see if the blocked dates appear
3. Airbnb syncs imported calendars every few hours (usually 4-12 hours)

## Setting Up in Other Platforms

### Booking.com

1. Log into Booking.com Extranet
2. Go to **Property** → **Calendar**
3. Look for **Calendar sync** or **iCal synchronization**
4. Click **Import calendar**
5. Paste your iCal export URL
6. Save

### VRBO/HomeAway

1. Log into VRBO dashboard
2. Go to **Calendar**
3. Click **Import/Export**
4. Select **Import calendar**
5. Paste your iCal export URL
6. Save

## Testing Your iCal Feed

### Test 1: Verify Feed Generation

Visit your iCal URL in a browser:
```
https://yourdomain.com/api/export-ical?propertyId=YOUR_PROPERTY_ID
```

You should see output like:
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Right Stay Africa//Booking Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Right Stay Africa Bookings
X-WR-TIMEZONE:Africa/Johannesburg
BEGIN:VEVENT
UID:booking-550e8400-e29b-41d4-a716-446655440000@rightstayafrica.com
DTSTAMP:20251017T100000Z
DTSTART;VALUE=DATE:20251120
DTEND;VALUE=DATE:20251125
SUMMARY:Booked
DESCRIPTION:Booking: BK-2025-001\nGuest: John Doe\nChannel: Direct\nProperty: CPT-101
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR
```

### Test 2: Import to Google Calendar

Before importing to Airbnb, test with Google Calendar:

1. Open Google Calendar
2. Click the **+** next to "Other calendars"
3. Select **From URL**
4. Paste your iCal export URL
5. Your bookings should appear in Google Calendar

### Test 3: Verify Booking Data

Check that your confirmed bookings are in the database:

```sql
SELECT 
  b.booking_reference,
  b.check_in_date,
  b.check_out_date,
  a.apartment_number,
  g.name as guest_name,
  bc.name as channel
FROM bookings b
JOIN apartments a ON b.apartment_id = a.id
JOIN guests g ON b.guest_id = g.id
JOIN booking_channels bc ON b.channel_id = bc.id
WHERE b.booking_status IN ('confirmed', 'completed')
  AND b.apartment_id = 'YOUR_PROPERTY_ID'
ORDER BY b.check_in_date;
```

## What Gets Exported

The iCal feed includes:

✅ **Confirmed bookings** - All bookings with status 'confirmed'
✅ **Completed bookings** - Past bookings that were completed
✅ **Booking reference** - In the description
✅ **Guest name** - In the description
✅ **Check-in and check-out dates** - As event start/end
✅ **Property information** - In the description

❌ **Not included:**
- Cancelled bookings
- Pending bookings
- Pricing information (for privacy)
- Guest contact details (for privacy)

## Security Considerations

### Public URL
The iCal feed URLs are public and don't require authentication. This is standard practice and how Airbnb expects iCal feeds to work.

### Data Privacy
- Guest email and phone numbers are **NOT** included in the feed
- Only guest names and booking references are included
- Pricing information is **NOT** included

### URL Obscurity
For additional security, you can use the apartment ID (UUID) instead of apartment number in the URL, which makes it harder to guess:
```
✅ Good: /api/export-ical?propertyId=550e8400-e29b-41d4-a716-446655440000
⚠️  Less secure: /api/export-ical?apartmentNumber=CPT-101
```

## Multiple Properties Setup

If you have multiple Airbnb listings, you'll need to:

1. Generate a separate iCal URL for each property
2. Import each URL into the corresponding Airbnb listing

**Example Setup:**

| Property | Apartment Number | iCal Export URL |
|----------|-----------------|-----------------|
| Cape Town Sea Point | CPT-101 | `/api/export-ical?propertyId=uuid-1` |
| Cape Town Gardens | CPT-102 | `/api/export-ical?propertyId=uuid-2` |
| Johannesburg Sandton | JHB-201 | `/api/export-ical?propertyId=uuid-3` |

## Sync Frequency

- **Your site**: Feed is generated in real-time with latest bookings
- **Airbnb**: Syncs imported calendars every 4-12 hours
- **Booking.com**: Syncs every 4-24 hours
- **VRBO**: Syncs every 4-8 hours

⚠️ **Important**: There will always be a delay between creating a booking on your site and it appearing on external platforms. This is a limitation of how these platforms work.

## Troubleshooting

### Issue: Airbnb shows "Could not import calendar"

**Possible causes:**
1. The URL is not publicly accessible
2. The URL returns an error
3. The iCal format is invalid

**Solutions:**
1. Test the URL in a browser - it should download an .ics file
2. Check server logs for errors
3. Test with Google Calendar first to verify format

### Issue: No events showing up in Airbnb

**Possible causes:**
1. No confirmed bookings in database
2. Wrong property ID in URL
3. Airbnb hasn't synced yet (can take 4-12 hours)

**Solutions:**
1. Check database for confirmed bookings:
   ```sql
   SELECT COUNT(*) FROM bookings WHERE booking_status = 'confirmed';
   ```
2. Verify the property ID matches your URL
3. Wait for Airbnb's next sync cycle

### Issue: Old bookings still showing

**Possible causes:**
1. Booking is still marked as 'confirmed' instead of 'completed' or 'cancelled'

**Solutions:**
1. Update booking status:
   ```sql
   UPDATE bookings 
   SET booking_status = 'completed' 
   WHERE check_out_date < CURRENT_DATE 
     AND booking_status = 'confirmed';
   ```

### Issue: Dates showing as available on Airbnb but blocked on your site

This is the **intended behavior** - the iCal export only sends YOUR bookings to Airbnb. If a date is blocked for another reason (maintenance, manual block), it won't appear in the export. If you need to block dates on Airbnb, you must do it directly in Airbnb.

## Complete Two-Way Sync Setup

For complete calendar synchronization:

### 1. Export Your Bookings → Airbnb (This Feature)

```
Your Direct Bookings → iCal Export URL → Airbnb Imports → Blocks dates on Airbnb
```

Setup in Airbnb: **Import calendar** using your export URL

### 2. Import Airbnb Bookings → Your Site (Existing Feature)

```
Airbnb Bookings → Airbnb Export URL → Your Site Imports → Blocks dates on your site
```

Setup: Already configured via `cached_properties.ical_url`

### Result: Full Synchronization

- ✅ Direct bookings on your site automatically block dates on Airbnb
- ✅ Airbnb bookings automatically block dates on your site
- ✅ Prevents double bookings across both platforms
- ✅ Always up-to-date availability

## Production Checklist

Before going live:

- [ ] Test iCal feed generates correctly for each property
- [ ] Verify feed includes all confirmed bookings
- [ ] Test import in Google Calendar
- [ ] Import feed into Airbnb
- [ ] Wait 12 hours and verify dates are blocked on Airbnb
- [ ] Create a new test booking on your site
- [ ] Verify it appears in Airbnb within 12 hours
- [ ] Document all iCal URLs in a secure location
- [ ] Set up monitoring to check feed availability

## Monitoring

### Check Feed Health

Create a simple monitoring script to check your feeds:

```bash
curl -I "https://yourdomain.com/api/export-ical?propertyId=YOUR_ID"
```

Should return:
```
HTTP/2 200
content-type: text/calendar; charset=utf-8
```

### Database Query for Exported Bookings

Monitor what's being exported:

```sql
SELECT 
  COUNT(*) as total_bookings,
  MIN(check_in_date) as earliest_checkin,
  MAX(check_out_date) as latest_checkout
FROM bookings
WHERE booking_status IN ('confirmed', 'completed');
```

## FAQ

**Q: Will Airbnb bookings show up in my exported feed?**
A: Yes, if you've saved them in your bookings table with 'confirmed' status.

**Q: Can I use one feed URL for multiple Airbnb listings?**
A: No, each Airbnb listing needs its own feed URL with a specific propertyId.

**Q: How often should Airbnb sync?**
A: Airbnb typically syncs every 4-12 hours, but you cannot control this frequency.

**Q: Can I use this with Booking.com simultaneously?**
A: Yes! You can import the same iCal URL into multiple platforms.

**Q: What if I cancel a booking?**
A: Change the booking_status to 'cancelled' and it will be removed from the feed on the next sync.

**Q: Can customers see this URL?**
A: The URL is public but obscure. It doesn't expose sensitive information like pricing or contact details.

## Next Steps

1. **Test your first export:**
   ```bash
   curl "http://localhost:3003/api/export-ical?propertyId=YOUR_ID"
   ```

2. **Import to a test calendar** (Google Calendar recommended)

3. **Import to Airbnb** once verified

4. **Document your URLs** in a secure location

5. **Set up monitoring** to ensure feeds stay available

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify database has confirmed bookings
3. Test with Google Calendar first
4. Contact Airbnb support if import fails on their side

---

**Status:** ✅ Ready to use

**Created:** October 17, 2025

