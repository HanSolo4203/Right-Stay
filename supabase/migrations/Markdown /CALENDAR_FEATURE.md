# Availability Calendar Feature

## Overview
Added an interactive availability calendar to the booking page that shows date availability with unavailable dates greyed out and not selectable.

## Files Created/Modified

### 1. New Files Created

#### `components/AvailabilityCalendar.tsx`
A fully-featured availability calendar component with:
- **Visual month-by-month calendar display**
- **Real-time availability checking** - fetches blocked dates from the database
- **Smart date selection**:
  - Click to select check-in date
  - Click again to select check-out date
  - Automatically validates that no blocked dates are in the selected range
  - Prevents selection of past dates or blocked dates
- **Visual indicators**:
  - Greyed out unavailable dates with line-through styling
  - Blue highlighting for selected dates
  - Light blue for dates in the selected range
  - Clear legend showing what each color means
- **User-friendly features**:
  - Instructions that update as you select dates
  - Clear selection button to start over
  - Month navigation with prev/next buttons
  - Responsive design for mobile and desktop
  - Loading states while fetching availability

#### `app/api/get-blocked-dates/route.ts`
New API endpoint to fetch blocked dates for a property:
- **Endpoint**: `GET /api/get-blocked-dates`
- **Parameters**: 
  - `propertyId` - The property to check
  - `startDate` - Start of date range (YYYY-MM-DD)
  - `endDate` - End of date range (YYYY-MM-DD)
- **Returns**: List of all blocked dates in the range
- **Data Source**: Queries the `cached_availability` table

### 2. Modified Files

#### `app/accommodations/[id]/book/page.tsx`
- Removed simple HTML date inputs
- Integrated the `AvailabilityCalendar` component
- Calendar automatically updates the form data when dates are selected
- Removed unused helper functions (`getMinCheckInDate`, `getMinCheckOutDate`)
- Maintains all existing validation and booking logic

## How It Works

### Data Flow
1. User opens the booking page for a property
2. Calendar component fetches blocked dates for the next 3 months from `/api/get-blocked-dates`
3. User clicks on available dates to select check-in and check-out
4. Component validates that no blocked dates exist in the selected range
5. Selected dates update the form state
6. Existing pricing calculation and availability check continue to work
7. User completes booking with the selected dates

### Date Blocking
- Dates are blocked based on the `cached_availability` table
- The table is populated via iCal sync (see `ICAL_SYNC_SUMMARY.md`)
- Blocked dates have `available = false`
- Calendar fetches 3 months of data at a time for performance

### Visual Design
The calendar uses a clean, modern design that matches the rest of the site:
- Rounded corners and soft shadows
- Blue accent color for selected dates
- Grey for unavailable dates with line-through
- Hover effects on available dates
- Clear visual feedback for all interactions

## Features

### ✅ Implemented
- [x] Visual calendar display
- [x] Blocked dates greyed out and not selectable
- [x] Past dates not selectable
- [x] Date range selection (check-in to check-out)
- [x] Validation prevents selecting ranges with blocked dates
- [x] Month navigation
- [x] Responsive design
- [x] Loading states
- [x] Clear selection option
- [x] Visual legend
- [x] Instructions for users

### 🎯 User Experience
- Simple two-step selection: check-in → check-out
- Visual feedback at every step
- Automatic validation of date ranges
- Can't accidentally book unavailable dates
- Mobile-friendly touch interactions
- Fast loading with optimized API calls

## Usage

The calendar is automatically shown on all booking pages:
```
/accommodations/[property-id]/book
```

No manual configuration needed - it works with the existing availability data.

## Technical Details

### API Integration
- Uses the existing `cached_availability` table
- Fetches 3 months of data at a time to reduce API calls
- Updates when user navigates between months
- Handles loading and error states gracefully

### State Management
- Calendar maintains selection state internally
- Passes selected dates to parent form via callback
- Parent form continues to handle validation and submission
- No breaking changes to existing booking flow

### Performance
- Only fetches dates for visible months + 2 months ahead
- Caches blocked dates in component state
- Minimal re-renders using React hooks
- Optimized rendering for 42+ day cells

## Testing the Feature

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to accommodations**:
   ```
   http://localhost:3000/accommodations
   ```

3. **Click "Book Now" on any property**

4. **Test the calendar**:
   - Click on an available date (should highlight)
   - Click on another available date (should complete selection)
   - Try clicking on a greyed out date (should not select)
   - Navigate between months
   - Clear selection and try again

## Future Enhancements

Possible improvements for the future:
- [ ] Show pricing per night on hover
- [ ] Highlight special rates or promotions
- [ ] Show minimum stay requirements
- [ ] Add keyboard navigation
- [ ] Multi-month view on desktop
- [ ] Show reasons for blocked dates (maintenance, booked, etc.)
- [ ] Quick date range presets (Weekend, Week, etc.)

## Dependencies

Uses existing dependencies:
- `lucide-react` - For icons (ChevronLeft, ChevronRight, Loader2)
- `next` - For routing and API routes
- `react` - For component state and hooks
- Supabase client - For database queries

No new packages required!

