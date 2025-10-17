# Admin Dashboard - Quick Setup Guide

## 🚀 Getting Started

### 1. Run the Database Migration

First, create the tour packages table by running the migration in Supabase:

**Option A: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/create_tour_packages.sql`
4. Click "Run"

**Option B: Supabase CLI**
```bash
supabase db push
```

### 2. Access the Admin Dashboard

Navigate to the admin dashboard in your browser:
```
http://localhost:3000/admin
```

### 3. Start Managing Your Site

You now have access to three main sections:

#### 📋 Site Settings
- Configure contact information
- Set default fees and commission rates
- Update global website settings

#### 🏢 Properties
- Add new rental properties
- Edit property details
- Manage owner information
- Set cleaning and welcome pack fees

#### 🗺️ Tour Packages
- Create tour offerings
- Set pricing and duration
- Manage availability
- Toggle active/inactive status

## 📊 What's Included

### Pre-populated Data

The migration includes 3 sample tour packages:
1. **Table Mountain Hike** - R850 (4 hours)
2. **Cape Peninsula Tour** - R1,200 (Full day)
3. **Wine Tasting Tour** - R950 (6 hours)

Feel free to edit or delete these and add your own tours!

### Database Tables

✅ **tour_packages** - New table for tour management
✅ **apartments** - Existing table (already in your database)
✅ **app_settings** - Existing table (already in your database)

## 🎨 Features

- ✨ Modern, responsive UI with dark theme
- 📱 Mobile-friendly with hamburger menu
- ✏️ Full CRUD operations (Create, Read, Update, Delete)
- 💾 Auto-save with success notifications
- 🔄 Real-time updates
- 🎯 Form validation
- 🎭 Modal dialogs for editing

## ⚠️ Security Notice

**Important:** This dashboard currently has NO authentication!

Before deploying to production, you MUST add:
- User authentication
- Role-based access control
- API route protection
- Rate limiting

See `ADMIN_DASHBOARD.md` for detailed security implementation examples.

## 🔧 Customization

### Adding More Settings

Edit the site settings form in:
```
components/admin/SiteSettings.tsx
```

### Modifying Property Fields

Edit the property form in:
```
components/admin/PropertySettings.tsx
```

### Customizing Tour Package Fields

Edit the tour package form in:
```
components/admin/TourPackageSettings.tsx
```

## 📝 API Endpoints

All admin functionality is powered by these API routes:

```
/api/admin/site-settings      (GET, POST)
/api/admin/properties          (GET, POST, PUT, DELETE)
/api/admin/tour-packages       (GET, POST, PUT, DELETE)
```

## 🐛 Common Issues

### "Failed to fetch" error
- Check your Supabase connection
- Verify environment variables are set
- Ensure migrations have run

### Modal won't close
- Try pressing ESC key
- Check browser console for JavaScript errors
- Clear browser cache

### Changes not saving
- Check Network tab for API errors
- Verify Supabase service role key is set
- Check database permissions

## 📚 Next Steps

1. ✅ Run the migration
2. ✅ Access the dashboard at `/admin`
3. ✅ Configure your site settings
4. ✅ Add your properties
5. ✅ Create your tour packages
6. 🔒 **Add authentication before production!**

## 💡 Tips

- Use descriptive apartment numbers (e.g., "SEA-VIEW-101")
- Set accurate cleaner payouts to automate expense tracking
- Mark tours as inactive instead of deleting them
- Test on mobile devices for responsive layout
- Regularly backup your database

## 📖 Full Documentation

For comprehensive documentation, see:
- `ADMIN_DASHBOARD.md` - Complete feature documentation
- `README.md` - Main project documentation

---

Need help? Check the troubleshooting section in `ADMIN_DASHBOARD.md`

