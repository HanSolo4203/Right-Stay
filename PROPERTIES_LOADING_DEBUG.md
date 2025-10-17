# Properties Not Loading in Vercel - Debug Guide

## Issue
The Properties section in your admin dashboard shows "No properties found" in Vercel, even though you have 14 apartments in your Supabase database.

## Debugging Steps

### 1. Check Environment Variables in Vercel

Go to your Vercel dashboard:
1. Select your project
2. Go to **Settings** → **Environment Variables**
3. Verify these variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

**Important**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (not just `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. Test Database Connection

I've added a test endpoint. After deployment, visit:
```
https://your-vercel-app.vercel.app/api/test-db
```

This will show:
- Environment variables status
- Database connection status
- Sample apartment data

### 3. Check Browser Console

1. Open your admin dashboard in Vercel
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Navigate to Properties section
5. Look for error messages or logs

You should see logs like:
```
Fetching properties from API...
Response status: 200
Properties data: [...]
```

### 4. Check Network Tab

1. Open Developer Tools
2. Go to **Network** tab
3. Navigate to Properties section
4. Look for the `/api/admin/properties` request
5. Check:
   - Status code (should be 200)
   - Response body
   - Any error messages

### 5. Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Functions** tab
4. Look for recent `/api/admin/properties` executions
5. Check for error logs

## Common Issues & Solutions

### Issue 1: Missing Environment Variables
**Symptoms**: API returns 500 error, logs show "MISSING" for env vars

**Solution**:
1. Add missing environment variables in Vercel
2. Redeploy the application
3. Test again

### Issue 2: Wrong Supabase Key
**Symptoms**: Database connection fails, permission errors

**Solution**:
1. Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
2. Get it from Supabase Dashboard → Settings → API
3. Update in Vercel environment variables

### Issue 3: CORS Issues
**Symptoms**: Network errors, CORS policy errors

**Solution**:
- The API routes should work without CORS issues
- Check if you're accessing the correct domain

### Issue 4: Database Table Name
**Symptoms**: "relation does not exist" errors

**Solution**:
- Verify table name is `apartments` (not `properties`)
- Check Supabase database structure

## Quick Fixes

### Fix 1: Re-deploy with Environment Variables
```bash
# If you need to update env vars, do it in Vercel dashboard then:
# Trigger a new deployment by pushing a small change
echo "# Trigger deployment" >> README.md
git add README.md
git commit -m "Trigger deployment"
git push origin main
```

### Fix 2: Test Locally First
```bash
# Test the API locally
npm run dev
# Visit: http://localhost:3000/api/test-db
```

### Fix 3: Check Supabase Dashboard
1. Go to your Supabase project
2. Check **Table Editor** → `apartments` table
3. Verify data exists and table structure is correct

## Expected Results

After fixing the issue, you should see:
1. **Test endpoint** (`/api/test-db`) returns success with apartment data
2. **Properties API** (`/api/admin/properties`) returns array of apartments
3. **Admin dashboard** shows your 14 apartments instead of "No properties found"

## Files Modified for Debugging

1. **`/api/test-db/route.ts`** - New test endpoint
2. **`/api/admin/properties/route.ts`** - Added detailed logging
3. **`components/admin/PropertySettings.tsx`** - Added error handling and logging

## Next Steps

1. **Deploy and test** the debugging changes
2. **Check the test endpoint** to verify database connection
3. **Check browser console** for specific error messages
4. **Update environment variables** if needed
5. **Redeploy** if environment variables were missing

## Support

If the issue persists:
1. Share the output from `/api/test-db`
2. Share browser console logs
3. Share Vercel function logs
4. Verify Supabase database structure

---

**Status**: 🔍 Debugging in progress  
**Last Updated**: October 17, 2025
