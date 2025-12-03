# Fixing "Invalid API key" Error

## Problem
You're getting `Invalid API key` errors because your `.env.local` file has API keys from the **old database** (`kmkfrzahmvqvidyhjgmo`), but you're trying to connect to a **new database**.

## Solution

### Step 1: Get Your New Supabase Project Credentials

1. Go to your **new** Supabase project dashboard:
   - If you haven't created a new project yet: https://supabase.com/dashboard/projects/new
   - If you already created it: https://supabase.com/dashboard

2. Navigate to **Settings** → **API**

3. Copy these three values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...` - ⚠️ Keep this secret!)

### Step 2: Update Your `.env.local` File

Open `/Users/richardellis/Documents/Right-Stay/.env.local` and update it with your new credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key-here
```

### Step 3: Update MCP Configuration (Optional)

If you want to use MCP tools with the new database, update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--project-ref=your-new-project-ref"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-supabase-access-token"
      }
    }
  }
}
```

### Step 4: Restart Your Dev Server

1. Stop the current dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 5: Verify It Works

After restarting, check:
- Homepage loads properties: http://localhost:3000
- Admin dashboard works: http://localhost:3000/admin/login

## Quick Check Script

You can also run this to verify your environment variables:

```bash
node scripts/check-env.mjs
```

## Common Issues

### "Still getting Invalid API key"
- Make sure you copied the **entire** key (they're long!)
- Check for extra spaces or quotes in `.env.local`
- Restart your dev server after updating `.env.local`

### "Can't find .env.local"
- Create it in the project root: `/Users/richardellis/Documents/Right-Stay/.env.local`
- Make sure it's not in `.gitignore` (it should be ignored for security)

### "Which project should I use?"
- Use your **new** Supabase project (not `kmkfrzahmvqvidyhjgmo`)
- If you haven't created one yet, create a new project first
- Then run the migration script: `supabase/migrations/000_reset_seed_data.sql`

