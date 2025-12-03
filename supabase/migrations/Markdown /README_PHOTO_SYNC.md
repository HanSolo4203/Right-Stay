# Property Photo Sync - Uplisting Integration

This guide explains how to sync property photos from Uplisting API to your database.

## Overview

The photo sync system fetches property photos from the Uplisting API and stores them in a dedicated `property_photos` table. Photos are then displayed in the AccommodationCards component.

## Setup

### 1. Database Setup

Run the migration to create the `property_photos` table:

```sql
-- In your Supabase SQL Editor, run:
-- supabase/migrations/create_property_photos.sql
```

The migration creates:
- `property_photos` table with columns:
  - `id`: UUID primary key
  - `property_id`: References `cached_properties.uplisting_id`
  - `photo_id`: Uplisting photo ID
  - `url`: Photo URL
  - `caption`: Optional caption
  - `position`: Display order
  - `is_primary`: Boolean flag for main photo
  - `width`, `height`: Photo dimensions
  - Timestamps: `created_at`, `updated_at`
- Indexes for performance
- Triggers for auto-updating timestamps

### 2. Environment Variables

Add your Uplisting API key to `.env.local`:

```env
UPLISTING_API_KEY=your_uplisting_api_key_here
```

Get your API key from:
1. Log into your Uplisting account
2. Navigate to: **Settings** > **Connect** > **API Key**
3. Copy the API key

### 3. Sync Photos

There are two ways to sync photos:

#### Option A: Sync All Properties
```
GET http://localhost:3000/api/sync-photos
```

This will:
- Fetch all properties from `cached_properties`
- For each property, fetch photos from Uplisting API
- Delete existing photos for each property
- Insert new photos into `property_photos` table
- Mark the first photo as primary

#### Option B: Sync Specific Property
```
GET http://localhost:3000/api/sync-photos?property_id=UPLISTING_PROPERTY_ID
```

Replace `UPLISTING_PROPERTY_ID` with the actual Uplisting property ID.

### Response Format

Success response:
```json
{
  "message": "Photo sync completed",
  "properties_processed": 7,
  "total_photos_synced": 42,
  "results": [
    {
      "property_id": "123456",
      "photos_count": 6,
      "status": "success"
    }
  ]
}
```

Error response:
```json
{
  "error": "Failed to sync photos",
  "details": "Error message here"
}
```

## How It Works

### Architecture

1. **Uplisting Service** (`lib/uplisting.ts`)
   - Handles all Uplisting API interactions
   - Functions:
     - `fetchUplistingProperties()`: Get all properties
     - `fetchUplistingProperty(propertyId)`: Get property with photos
     - `fetchPhotosForProperties(propertyIds[])`: Batch fetch photos

2. **Sync API** (`app/api/sync-photos/route.ts`)
   - Orchestrates the photo sync process
   - Fetches properties from database
   - Calls Uplisting API for each property
   - Saves photos to database

3. **Properties API** (`app/api/properties/route.ts`)
   - Enhanced to include photos
   - Fetches properties and their photos
   - Groups photos by property

4. **AccommodationCards Component** (`components/sections/AccommodationCards.tsx`)
   - Displays properties with photos
   - Uses primary photo or first photo
   - Falls back to placeholder if no photos

### Data Flow

```
Uplisting API 
  → Sync API (/api/sync-photos)
  → Database (property_photos table)
  → Properties API (/api/properties)
  → AccommodationCards Component
  → User sees real photos
```

## Usage Examples

### Manual Sync via Browser

Visit the sync endpoint in your browser:
```
http://localhost:3000/api/sync-photos
```

### Sync via cURL

```bash
# Sync all properties
curl http://localhost:3000/api/sync-photos

# Sync specific property
curl "http://localhost:3000/api/sync-photos?property_id=123456"
```

### Scheduled Sync

You can set up a cron job or scheduled task to sync photos regularly:

```bash
# Example cron job (daily at 2 AM)
0 2 * * * curl http://localhost:3000/api/sync-photos
```

Or use Vercel Cron Jobs if deployed on Vercel.

## Troubleshooting

### No photos syncing

1. **Check API key**: Ensure `UPLISTING_API_KEY` is correctly set
2. **Check API response**: Look at server logs for API errors
3. **Check database**: Verify `property_photos` table exists
4. **Check foreign keys**: Ensure `cached_properties` has matching `uplisting_id` values

### Photos not displaying

1. **Check sync status**: Visit `/api/sync-photos` to see sync results
2. **Check photo URLs**: Verify URLs in `property_photos` table are accessible
3. **Check browser console**: Look for image loading errors
4. **Check fallback**: Component should show placeholder if no photos

### API Rate Limits

If you hit Uplisting API rate limits:
- Sync properties in smaller batches
- Add delays between API calls
- Contact Uplisting support to increase limits

## Best Practices

1. **Initial Sync**: Run a full sync after setup
2. **Regular Syncs**: Schedule daily syncs to keep photos updated
3. **Error Handling**: Monitor sync results for errors
4. **Photo Storage**: Consider caching photos locally for better performance
5. **Image Optimization**: Use Next.js Image component for automatic optimization

## Future Enhancements

Potential improvements:
- Download and store photos locally (avoid Uplisting API calls for images)
- Add photo gallery/carousel for multiple photos
- Sync availability and pricing data
- Real-time sync webhooks from Uplisting
- Photo compression and CDN integration

## Support

For issues:
- Check Uplisting API documentation: https://api-docs.uplisting.io/
- Review server logs for detailed error messages
- Ensure all environment variables are set correctly

