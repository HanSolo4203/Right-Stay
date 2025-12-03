# Booking Feature Documentation

## Overview
The booking feature allows users to select properties, choose dates, enter personal information, and complete a booking request for Right Stay Africa properties.

## File Structure

### Pages
1. **`/app/accommodations/[id]/book/page.tsx`**
   - Main booking page with date selection and guest information form
   - Dynamic route that accepts property ID
   - Features:
     - Date picker with validation (check-in must be at least tomorrow)
     - Guest information form (name, email, phone, number of guests)
     - Special requests textarea
     - Real-time pricing calculation
     - Responsive design with sticky sidebar

2. **`/app/booking-confirmation/page.tsx`**
   - Success page shown after booking submission
   - Displays next steps and important information
   - Links to browse more properties or return home

### API Routes
1. **`/app/api/properties/route.ts`** (Updated)
   - GET endpoint now supports fetching single property via `?id=propertyId` query parameter
   - Returns property with photos and full details
   - Maintains backward compatibility for fetching all properties

2. **`/app/api/bookings/create/route.ts`** (New)
   - POST endpoint for creating new bookings
   - Creates or updates guest record
   - Creates booking linked to property and guest
   - Generates unique booking reference
   - Returns booking confirmation with reference number

### Components Updated
1. **`/components/sections/AccommodationCards.tsx`**
   - "Book Now" button now links to `/accommodations/{id}/book` instead of property detail page

## Features

### Date Selection
- Check-in date must be at least tomorrow
- Check-out date must be after check-in
- Automatic validation and min date constraints
- Real-time nights calculation

### Pricing Calculation
- Base price: R1,500 per night (configurable)
- Cleaning fee: R500 flat rate
- Service fee: 12% of base price
- Total automatically calculated when dates selected
- Pricing breakdown displayed in sidebar

### Guest Information
- Required fields: Name, Email, Number of Guests
- Optional fields: Phone, Special Requests
- Guest capacity validation against property maximum
- Guest record created or updated in database

### Booking Process
1. User selects property and clicks "Book Now"
2. User selects check-in and check-out dates
3. Pricing automatically calculated
4. User enters personal information
5. User submits booking request
6. System creates/updates guest record
7. System creates booking record with "pending" status
8. User redirected to confirmation page
9. Confirmation email sent (to be implemented)

### Database Integration
- Creates/updates records in `guests` table
- Creates booking in `bookings` table
- Links to `apartments` table
- Uses "Direct" booking channel
- Generates unique booking reference: `DIR-{timestamp}-{random}`

## Booking Status Flow
1. **Pending** - Initial status when booking created
2. **Confirmed** - After admin review and approval (manual)
3. **Completed** - After guest checkout
4. **Cancelled** - If booking cancelled

## Future Enhancements
- [ ] Payment gateway integration
- [ ] Real-time availability checking
- [ ] Email notifications (confirmation, reminder, etc.)
- [ ] Calendar view for date selection
- [ ] Multi-property booking
- [ ] Promo code/discount system
- [ ] Booking management dashboard for guests
- [ ] Admin booking approval workflow
- [ ] SMS notifications
- [ ] Dynamic pricing based on season/demand
- [ ] Property-specific pricing from database
- [ ] Integration with Uplisting calendar

## Testing

### To Test the Booking Flow:
1. Start the development server: `npm run dev`
2. Navigate to `/accommodations`
3. Click "Book Now" on any property
4. Fill in the booking form:
   - Select check-in date (tomorrow or later)
   - Select check-out date (after check-in)
   - Enter guest name and email
   - Optionally add phone and special requests
5. Review pricing in sidebar
6. Click "Confirm Booking"
7. Verify redirect to confirmation page
8. Check database for new booking and guest records

### Database Tables Used:
- `cached_properties` - Property details
- `property_photos` - Property images
- `guests` - Guest information
- `bookings` - Booking records
- `booking_channels` - Booking source (Direct)
- `apartments` - Property-apartment mapping (needs enhancement)

## Known Limitations
1. **Property-Apartment Mapping**: Currently uses first apartment as placeholder. Need to properly map `cached_properties` (Uplisting) to `apartments` table.
2. **Pricing**: Uses hardcoded pricing. Should fetch from property-specific rates or database.
3. **Availability**: No real-time availability checking. Need to integrate with `cached_availability` table.
4. **Payment**: No payment processing implemented yet.
5. **Email**: No automated email confirmations yet.

## Configuration
Pricing can be adjusted in `/app/accommodations/[id]/book/page.tsx`:
```typescript
const pricePerNight = 1500; // R1,500 per night
const cleaningFee = 500; // R500 flat fee
const serviceFee = basePrice * 0.12; // 12% service fee
```

## Security Considerations
- Form validation on both client and server
- SQL injection prevention via Supabase parameterized queries
- Input sanitization
- Error handling with user-friendly messages
- No sensitive data exposed in URLs or client-side code

