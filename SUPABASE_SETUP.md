# Supabase MCP Setup Guide

This project is configured to use Supabase with Model Context Protocol (MCP) for enhanced AI-powered database interactions.

## Configuration Files

### 1. `mcp.json`
The MCP configuration file that connects to your Supabase database through the MCP server.

### 2. Environment Variables
Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Getting Your Supabase Credentials

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (or create a new one)
3. **Navigate to Project Settings > API**
4. **Copy the following:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Important Security Notes

- ⚠️ **NEVER commit `.env.local` to version control**
- ⚠️ The `service_role` key bypasses Row Level Security - only use it server-side
- ✅ The `anon` key is safe to use client-side (it respects RLS policies)

## MCP Configuration

The `mcp.json` file is configured to use the official Supabase MCP server:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "your-project-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

## Using MCP with Cursor/Claude

1. **Update `mcp.json`** with your actual Supabase credentials
2. **Restart Cursor** to load the MCP configuration
3. **Use natural language** to interact with your database through the AI assistant

### Example MCP Commands:
- "Show me all tables in my Supabase database"
- "Create a new table called bookings with fields..."
- "Query all accommodations from the database"
- "Insert a new property into the apartments table"

## Database Schema (Right Stay Africa)

Based on your existing Supabase database, you have:

### Core Tables:
- `apartments` (14 properties)
- `bookings` (132 bookings)
- `guests` (117 guests)
- `booking_channels` (8 channels)
- `cleaners` (2 cleaners)
- `cleaning_sessions` (30 sessions)
- `internal_assets`
- `upsells`
- `custom_expenses`

### Views:
- `owner_statements_view`
- `cleaning_sessions_detailed`
- `all_schedulable_properties`
- `rsa_laundry_expenses_detailed`

## Usage in Code

### Client-Side (Components):
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('apartments')
  .select('*');
```

### Server-Side (API Routes, Server Components):
```typescript
import { supabaseServer } from '@/lib/supabase-server';

const { data, error } = await supabaseServer
  .from('bookings')
  .select('*');
```

## Troubleshooting

### MCP Connection Issues:
1. Verify your credentials are correct in `mcp.json`
2. Restart Cursor to reload MCP configuration
3. Check that `@modelcontextprotocol/server-supabase` is accessible

### Database Connection Issues:
1. Verify `.env.local` exists and has correct values
2. Restart your Next.js dev server
3. Check Supabase project is active and not paused

## Next Steps

1. ✅ Supabase client installed
2. ✅ Configuration files created
3. ⏳ Add your credentials to `.env.local`
4. ⏳ Update `mcp.json` with your credentials
5. ⏳ Restart Cursor to enable MCP
6. ✅ Start querying your database through AI!

---

## Migrating the live property data

When you start a brand-new Supabase project, you only need the tables/rows that back the public site (`cached_properties` + `property_photos`). Follow these steps so the UI continues displaying the same curated listings without cloning every legacy table.

1. Apply the SQL files in `supabase/migrations/` to the new project (`supabase db push` or run each `.sql` in the SQL editor). That will recreate the schema (UUID extension, tables, indexes, triggers).
2. Set the following environment variables (you can load them with `export` or `dotenv`):

   ```env
   SUPABASE_SOURCE_URL=<old-project-url>
   SUPABASE_SOURCE_SERVICE_ROLE_KEY=<old-project-service-role>
   SUPABASE_TARGET_URL=<new-project-url>
   SUPABASE_TARGET_SERVICE_ROLE_KEY=<new-project-service-role>
   SUPABASE_PROPERTY_IDS=135133,135134     # optional, comma-separated. Omit to copy everything.
   ```

3. Run the migration helper:
   ```bash
   npm run migrate:supabase-data
   ```
   The script in `scripts/migrate-supabase-data.mjs` copies the filtered `cached_properties` rows and their matching `property_photos` into your fresh database.

4. Inspect the new Supabase dashboard for `cached_properties` + `property_photos` to confirm the listings/photos are present. Adjust `SUPABASE_PROPERTY_IDS` if you only need specific properties for the marketing site.

---

## Resetting and reseeding a fresh database

If you want to wipe the old schema/data and start from the minimal dataset that the marketing site actually uses, run the SQL file `supabase/migrations/000_reset_seed_data.sql`. It:

1. Drops the legacy tables (bookings, guests, availability views, etc.).
2. Recreates `cached_properties`, `property_photos`, and `tour_packages` with the indexes/triggers that the app expects.
3. Seeds three live listings and their photos plus the six tour packages shown on `/tours`.

You can execute the file directly from Supabase Studio → SQL Editor (`Run`), or use the Supabase CLI with `supabase db query < supabase/migrations/000_reset_seed_data.sql`. This is a one-time script before you point the app at a new project.

---

**Need Help?**
- [Supabase Documentation](https://supabase.com/docs)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Right Stay Africa Database Schema](./memories) - See your database structure


