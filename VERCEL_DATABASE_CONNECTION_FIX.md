# Vercel Database Connection Fix

## 🚨 Issue: Data exists in database but not showing in Vercel

If you have data in your Supabase database but the Vercel deployment shows "No properties found", this indicates a database connection issue.

## 🔍 Troubleshooting Steps

### Step 1: Verify Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `right-stay-one` project
3. Go to **Settings** → **Environment Variables**
4. Verify these are set correctly:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Step 2: Check Supabase Database Connection

Test the connection by visiting these URLs in your browser:

1. **Test API Endpoint**: `https://right-stay-one.vercel.app/api/admin/properties`
   - Should return JSON data of your properties
   - If it returns `[]` or error, the connection is broken

2. **Test Supabase Connection**: `https://right-stay-one.vercel.app/api/test-uplisting`
   - This will show if Supabase connection works

### Step 3: Common Issues & Solutions

#### Issue 1: Wrong Environment Variable Values
**Symptoms**: API returns empty arrays `[]`
**Solution**: 
- Double-check your Supabase project URL
- Ensure the anon key is correct (starts with `eyJ...`)
- Make sure service role key is the secret key (different from anon key)

#### Issue 2: Supabase Project Not Accessible
**Symptoms**: API returns 500 errors
**Solution**:
- Check if your Supabase project is paused (common on free tier)
- Verify your project is not deleted or suspended
- Check Supabase dashboard for any warnings

#### Issue 3: Row Level Security (RLS) Blocking Access
**Symptoms**: API works but returns empty results
**Solution**:
1. Go to Supabase Dashboard → Authentication → Policies
2. Check if RLS is enabled on your tables
3. If RLS is enabled, you need to create policies or disable it for admin access

#### Issue 4: Database Schema Mismatch
**Symptoms**: API returns errors about missing columns
**Solution**:
- Ensure all migrations have been run
- Check if table names match exactly (`apartments`, `bookings`, etc.)

### Step 4: Quick Database Test

Run this in your Supabase SQL Editor to verify data exists:

```sql
-- Check if apartments table has data
SELECT COUNT(*) as apartment_count FROM apartments;

-- Check if bookings table has data  
SELECT COUNT(*) as booking_count FROM bookings;

-- Check if guests table has data
SELECT COUNT(*) as guest_count FROM guests;

-- List first few apartments
SELECT apartment_number, owner_name FROM apartments LIMIT 5;
```

### Step 5: API Endpoint Testing

Test these endpoints directly in your browser:

1. `https://right-stay-one.vercel.app/api/admin/properties`
2. `https://right-stay-one.vercel.app/api/admin/bookings`
3. `https://right-stay-one.vercel.app/api/admin/site-settings`

Each should return JSON data. If they return empty arrays `[]`, the issue is with the database connection.

### Step 6: Enable CORS (if needed)

If you're getting CORS errors, add this to your API routes:

```typescript
// Add to the top of your API route files
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

## 🔧 Quick Fixes

### Fix 1: Redeploy with Correct Environment Variables
1. Update environment variables in Vercel
2. Click "Redeploy" in Vercel dashboard
3. Wait for deployment to complete
4. Test the API endpoints again

### Fix 2: Disable RLS for Admin Access (Temporary)
If Row Level Security is blocking access:

```sql
-- Disable RLS on main tables (temporary fix)
ALTER TABLE apartments DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_channels DISABLE ROW LEVEL SECURITY;
```

### Fix 3: Check Supabase Project Status
1. Go to [Supabase Dashboard](https://supabase.com)
2. Check if your project is active
3. Look for any billing or usage warnings
4. Ensure you haven't exceeded free tier limits

## 🧪 Testing Commands

You can test the connection locally by running:

```bash
# Test local connection
curl http://localhost:3000/api/admin/properties

# Test production connection  
curl https://right-stay-one.vercel.app/api/admin/properties
```

## 📊 Expected Results

- **Working**: Should return JSON array with your data
- **Not Working**: Returns `[]` (empty array) or error

## 🚨 Most Common Causes

1. **Missing Environment Variables** (90% of cases)
2. **Wrong Supabase URL/Keys** (5% of cases)  
3. **RLS Policies Blocking Access** (3% of cases)
4. **Supabase Project Issues** (2% of cases)

## 📞 Next Steps

1. **First**: Check environment variables in Vercel
2. **Second**: Test API endpoints directly
3. **Third**: Verify data exists in Supabase
4. **Fourth**: Check for RLS policies
5. **Fifth**: Redeploy if needed

---

**The most likely issue is incorrect environment variables in Vercel. Double-check those first!** 🔍
