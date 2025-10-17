# How to Get Your Uplisting API Key

## Current Status

✅ **FIXED:** API endpoint now using correct URL (`connect.uplisting.io`)  
❌ **ISSUE:** API key is invalid or expired

Current API key in `.env.local`: `a7597621-1380-434b-8439-dbf3ed418991`

Error message: **"Your API key does not appear to be valid."**

## Steps to Get a Valid API Key

### 1. Log into Uplisting

Go to: https://app.uplisting.io/login

### 2. Navigate to API Settings

Once logged in:
1. Click on **Settings** (gear icon or settings menu)
2. Look for **Connect** or **Integrations** section
3. Click on **API** or **API Key**

### 3. Generate/Regenerate API Key

- If you see an existing API key, try **regenerating** it
- If no key exists, click **Generate API Key** or **Create API Key**
- **Copy the key immediately** (you may not be able to see it again)

### 4. Update Your `.env.local` File

Replace the current key in `.env.local`:

```env
UPLISTING_API_KEY=your_new_api_key_here
```

### 5. Restart Your Development Server

```bash
# Stop the server (Ctrl+C in terminal)
# Then restart it:
npm run dev
```

### 6. Test the Connection

Visit: http://localhost:3000/api/test-uplisting

You should see:
```json
{
  "status": "success",
  "message": "Successfully connected to Uplisting API",
  "properties_found": 7,
  ...
}
```

### 7. Sync Photos!

Once the test passes, sync all property photos:

```bash
curl http://localhost:3000/api/sync-photos
```

Or visit in your browser: http://localhost:3000/api/sync-photos

## Troubleshooting

### "API key does not appear to be valid"

**Possible causes:**
1. API key was copied incorrectly (extra spaces, missing characters)
2. API key has been revoked or expired
3. API access is not enabled for your Uplisting account

**Solutions:**
- Regenerate a fresh API key
- Double-check you copied the entire key
- Contact Uplisting support if regenerating doesn't work

### Can't Find API Settings

The location might vary by account type:
- Try: Settings > Integrations > API
- Try: Settings > Connect > API Key
- Try: Settings > Developer > API Access

If you still can't find it, contact Uplisting support:
- Email: support@uplisting.io
- In-app chat support
- Help documentation: https://support.uplisting.io

### API Key Permissions

Make sure your API key has permission to:
- Read properties ✓
- Read property photos ✓

Some accounts may have restricted API access.

## Alternative: Manual Photo Import

If you can't get API access working, you can manually add photos using our tool:

```bash
curl -X POST http://localhost:3000/api/manual-add-photo \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "126709",
    "photos": [
      {"url": "https://your-image-url.jpg", "position": 0}
    ]
  }'
```

See `app/api/manual-add-photo/route.ts` for full documentation.

## What's Ready

Once you have a valid API key, everything is ready to go:

✅ Database schema created  
✅ API endpoints configured  
✅ Frontend ready to display photos  
✅ Correct API URL (`connect.uplisting.io`)  
✅ Correct authentication format (`Bearer` token)  

**You're just one valid API key away from success!** 🎉

## Quick Test Commands

```bash
# Test API connection
curl http://localhost:3000/api/test-uplisting

# Sync all photos (once API key works)
curl http://localhost:3000/api/sync-photos

# Check photo data in database
curl http://localhost:3000/api/check-cached-photos
```

## Need Help?

If you continue having issues:
1. Contact Uplisting support for API access
2. Check your Uplisting account type (some features may require paid plans)
3. Use the manual photo import tool as a temporary workaround

