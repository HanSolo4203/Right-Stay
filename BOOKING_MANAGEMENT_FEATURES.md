# Booking Management Features

## Overview

The admin dashboard now includes comprehensive booking management with payment tracking, status updates, and deletion controls for direct bookings.

## 🚀 New Features

### 1. Payment Tracking System

All bookings now track payment information:

- **Payment Status**: pending, partial, paid, refunded
- **Payment Date**: When payment was received
- **Payment Method**: Bank Transfer, Credit Card, Debit Card, Cash, PayPal, Other
- **Payment Notes**: Additional payment-related notes

#### Database Changes

Run the migration to add payment tracking fields:

```sql
-- Location: supabase/migrations/add_payment_tracking.sql
```

This adds:
- `payment_status` column (default: 'pending')
- `payment_date` column
- `payment_method` column  
- `payment_notes` column

### 2. Booking Status Management

Admins can now update booking and payment status through the UI:

- **Edit Button** (green pencil icon) - Opens status update modal
- **Update Form** - Change booking status, payment status, payment details
- **Validation** - Bookings can only be confirmed if payment status is "Paid"

#### Status Flow

1. **Guest Books Property** → Status: `pending`, Payment: `pending`
2. **Admin Receives Payment** → Payment Status: `paid`
3. **Admin Confirms Booking** → Booking Status: `confirmed` (only allowed after payment)

### 3. Delete Controls

**Important**: Only Direct bookings can be deleted!

- **Delete Button** (red trash icon) - Only visible for Direct channel bookings
- **Protection** - Other channel bookings cannot be deleted (server-side validation)
- **Confirmation** - Requires user confirmation before deletion

#### Why This Restriction?

- **Direct Bookings**: Managed entirely by you, safe to delete
- **External Bookings**: From Airbnb, Booking.com, etc. - should be cancelled, not deleted, to maintain records

### 4. Booking Creation (Automatic)

When guests book through your website:

- Booking created with status: `pending`
- Payment status automatically set to: `pending`
- Booking reference format: `DIR-{timestamp}-{random}`
- Channel automatically set to: `Direct`

## 📋 Workflow Example

### Complete Booking Workflow

```
1. Guest books property via website
   ├─ Booking created: status = pending
   ├─ Payment status = pending
   └─ Admin notified

2. Admin reviews booking in dashboard
   ├─ Clicks "Edit" button
   └─ Views booking details

3. Admin receives payment
   ├─ Updates payment status to "paid"
   ├─ Enters payment date
   ├─ Selects payment method
   └─ Adds payment notes (optional)

4. Admin confirms booking
   ├─ Changes booking status to "confirmed"
   └─ Guest notified (if notifications set up)

5. After guest stay
   └─ Admin marks as "completed"
```

### Cancellation Workflow

```
For Direct Bookings:
├─ Option 1: Change status to "cancelled"
└─ Option 2: Delete booking entirely

For External Bookings (Airbnb, etc.):
└─ Only option: Change status to "cancelled"
   (Delete button not shown)
```

## 🎯 Admin Dashboard Actions

### View Booking Details (Eye Icon)
- Opens modal with complete booking information
- Shows guest info, property details, dates, financial breakdown
- Displays payment status and history

### Edit Booking (Pencil Icon)
- Opens status update form
- Update booking status (pending → confirmed → completed)
- Track payment status and details
- **Validation**: Cannot confirm without payment

### Delete Booking (Trash Icon)
- **Only for Direct bookings**
- Permanently removes booking
- Requires confirmation
- Server validates channel before deletion

## 🔒 Security & Validation

### Server-Side Protection

1. **Status Update Validation**
   ```typescript
   if (booking_status === 'confirmed' && payment_status !== 'paid') {
     return error: 'Cannot confirm booking without payment confirmation'
   }
   ```

2. **Delete Validation**
   ```typescript
   if (channel.name !== 'Direct') {
     return error: 'Only Direct bookings can be deleted'
   }
   ```

### Client-Side Warnings

- Visual warning if trying to confirm without payment
- Alert message if trying to delete non-Direct booking
- Confirmation dialog before deletion

## 📊 UI Features

### Color-Coded Status Badges

**Booking Status:**
- 🟢 Confirmed - Green
- 🟡 Pending - Yellow
- 🔵 Completed - Blue
- 🔴 Cancelled - Red

**Payment Status:**
- 🟢 Paid - Green
- 🟡 Partial - Yellow
- 🟠 Pending - Orange
- 🔴 Refunded - Red

### Action Buttons

All bookings show:
- 👁️ **View** button (blue) - Always visible
- ✏️ **Edit** button (green) - Always visible
- 🗑️ **Delete** button (red) - **Only for Direct bookings**

### Booking Table

Displays:
- Reference number
- Property name
- Guest name
- Check-in/out dates
- Number of nights
- Booking channel
- Status badge
- Total payout
- Action buttons

## 🔧 API Endpoints

### Get All Bookings
```http
GET /api/admin/bookings
```

Returns bookings with related data (apartment, guest, channel).

### Update Booking
```http
PUT /api/admin/bookings?id={booking_id}
Content-Type: application/json

{
  "booking_status": "confirmed",
  "payment_status": "paid",
  "payment_date": "2025-10-17",
  "payment_method": "Bank Transfer",
  "payment_notes": "Reference: TXN123456"
}
```

**Validation**: Returns error if trying to confirm without payment.

### Delete Booking
```http
DELETE /api/admin/bookings?id={booking_id}
```

**Validation**: Returns 403 error if not a Direct booking.

## 📝 Database Schema

### Bookings Table (Updated)

```sql
bookings (
  -- Existing fields
  id uuid,
  booking_reference text,
  booking_status text,
  -- ... other fields
  
  -- New payment tracking fields
  payment_status text DEFAULT 'pending',
  payment_date timestamp,
  payment_method text,
  payment_notes text
)
```

### Payment Status Values

- `pending` - Awaiting payment
- `partial` - Deposit or partial payment received
- `paid` - Full payment received
- `refunded` - Payment refunded to guest

## 🚦 Setup Instructions

### 1. Run Database Migration

```bash
# Option A: Supabase Dashboard
# Go to SQL Editor and run:
# supabase/migrations/add_payment_tracking.sql

# Option B: Supabase CLI
supabase db push
```

### 2. Test the System

1. Navigate to admin dashboard: `http://localhost:3000/admin`
2. Click "Bookings" tab
3. Test creating a booking through website
4. Verify booking appears with "pending" status
5. Test editing status and payment details
6. Test deletion (only for Direct bookings)

### 3. Verify Direct Channel Exists

The "Direct" channel is created automatically when a booking is made through the website. No manual setup required!

## 💡 Best Practices

### For Admins

1. **Always update payment status first** before confirming bookings
2. **Add payment notes** for tracking and reference
3. **Use cancellation** for non-Direct bookings, not deletion
4. **Keep payment date accurate** for financial records
5. **Review pending bookings daily**

### For Developers

1. Payment status should be updated when payment is confirmed
2. Email notifications can be added on status changes
3. Consider adding audit logs for status changes
4. Backup data before bulk operations
5. Test deletion permissions thoroughly

## 🐛 Troubleshooting

### Cannot confirm booking
**Error**: "Cannot confirm booking without payment confirmation"
**Solution**: Update payment status to "paid" before confirming

### Delete button not showing
**Reason**: Booking is not from Direct channel
**Solution**: Use "cancelled" status instead of deletion

### Payment fields not visible
**Issue**: Migration not run
**Solution**: Run add_payment_tracking.sql migration

### Status not updating
**Check**: Browser console for errors
**Check**: Network tab for API response
**Fix**: Verify database permissions

## 🔄 Future Enhancements

Potential additions:
- [ ] Email notifications on status changes
- [ ] Automated payment reminders
- [ ] Bulk status updates
- [ ] Payment receipt uploads
- [ ] Refund tracking and processing
- [ ] Payment gateway integration
- [ ] Automated booking confirmation
- [ ] Guest self-service portal

## 📞 Summary

✅ **New Features Implemented:**
- Payment tracking (status, date, method, notes)
- Admin can edit booking status
- Admin can only confirm after payment received
- Delete function for Direct bookings only
- Protected deletion for external bookings
- Color-coded status indicators
- Payment information in booking details
- Server-side validation

✅ **Automatic Behavior:**
- Website bookings → pending status
- Website bookings → pending payment
- Direct channel auto-created
- Edit button for all bookings
- Delete button only for Direct bookings

✅ **Security:**
- Cannot confirm without payment
- Cannot delete non-Direct bookings
- Confirmation required before deletion
- Server-side validation enforced

---

**Ready to Use!** The booking management system is fully functional and secure. 🎉

