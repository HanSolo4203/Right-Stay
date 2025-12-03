# PriceLabs Dynamic Pricing Integration

## Overview
The booking system now uses actual pricing data from PriceLabs CSV exports instead of hardcoded rates. Prices are calculated dynamically based on the selected dates, showing guests the exact nightly rates from your pricing strategy.

## How It Works

### 1. Data Source
- **CSV File**: `public/pricing/PriceLabs_uplisting_135133_2025-10-17.csv`
- **Property**: uplisting_135133 (your property from PriceLabs)
- **Data Columns Used**:
  - `Date` - The date in YYYY-MM-DD format
  - `Price with Default Customization` - The nightly rate to charge
  - `Min Stay` - Minimum stay requirement
  - `Available` - Whether the date is available for booking

### 2. System Components

#### A. Pricing Library (`lib/pricing.ts`)
Contains utility functions for:
- Parsing PriceLabs CSV data
- Calculating total booking costs for date ranges
- Getting prices for specific dates
- Handling minimum stay requirements

#### B. Pricing API (`app/api/get-pricing/route.ts`)
**Endpoint**: `GET /api/get-pricing`

**Parameters**:
- `propertyId` - Property identifier (e.g., uplisting_135133)
- `checkInDate` - Check-in date (YYYY-MM-DD)
- `checkOutDate` - Check-out date (YYYY-MM-DD)

**Returns**:
```json
{
  "propertyId": "uplisting_135133",
  "checkInDate": "2025-10-17",
  "checkOutDate": "2025-10-19",
  "numberOfNights": 2,
  "nightlyPrices": [
    { "date": "2025-10-17", "price": 1343 },
    { "date": "2025-10-18", "price": 1642 }
  ],
  "basePrice": 2985,
  "averagePricePerNight": 1492.5,
  "cleaningFee": 500,
  "serviceFee": 358.2,
  "total": 3843.2,
  "usingDefaultPricing": false
}
```

#### C. Updated Booking Page
The booking page now:
1. Fetches pricing dynamically when dates are selected
2. Shows a detailed breakdown of nightly rates
3. Displays the total including fees
4. Falls back to default pricing if CSV is unavailable

### 3. Pricing Breakdown Display

The booking summary shows:

**For stays of 7 nights or less:**
- Individual nightly rates with dates (e.g., "Oct 17: R1,343")
- Each night's rate from the CSV

**For stays longer than 7 nights:**
- Total accommodation cost
- Average nightly rate
- Avoids cluttering the UI with too many line items

**Always shown:**
- Cleaning fee (R500 flat rate)
- Service fee (12% of accommodation)
- Total amount

### 4. Example Pricing

From the CSV data:
- **Oct 17, 2025**: R1,343/night
- **Oct 18, 2025**: R1,642/night  
- **Oct 19, 2025**: R1,732/night
- **Oct 20, 2025**: R1,696/night

A 3-night stay (Oct 17-20) would be:
```
Accommodation: R4,681 (1343 + 1642 + 1696)
Cleaning fee:  R500
Service fee:   R562 (12% of 4681)
─────────────────────
Total:         R5,743
```

### 5. Fallback Behavior

If the CSV file is not found or dates are outside the CSV range:
- System falls back to R1,500/night default rate
- Shows "Using estimated pricing" warning
- Guest can still complete booking

This ensures the booking system never breaks even if pricing data is unavailable.

## File Structure

```
/Users/fareedsolomons/Documents/UI DESIGN TEST/
├── lib/
│   └── pricing.ts                    # Pricing calculation utilities
├── app/
│   ├── api/
│   │   └── get-pricing/
│   │       └── route.ts              # Pricing API endpoint
│   └── accommodations/
│       └── [id]/
│           └── book/
│               └── page.tsx          # Updated booking page
└── public/
    └── pricing/
        └── PriceLabs_uplisting_135133_2025-10-17.csv  # Pricing data
```

## Adding Pricing for Additional Properties

To add pricing for other properties:

1. **Export CSV from PriceLabs**:
   - Go to PriceLabs dashboard
   - Export pricing for your property
   - Note the property ID in the filename

2. **Add CSV to project**:
   ```bash
   cp PriceLabs_uplisting_XXXXX_DATE.csv public/pricing/
   ```

3. **Update API** (optional):
   The API currently uses uplisting_135133 by default. To support multiple properties, modify `app/api/get-pricing/route.ts` to map property IDs to CSV files.

## CSV Data Format

The system expects PriceLabs CSV format:
```csv
Date,Final Price,Last Seen Price,Min Stay,Price with Default Customization,Unbookable,Available,...
"2025-10-17","1343","","2","1343","","False",...
"2025-10-18","1642","","2","1642","","False",...
```

**Key columns**:
- Column 0: `Date`
- Column 3: `Min Stay`
- Column 4: `Price with Default Customization` (the one we use)
- Column 6: `Available`

## Benefits

✅ **Dynamic Pricing**: Prices automatically adjust based on season, demand, events  
✅ **Accurate Rates**: Guests see the exact prices from your pricing strategy  
✅ **Transparent**: Nightly breakdown shows exactly what they're paying  
✅ **Professional**: Matches your pricing across all booking channels  
✅ **Flexible**: Easy to update by replacing the CSV file  
✅ **Reliable**: Fallback ensures bookings never fail

## Testing

### Test the Pricing Integration

1. **Navigate to booking page**:
   ```
   http://localhost:3004/accommodations/[property-id]/book
   ```

2. **Select dates from the CSV range**:
   - Pick dates from Oct 17, 2025 onwards
   - These dates have actual pricing data

3. **Verify the breakdown**:
   - ✓ Nightly prices match CSV values
   - ✓ Total is calculated correctly
   - ✓ Individual dates show the right rates
   - ✓ Fees are added properly

4. **Test with dates outside CSV**:
   - Select dates before Oct 17, 2025
   - Should show "Using estimated pricing"
   - Should use R1,500/night default

### API Testing

Test the API directly:
```bash
curl "http://localhost:3004/api/get-pricing?propertyId=uplisting_135133&checkInDate=2025-10-17&checkOutDate=2025-10-19"
```

Expected response:
```json
{
  "numberOfNights": 2,
  "nightlyPrices": [
    {"date": "2025-10-17", "price": 1343},
    {"date": "2025-10-18", "price": 1642}
  ],
  "basePrice": 2985,
  "averagePricePerNight": 1492.5,
  "cleaningFee": 500,
  "serviceFee": 358.2,
  "total": 3843.2
}
```

## Maintenance

### Updating Prices

To update prices:
1. Export new CSV from PriceLabs
2. Replace the file in `public/pricing/`
3. No code changes needed - prices update immediately

### Monitoring

The system logs pricing operations:
- CSV parsing success/failure
- Date ranges requested
- Fallback to default pricing

Check server logs for:
```
Error reading CSV file: ...
Using default pricing (CSV not available)
```

## Future Enhancements

Possible improvements:
- [ ] Store pricing in database instead of CSV
- [ ] Support multiple properties with separate CSV files
- [ ] Add minimum stay validation before booking
- [ ] Show dynamic pricing calendar on property listings
- [ ] Add special promotions/discounts support
- [ ] Integrate directly with PriceLabs API
- [ ] Cache pricing data for performance

## Summary

Your booking system now uses real pricing data from PriceLabs! Guests see accurate, date-specific rates with full transparency. The system is flexible, reliable, and easy to maintain - just update the CSV file whenever your pricing strategy changes.

The dev server is running on **http://localhost:3004** - visit any property booking page to see the new dynamic pricing in action! 🎉

