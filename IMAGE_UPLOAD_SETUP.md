# Image Upload Setup Guide

## Overview
Property image upload functionality has been added to the admin dashboard. Images are stored in Supabase Storage and linked to properties via the `property_photos` table.

## Database Setup

The `property_photos` table already exists and is properly linked to `cached_properties`:
- `property_id` → references `cached_properties.uplisting_id`
- Foreign key constraint ensures data integrity

## Supabase Storage Setup

### Step 1: Create Storage Bucket

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dqnrofcmtxwscuw
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `property-photos`
   - **Public bucket**: ✅ **Enable** (so images can be accessed via URL)
   - **File size limit**: 5MB (or your preference)
   - **Allowed MIME types**: `image/*` (or specific: `image/jpeg,image/png,image/webp`)

5. Click **"Create bucket"**

### Step 2: Set Storage Policies (Optional but Recommended)

For better security, you can set up Row Level Security policies:

1. Go to **Storage** → **Policies** → `property-photos`
2. Create a policy for uploads (service role can upload):
   ```sql
   -- Allow service role to upload
   CREATE POLICY "Service role can upload"
   ON storage.objects FOR INSERT
   TO service_role
   WITH CHECK (bucket_id = 'property-photos');
   ```

3. Create a policy for public access (for viewing):
   ```sql
   -- Allow public read access
   CREATE POLICY "Public can view"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'property-photos');
   ```

## Features Added

### Admin Dashboard - Property Edit Modal

1. **Photo Upload**
   - Click "Upload Photo" button in the edit property modal
   - Select image file (max 5MB)
   - First uploaded photo automatically becomes primary

2. **Photo Management**
   - View all uploaded photos in a grid
   - Set any photo as primary (star icon)
   - Delete photos (trash icon)
   - Hover over photos to see action buttons

3. **Photo Display**
   - Photos are displayed in the property edit modal
   - Primary photo is marked with a yellow badge
   - Photos are linked to `cached_properties` via `property_id`

## API Endpoints

### Upload Photo
```
POST /api/admin/properties/upload-photo
Content-Type: multipart/form-data

FormData:
- file: Image file
- propertyId: Property uplisting_id
- caption: Optional caption
- isPrimary: 'true' or 'false'
```

### Get Photos
```
GET /api/admin/properties/photos?propertyId=135133
```

### Delete Photo
```
DELETE /api/admin/properties/photos?id={photo_id}
```

### Update Photo (Set Primary)
```
PUT /api/admin/properties/photos?id={photo_id}
Content-Type: application/json

{
  "is_primary": true,
  "position": 0,
  "caption": "Optional caption"
}
```

## Database Relationships

```
cached_properties
├── id (UUID)
├── uplisting_id (TEXT) ←──┐
└── ...                     │
                            │
property_photos             │
├── id (UUID)               │
├── property_id (TEXT) ─────┘ (Foreign Key)
├── photo_id (TEXT)
├── url (TEXT) - Supabase Storage URL
├── caption (TEXT)
├── position (INTEGER)
├── is_primary (BOOLEAN)
└── ...
```

## Usage

1. **Edit a Property**:
   - Go to Admin Dashboard → Properties
   - Click the edit icon (pencil) on any property
   - Scroll to "Property Photos" section

2. **Upload Photos**:
   - Click "Upload Photo" button
   - Select an image file
   - Photo will appear in the grid below

3. **Set Primary Photo**:
   - Hover over any photo
   - Click the star icon to set as primary
   - Primary photo is used as the main image on property listings

4. **Delete Photos**:
   - Hover over any photo
   - Click the trash icon
   - Confirm deletion

## File Storage

- **Location**: Supabase Storage bucket `property-photos`
- **Path Format**: `property-photos/{property_id}/{timestamp}-{random}.{ext}`
- **Public URLs**: Generated automatically by Supabase
- **Max File Size**: 5MB (configurable in bucket settings)

## Notes

- Images are stored in Supabase Storage, not as base64 in the database
- The `property_photos` table stores metadata and URLs
- Only one photo can be primary per property
- Photos are automatically ordered by position
- Deleting a property will cascade delete its photos (via foreign key)



