# Property Mapping Setup Guide

## Overview

This guide explains how to set up the property mapping system that links Uplisting property IDs to internal apartment records.

## 🎯 The Problem

When guests book through your website, they're using Uplisting property IDs (like "135133"), but your database uses internal apartment UUIDs. We need to map these so bookings go to the correct apartment.

## ✅ The Solution

A property mapping table that links:
- **Uplisting Property ID**: `135133`
- **Internal Apartment**: `Apartment 202`

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Create property mapping table to link Uplisting properties to apartments
CREATE TABLE IF NOT EXISTS property_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uplisting_property_id TEXT NOT NULL UNIQUE,
    apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_mapping_uplisting_id ON property_mapping(uplisting_property_id);
CREATE INDEX IF NOT EXISTS idx_property_mapping_apartment_id ON property_mapping(apartment_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_property_mapping_updated_at
    BEFORE UPDATE ON property_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the specific mapping for property 135133 -> apartment 202
-- First, let's find the apartment with number 202
INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT '135133', id 
FROM apartments 
WHERE apartment_number = '202'
ON CONFLICT (uplisting_property_id) DO UPDATE SET
    apartment_id = EXCLUDED.apartment_id,
    updated_at = NOW();
```

### Step 2: Verify the Mapping

After running the migration, verify it worked:

```sql
-- Check if the mapping was created
SELECT 
    pm.uplisting_property_id,
    a.apartment_number,
    a.address
FROM property_mapping pm
JOIN apartments a ON pm.apartment_id = a.id
WHERE pm.uplisting_property_id = '135133';
```

You should see:
```
uplisting_property_id | apartment_number | address
135133               | 202              | [apartment address]
```

### Step 3: Test Booking Creation

1. Try creating a booking through your website
2. Check the admin dashboard → Bookings tab
3. Verify the booking shows apartment "202" instead of random apartment numbers

## 🎛️ Admin Interface

### Access Property Mapping

1. Go to `/admin`
2. Click on "Property Mapping" tab
3. You'll see all current mappings

### Add New Mappings

1. Click "Add Mapping" button
2. Enter:
   - **Uplisting Property ID**: e.g., "135133"
   - **Apartment**: Select from dropdown (e.g., "202")
3. Click "Create Mapping"

### Edit Existing Mappings

1. Click the edit button (pencil icon) on any mapping
2. Update the apartment assignment
3. Click "Update Mapping"

### Delete Mappings

1. Click the delete button (trash icon)
2. Confirm deletion

## 📊 How It Works

### Booking Flow

```
1. Guest books property "135133" on website
   ↓
2. Booking API receives propertyId = "135133"
   ↓
3. API checks: Is this a UUID? No, it's numeric
   ↓
4. API queries property_mapping table:
   SELECT * FROM property_mapping WHERE uplisting_property_id = '135133'
   ↓
5. API finds: apartment_id = [UUID for apartment 202]
   ↓
6. Booking created with correct apartment_id
   ↓
7. Admin dashboard shows booking for "Apartment 202"
```

### Database Structure

```sql
property_mapping (
  id UUID PRIMARY KEY,
  uplisting_property_id TEXT UNIQUE,  -- "135133"
  apartment_id UUID REFERENCES apartments(id),  -- Links to apartment 202
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔧 Adding More Mappings

If you have more Uplisting properties, add them through the admin interface:

### Example Mappings

```sql
-- Property 135133 → Apartment 202
INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT '135133', id FROM apartments WHERE apartment_number = '202';

-- Property 135134 → Apartment 301  
INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT '135134', id FROM apartments WHERE apartment_number = '301';

-- Property 135135 → Apartment 102
INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT '135135', id FROM apartments WHERE apartment_number = '102';
```

## 🐛 Troubleshooting

### Booking Shows Wrong Apartment

1. Check if mapping exists:
   ```sql
   SELECT * FROM property_mapping WHERE uplisting_property_id = '135133';
   ```

2. If missing, add it through admin interface

### Error: "No apartment mapping found"

This means the Uplisting property ID doesn't have a mapping. Either:
- Add the mapping through admin interface
- Check if the property ID is correct

### Property ID Not Found

Verify the property ID being sent from the frontend:
1. Check browser network tab
2. Look at booking request payload
3. Ensure it matches what's in Uplisting

## 📈 Benefits

✅ **Accurate Bookings**: Bookings go to the correct apartment
✅ **Admin Clarity**: Easy to see which bookings belong to which property
✅ **Scalable**: Easy to add more property mappings
✅ **Flexible**: Can change mappings without code changes
✅ **Audit Trail**: Track when mappings were created/updated

## 🔄 Future Enhancements

Potential improvements:
- [ ] Bulk import mappings from CSV
- [ ] Sync with Uplisting API to auto-create mappings
- [ ] Mapping validation (ensure apartment exists)
- [ ] History tracking for mapping changes
- [ ] Export mappings for backup

---

**Ready!** Your property mapping system is now set up. Uplisting property "135133" will correctly map to apartment "202" in all future bookings. 🎉
