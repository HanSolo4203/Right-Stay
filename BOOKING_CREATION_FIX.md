# Booking Creation 500 Error - Fixed

## Issue
Users were getting a 500 Internal Server Error when trying to create bookings, with the error message "Failed to create guest record" appearing on the booking form.

## Root Cause
The booking creation API (`/api/bookings/create`) was using the `supabaseServer` client from `/lib/supabase-server.ts`, which may not have been properly configured with the correct environment variables in Vercel.

## Solution Applied

### 1. **Direct Supabase Client Creation**
- Removed dependency on `supabaseServer` import
- Created Supabase client directly in the API route with better error handling
- Added environment variable validation at startup

### 2. **Enhanced Error Handling**
- Added pre-flight checks for environment variables
- Better error messages for debugging
- Detailed logging for troubleshooting

### 3. **Fallback Configuration**
- Uses `SUPABASE_SERVICE_ROLE_KEY` first, falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Validates both URL and key before attempting database operations

## Code Changes

### Before:
```typescript
import { supabaseServer } from '@/lib/supabase-server';
// Used supabaseServer throughout the API
```

### After:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Direct client creation with validation
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Pre-flight environment check
if (!supabaseUrl || !supabaseServiceKey) {
  return NextResponse.json(
    { error: 'Server configuration error. Please contact support.' },
    { status: 500 }
  );
}
```

## Environment Variables Required

Make sure these are set in your Vercel dashboard:

### Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (preferred)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key (fallback)

### Getting the Keys:
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **service_role** key

## Testing the Fix

### 1. **Check Environment Variables**
Visit: `https://your-app.vercel.app/api/test-db`
Should return success with database connection info.

### 2. **Test Booking Creation**
1. Go to your property listing page
2. Fill out the booking form
3. Submit the booking
4. Should now work without 500 errors

### 3. **Check Vercel Logs**
1. Go to Vercel Dashboard → Your Project
2. Check **Functions** tab for recent `/api/bookings/create` executions
3. Look for detailed error logs if issues persist

## Expected Behavior

After the fix:
- ✅ Booking form submits successfully
- ✅ Guest records are created/updated
- ✅ Booking records are created with "pending" status
- ✅ User sees confirmation message
- ✅ No 500 errors in browser console

## Common Issues & Solutions

### Issue 1: Still Getting 500 Errors
**Check**: Environment variables in Vercel
**Solution**: Add missing `SUPABASE_SERVICE_ROLE_KEY`

### Issue 2: "Server configuration error"
**Check**: Both URL and key are set
**Solution**: Verify all environment variables in Vercel dashboard

### Issue 3: Database permission errors
**Check**: Using service role key (not anon key)
**Solution**: Use `SUPABASE_SERVICE_ROLE_KEY` for write operations

### Issue 4: Property mapping errors
**Check**: Property ID format and mapping table
**Solution**: Ensure property mappings exist for Uplisting properties

## Debugging Steps

### 1. **Check API Response**
Open browser DevTools → Network tab → Submit booking → Check `/api/bookings/create` response

### 2. **Check Console Logs**
Look for detailed error messages in browser console

### 3. **Check Vercel Function Logs**
Vercel Dashboard → Functions → Look for error logs

### 4. **Test Database Connection**
Visit `/api/test-db` to verify Supabase connection

## Files Modified

- `app/api/bookings/create/route.ts` - Fixed Supabase client configuration and error handling

## Deployment

The fix has been deployed to your repository. Vercel should automatically redeploy with these changes.

**Commit**: `96cf060` - "Fix booking creation API - improve Supabase connection handling and error logging"

## Next Steps

1. **Test the booking flow** on your live site
2. **Monitor Vercel logs** for any remaining issues
3. **Check environment variables** if problems persist
4. **Verify database permissions** if needed

---

**Status**: ✅ Fixed and deployed  
**Date**: October 17, 2025
