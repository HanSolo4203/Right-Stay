# Create Guide Photos Storage Bucket

## Quick Steps

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/dqnrofcmtxwscuw/storage
   - Or navigate: Dashboard → Your Project → **Storage** (left sidebar)

2. **Create New Bucket**:
   - Click the **"New bucket"** button (top right)
   - Or click **"Create a new bucket"** if you see an empty state

3. **Configure the Bucket**:
   - **Name**: `guide-photos` (exactly this name - it's case-sensitive)
   - **Public bucket**: ✅ **Toggle ON** (this allows images to be accessed via public URLs)
   - **File size limit**: `5242880` (5MB in bytes) or leave default
   - **Allowed MIME types**: Leave empty for all image types, or enter: `image/jpeg,image/png,image/webp,image/gif`

4. **Create**:
   - Click **"Create bucket"** button

5. **Verify**:
   - You should see `guide-photos` in your buckets list
   - The bucket should show as "Public"

### Option 2: Via SQL (Alternative)

If you prefer SQL, you can also create it via the SQL Editor:

1. Go to: https://supabase.com/dashboard/project/dqnrofcmtxwscuw/sql/new
2. Run this SQL:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-photos', 'guide-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up public read access policy
CREATE POLICY "Public can view guide photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guide-photos');

-- Set up service role upload policy
CREATE POLICY "Service role can upload guide photos"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'guide-photos');

-- Set up service role delete policy
CREATE POLICY "Service role can delete guide photos"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'guide-photos');
```

## Verification

After creating the bucket, test it by:

1. **Upload a test image** via the Storage dashboard:
   - Go to Storage → `guide-photos`
   - Upload any image
   - Open the file and confirm the public URL loads in the browser

2. **Or test via API** (once guide photo upload is wired in admin):
   ```bash
   curl -X POST http://localhost:3000/api/admin/guide-items/upload-photo \
     -F "file=@/path/to/image.jpg" \
     -F "guideItemId=<uuid>" \
     -F "isPrimary=true"
   ```

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket name is exactly `guide-photos` (lowercase, with hyphen)
- Check that the bucket exists in Storage → Buckets

### "Permission denied" error
- Make sure the bucket is set to **Public**
- Check that storage policies are set up correctly

### Images not displaying
- Verify the bucket is public
- Check that the URLs are being generated correctly
- Look at browser console for CORS errors

## Storage Policies (Optional but Recommended)

For better security, you can restrict uploads to authenticated users only:

1. Go to **Storage** → **Policies** → `guide-photos`
2. Review existing policies
3. The SQL above creates the necessary policies automatically

## Next Steps

Once the bucket is created:
1. ✅ Image upload will work for Things To Do guide items
2. ✅ Photos will be stored in Supabase Storage
3. ✅ Photos will be linked to guide items via `guide_item_photos` table
4. ✅ Images will be accessible via public URLs
