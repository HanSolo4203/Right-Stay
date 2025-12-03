# Vercel Deployment Fix Guide

## 🚨 Current Issues on Vercel

Based on the console errors, you're experiencing:

1. **404 Error**: Missing `/privacy` page
2. **500 Error**: `/api/bookings/create` server error

## ✅ Fixes Applied

### 1. Created Missing Pages
- ✅ Added `/app/privacy/page.tsx` - Privacy Policy page
- ✅ Added `/app/terms/page.tsx` - Terms of Service page

### 2. Environment Variables Setup

**CRITICAL**: The 500 error is likely due to missing environment variables on Vercel.

## 🔧 Vercel Environment Variables Setup

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your `right-stay-one` project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the sidebar

### Step 2: Add Required Environment Variables

Add these environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Uplisting API (if using)
UPLISTING_API_KEY=your_uplisting_api_key

# Cron Security (for scheduled tasks)
CRON_SECRET=your_random_secret_key
```

### Step 3: Environment Variable Values

**NEXT_PUBLIC_SUPABASE_URL**: 
- Format: `https://your-project-id.supabase.co`
- Get from: Supabase Dashboard → Settings → API

**NEXT_PUBLIC_SUPABASE_ANON_KEY**:
- Get from: Supabase Dashboard → Settings → API → Project API keys → anon public

**SUPABASE_SERVICE_ROLE_KEY**:
- Get from: Supabase Dashboard → Settings → API → Project API keys → service_role secret

**CRON_SECRET**:
- Generate a random string (e.g., `openssl rand -base64 32`)

### Step 4: Redeploy
1. After adding environment variables, click **Redeploy** in Vercel
2. Or push a new commit to trigger automatic deployment

## 🗄️ Database Setup Required

### Step 1: Run Migrations in Supabase
Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Payment tracking migration
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
```

```sql
-- Property mapping migration
CREATE TABLE IF NOT EXISTS property_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uplisting_property_id TEXT NOT NULL UNIQUE,
    apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_mapping_uplisting_id ON property_mapping(uplisting_property_id);
CREATE INDEX IF NOT EXISTS idx_property_mapping_apartment_id ON property_mapping(apartment_id);

CREATE TRIGGER update_property_mapping_updated_at
    BEFORE UPDATE ON property_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Map property 135133 to apartment 202
INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT '135133', id 
FROM apartments 
WHERE apartment_number = '202'
ON CONFLICT (uplisting_property_id) DO UPDATE SET
    apartment_id = EXCLUDED.apartment_id,
    updated_at = NOW();
```

```sql
-- Tour packages migration
CREATE TABLE IF NOT EXISTS tour_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration TEXT NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 1,
    location TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_packages_name ON tour_packages(name);
CREATE INDEX IF NOT EXISTS idx_tour_packages_is_active ON tour_packages(is_active);

CREATE TRIGGER update_tour_packages_updated_at
    BEFORE UPDATE ON tour_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample tour packages
INSERT INTO tour_packages (name, description, price, duration, max_participants, location, is_active) VALUES
('Table Mountain Hike', 'Experience breathtaking views of Cape Town from the iconic Table Mountain. Perfect for adventure seekers and nature lovers.', 850.00, '4 hours', 12, 'Cape Town, South Africa', true),
('Cape Peninsula Tour', 'Discover the stunning Cape Peninsula including Chapman''s Peak, Boulders Beach penguins, and Cape Point. A full day of unforgettable sights.', 1200.00, 'Full day (8 hours)', 15, 'Cape Peninsula, South Africa', true),
('Wine Tasting Tour', 'Explore the world-renowned Stellenbosch and Franschhoek wine routes. Sample premium wines and enjoy gourmet cuisine.', 950.00, '6 hours', 10, 'Stellenbosch, South Africa', true);
```

## 🔍 Testing After Fix

### 1. Test Privacy Page
Visit: `https://right-stay-one.vercel.app/privacy`
- Should load without 404 error

### 2. Test Booking Creation
1. Go to a property booking page
2. Fill out the booking form
3. Click "Confirm Booking"
4. Check browser console - should not show 500 error

### 3. Test Admin Dashboard
Visit: `https://right-stay-one.vercel.app/admin`
- Should load the admin dashboard
- All tabs should work (Site Settings, Properties, Tours, Bookings, Property Mapping)

## 🚨 Common Issues & Solutions

### Issue: "Failed to create guest record"
**Cause**: Missing environment variables or database connection issues
**Solution**: Verify all Supabase environment variables are set correctly

### Issue: "No apartment mapping found"
**Cause**: Property mapping not set up in database
**Solution**: Run the property mapping migration

### Issue: "Payment status column not found"
**Cause**: Payment tracking migration not run
**Solution**: Run the payment tracking migration

### Issue: API routes returning 500 errors
**Cause**: Environment variables not set or database not accessible
**Solution**: Check Vercel environment variables and Supabase connection

## 📞 Quick Checklist

- [ ] Environment variables added to Vercel
- [ ] Database migrations run in Supabase
- [ ] Vercel project redeployed
- [ ] Privacy page accessible (no 404)
- [ ] Booking creation works (no 500)
- [ ] Admin dashboard loads correctly

## 🔄 Redeployment Commands

If you need to push the new pages to GitHub:

```bash
git add .
git commit -m "Fix Vercel deployment: Add missing privacy/terms pages"
git push origin main
```

This will automatically trigger a new Vercel deployment.

---

**After following these steps, your Vercel deployment should work correctly!** 🎉
