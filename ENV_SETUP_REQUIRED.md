# ⚠️ ENVIRONMENT SETUP REQUIRED

## Action Needed: Create .env.local file

Since `.env.local` is in `.gitignore` (for security), you need to manually create it.

### Steps:

1. **Create a new file** in the project root called `.env.local`

2. **Add these environment variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://kmkfrzahmvqvidyhjgmo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2ZyemFobXZxdmlkeWhqZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Njg2NTUsImV4cCI6MjA3MzA0NDY1NX0.Jt8YqXKEDqxqxQk5GSTNyqzXTJy7bGH5Pj6M5d5EZNc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta2ZyemFobXZxdmlkeWhqZ21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ2ODY1NSwiZXhwIjoyMDczMDQ0NjU1fQ.0Bp2FMG_w-bGEJGHBf0h4kMvC28m657BtID8Nu8GEGM

# Uplisting API Integration
# Get your API key from: Settings > Connect > API Key in your Uplisting account
UPLISTING_API_KEY=your_uplisting_api_key_here
```

3. **Save the file**

4. **Restart your Next.js development server:**
   ```bash
   npm run dev
   ```

## What's Been Updated

✅ **API Route Created:** `/app/api/properties/route.ts`
- Fetches `cached_properties` from Supabase

✅ **AccommodationCards Component Updated:**
- Now fetches real property data from the database
- Transforms Uplisting data to display format
- Includes loading states
- Falls back to static data if DB is unavailable

✅ **Supabase Integration:**
- Uses `cached_properties` table (7 properties from Uplisting)
- Displays property images, names, locations, pricing
- Shows amenities and property details

## How It Works

1. Component loads and shows skeleton loading state
2. Fetches data from `/api/properties` endpoint
3. API queries Supabase `cached_properties` table
4. Transforms JSONB data into card format
5. Displays properties with images from Uplisting

## Testing

Once `.env.local` is created and the server is restarted:
1. Visit the homepage
2. Scroll to "Premium Accommodations" section
3. You should see 7 properties loaded from your Supabase database
4. Each property will show real data from Uplisting

## Syncing Property Photos

After setting up the environment variables, you can sync property photos from Uplisting:

1. **Run the database migration** to create the `property_photos` table:
   - Go to your Supabase SQL Editor
   - Run the migration file: `supabase/migrations/create_property_photos.sql`

2. **Sync photos from Uplisting API**:
   - Visit: `http://localhost:3000/api/sync-photos` (syncs all properties)
   - Or visit: `http://localhost:3000/api/sync-photos?property_id=PROPERTY_ID` (syncs specific property)

3. **View synced photos**:
   - The photos will be automatically loaded in the AccommodationCards component
   - Each property will show its actual photos from Uplisting

---

**Note:** The anon key is safe for client-side use. The service role key should only be used server-side (which it is in the API route).

