# Quick Guide: Get Your iCal Export URLs

## 🎯 What You Need

An iCal URL for each property you want to sync with Airbnb.

## 📋 Step 1: Get Your Property IDs

Run this SQL query in your Supabase dashboard:

```sql
SELECT 
  id as property_id,
  apartment_number,
  address
FROM apartments 
ORDER BY apartment_number;
```

## 🔗 Step 2: Generate Your iCal URLs

For each property, your iCal URL will be:

### Format
```
https://YOUR_DOMAIN.com/api/export-ical?propertyId={PROPERTY_ID}
```

### Local Testing (Development)
```
http://localhost:3003/api/export-ical?propertyId={PROPERTY_ID}
```

### Production URL (Replace with your actual domain)
```
https://rightstayafrica.com/api/export-ical?propertyId={PROPERTY_ID}
```

## 📝 Example

If your query returns:
```
property_id: 550e8400-e29b-41d4-a716-446655440000
apartment_number: CPT-101
address: Sea Point, Cape Town
```

Your iCal URL would be:
```
https://rightstayafrica.com/api/export-ical?propertyId=550e8400-e29b-41d4-a716-446655440000
```

## 🧪 Test Your URLs

### Method 1: Browser Test
1. Start your dev server: `npm run dev`
2. Open in browser: `http://localhost:3003/api/export-ical?propertyId=YOUR_ID`
3. You should see iCalendar text starting with `BEGIN:VCALENDAR`

### Method 2: cURL Test
```bash
curl "http://localhost:3003/api/export-ical?propertyId=YOUR_ID"
```

### Method 3: Google Calendar Test (Best validation)
1. Open Google Calendar
2. Click **+** next to "Other calendars"
3. Select **From URL**
4. Paste: `http://localhost:3003/api/export-ical?propertyId=YOUR_ID`
5. Your bookings should appear!

## 🏠 Alternative: Use Apartment Number

If you prefer, you can use apartment number instead of UUID:

```
https://rightstayafrica.com/api/export-ical?apartmentNumber=CPT-101
```

**Note:** UUIDs are more secure as they're harder to guess.

## 📲 Give URLs to Airbnb

### For Each Airbnb Listing:

1. **Log into Airbnb** (host dashboard)
2. **Go to Calendar** for the specific listing
3. Click **Availability** → **Sync calendars**
4. Click **Import calendar**
5. **Paste your iCal URL** (the production URL, not localhost!)
6. Name it: `Right Stay Africa - Direct Bookings`
7. Click **Import**

### What Happens Next:

- Airbnb validates the URL immediately
- Shows you how many events were found
- Syncs every 4-12 hours automatically
- Your direct bookings will block dates on Airbnb

## ✅ Verification Checklist

After importing to Airbnb:

- [ ] Airbnb shows "Calendar imported successfully"
- [ ] Check Airbnb calendar to see blocked dates
- [ ] Create a test booking on your site (confirmed status)
- [ ] Wait 12 hours
- [ ] Check if the new booking appears on Airbnb
- [ ] ✨ Success!

## 🔄 Complete Two-Way Sync

You now have **BOTH** directions working:

### Direction 1: Your Site → Airbnb (New!)
- **Export URL:** `/api/export-ical?propertyId=X`
- **Import to:** Airbnb calendar sync
- **Result:** Your direct bookings block dates on Airbnb

### Direction 2: Airbnb → Your Site (Already exists)
- **Export from:** Airbnb (already configured)
- **Import URL:** Set in `cached_properties.ical_url`
- **Result:** Airbnb bookings block dates on your site

## 🚨 Important Notes

1. **Use Production URL for Airbnb** - Don't use `localhost`!
2. **Each Airbnb listing needs its own URL** - Match property to property
3. **Sync takes time** - Up to 12 hours for changes to appear
4. **Only confirmed bookings** - Pending/cancelled bookings are NOT exported
5. **Keep URLs private-ish** - They're public but obscure (like how Airbnb does it)

## 📊 Monitor Your Exports

Check what's being exported:

```sql
SELECT 
  b.booking_reference,
  b.check_in_date,
  b.check_out_date,
  a.apartment_number,
  g.name as guest_name,
  bc.name as channel,
  b.booking_status
FROM bookings b
JOIN apartments a ON b.apartment_id = a.id  
JOIN guests g ON b.guest_id = g.id
JOIN booking_channels bc ON b.channel_id = bc.id
WHERE b.booking_status IN ('confirmed', 'completed')
ORDER BY b.check_in_date;
```

These are the exact bookings that will be in your iCal feed.

## 🆘 Troubleshooting

### "Calendar could not be imported" in Airbnb

**Fix:**
1. Test URL in browser first
2. Make sure you're using the production URL (not localhost)
3. Verify your site is publicly accessible
4. Check that the URL returns `text/calendar` content

### No bookings showing up

**Fix:**
1. Confirm bookings have status 'confirmed' or 'completed'
2. Check the property_id matches
3. Run the SQL query above to see what bookings should appear

### Dates not syncing to Airbnb

**Fix:**
1. Wait 12 hours - Airbnb syncs on their schedule
2. Check if Airbnb shows "Last synced: X hours ago"
3. Try removing and re-importing the calendar in Airbnb

## 🎉 You're Done!

Once set up, you have automatic two-way calendar synchronization:
- ✅ Direct bookings automatically block Airbnb
- ✅ Airbnb bookings automatically block your site
- ✅ No more double bookings!
- ✅ No manual calendar management needed

---

**Need help?** Check the detailed guide in `ICAL_EXPORT_SETUP.md`

