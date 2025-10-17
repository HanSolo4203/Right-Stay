# Quick Test: Dynamic Pricing Integration

## ✅ System Status

**Dev Server**: Running on http://localhost:3004  
**CSV File**: Successfully loaded (42KB, 542 rows)  
**API Endpoint**: `/api/get-pricing` - Working ✓

## Test Results

### Test 1: Two-Night Stay (Oct 17-19, 2025)

**Request**:
```bash
curl "http://localhost:3004/api/get-pricing?propertyId=uplisting_135133&checkInDate=2025-10-17&checkOutDate=2025-10-19"
```

**Response**:
```json
{
  "propertyId": "uplisting_135133",
  "checkInDate": "2025-10-17",
  "checkOutDate": "2025-10-19",
  "numberOfNights": 2,
  "nightlyPrices": [
    {"date": "2025-10-17", "price": 1343},
    {"date": "2025-10-18", "price": 1642}
  ],
  "basePrice": 2985,
  "averagePricePerNight": 1492.5,
  "cleaningFee": 500,
  "serviceFee": 358.2,
  "total": 3843.2,
  "usingDefaultPricing": false
}
```

**✓ Verified**:
- Oct 17 price: R1,343 (matches CSV)
- Oct 18 price: R1,642 (matches CSV)
- Total accommodation: R2,985
- Cleaning fee: R500
- Service fee: R358.20 (12% of 2985)
- **Grand Total: R3,843.20**

---

## What to Test

### 1. Visit the Booking Page

Go to any property booking page:
```
http://localhost:3004/accommodations/[property-id]/book
```

### 2. Select Dates

Use the calendar to select:
- **Check-in**: Oct 17, 2025
- **Check-out**: Oct 19, 2025

### 3. Check the Booking Summary

You should see:
```
2 nights                          R2,985
├─ Oct 17                         R1,343
└─ Oct 18                         R1,642

Cleaning fee                      R500
Service fee (12%)                 R358

────────────────────────────────────
Total                             R3,843
```

### 4. Try Different Date Ranges

**Short stays (≤ 7 nights)**:
- Should show individual nightly prices
- Each date with its specific rate

**Longer stays (> 7 nights)**:
- Shows total accommodation cost
- Shows average nightly rate
- Cleaner UI for extended stays

---

## Sample Pricing from CSV

Here are some dates you can test with:

| Date | Nightly Rate | Status |
|------|--------------|--------|
| Oct 17, 2025 | R1,343 | Booked |
| Oct 18, 2025 | R1,642 | Booked |
| Oct 19, 2025 | R1,732 | Booked |
| Oct 20, 2025 | R1,696 | Booked |
| Oct 23, 2025 | R1,894 | Available |
| Oct 24, 2025 | R2,116 | Available |
| Nov 5, 2025 | R2,270 | Available |
| Dec 5, 2025 | R3,491 | Available |
| Dec 28, 2025 | R2,800 | Available |

**Note**: Dates marked "Booked" in the CSV should still show pricing but may be unavailable for selection in the calendar.

---

## Verifying the Integration

### ✓ Checklist

- [x] CSV file copied to `public/pricing/`
- [x] API endpoint created and working
- [x] Pricing calculation logic implemented
- [x] Booking page updated to use dynamic pricing
- [x] Nightly breakdown displays correctly
- [x] Fallback pricing works (for dates outside CSV)
- [x] Build passes with no errors
- [x] Dev server running successfully

### 🎯 Expected Behavior

1. **Calendar shows availability** - Greyed out dates are not selectable
2. **Date selection updates pricing** - Immediate calculation when dates picked
3. **Nightly breakdown visible** - For stays ≤ 7 nights
4. **Accurate totals** - Matches CSV data exactly
5. **Fees clearly shown** - Cleaning fee + 12% service fee
6. **Professional display** - Clean, easy-to-read summary

---

## Next Steps

Your dynamic pricing is now live! 

**To test it**:
1. Open http://localhost:3004/accommodations in your browser
2. Click "Book Now" on any property
3. Select dates from the calendar
4. Watch the pricing update automatically with real PriceLabs data

**To update pricing**:
- Just export new CSV from PriceLabs
- Replace the file in `public/pricing/`
- Prices update immediately (no code changes)

---

## Troubleshooting

**If pricing shows "Using estimated pricing"**:
- Check CSV file is in `public/pricing/` directory
- Verify filename matches: `PriceLabs_uplisting_135133_2025-10-17.csv`
- Check dates are within CSV range (Oct 17, 2025 onwards)

**If API returns error**:
- Check dev server is running
- Check terminal for error messages
- Verify CSV format matches expected structure

**If prices don't match CSV**:
- Verify using column "Price with Default Customization" (column 4)
- Check date format is YYYY-MM-DD
- Clear browser cache and refresh

---

## Summary

✅ **Dynamic pricing is working!**  
✅ **Calendar shows availability**  
✅ **Booking summary shows accurate rates**  
✅ **Ready for testing and production use**

The system automatically uses real pricing data from PriceLabs CSV exports, giving guests transparent, accurate pricing based on your dynamic pricing strategy! 🎉

