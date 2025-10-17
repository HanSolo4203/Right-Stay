# Date Display Fix: +1 Day Adjustment

## Issue
The booking summary dates were showing 1 day behind the calendar selection. For example:
- **Calendar**: Shows Oct 29-31 selected
- **Booking Summary**: Showed Oct 28-29 (wrong)
- **Needed**: Should show Oct 29-30 (1 day ahead)

## Solution Applied

### 1. Added New Date Function
Created `parseLocalDatePlusOne()` in `lib/date-utils.ts`:

```typescript
export const parseLocalDatePlusOne = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  return date;
};
```

This function:
- Parses the date string in local timezone
- Adds exactly 1 day to the date
- Returns the adjusted date for display

### 2. Updated Booking Page
Changed the date parsing in `app/accommodations/[id]/book/page.tsx`:

**Before**:
```typescript
import { parseLocalDate } from '@/lib/date-utils';
// ...
const date = parseLocalDate(night.date);
```

**After**:
```typescript
import { parseLocalDatePlusOne } from '@/lib/date-utils';
// ...
const date = parseLocalDatePlusOne(night.date);
```

## Expected Result

Now when you select Oct 29-31 on the calendar:

**Calendar**: Shows Oct 29-31 selected  
**Booking Summary**: Will display:
```
2 nights                          R4,792
├─ Oct 29                         R2,400  ✓ (was Oct 28)
└─ Oct 30                         R2,392  ✓ (was Oct 29)

Cleaning fee                      R500
Service fee (12%)                 R575

────────────────────────────────────
Total                             R5,867
```

## Files Changed

1. **`lib/date-utils.ts`** - Added `parseLocalDatePlusOne()` function
2. **`app/accommodations/[id]/book/page.tsx`** - Uses the +1 day function for display

## Testing

After restarting the dev server, the booking summary dates should now be 1 day ahead, matching your requirement.

## Build Status
✅ Build passes  
✅ No linting errors  
✅ Ready for testing  

The fix is implemented and ready to test!
