# Fix Service Role Key

## Issue Found
Your **anon key works** ✅, but your **service role key is invalid** ❌.

## Solution

### Step 1: Get the Correct Service Role Key

1. Go to your Supabase dashboard:
   **https://supabase.com/dashboard/project/dqnrofcmtxwppiywscuw**

2. Navigate to **Settings** → **API**

3. Find the **service_role** key (it's under "Project API keys")
   - ⚠️ This is a secret key - keep it safe!
   - It starts with `eyJ...` (JWT format)

### Step 2: Update .env.local

Open `/Users/richardellis/Documents/Right-Stay/.env.local` and update line 6 (or wherever `SUPABASE_SERVICE_ROLE_KEY` is):

```env
SUPABASE_SERVICE_ROLE_KEY=your-correct-service-role-key-here
```

Make sure:
- No extra spaces
- No quotes around the key
- Copy the entire key (they're very long)

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Verify

Run the test script again:
```bash
node scripts/test-connection.mjs
```

You should see:
- ✅ Anon key works!
- ✅ Service role key works!

## Why This Matters

The service role key is needed for:
- Admin dashboard operations
- Server-side API routes
- Database operations that bypass RLS

Without it, you'll get "Invalid API key" errors on admin pages and API routes.

