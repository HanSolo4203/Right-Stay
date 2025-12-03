# Admin Dashboard Documentation

## Overview

The admin dashboard provides a centralized interface for managing your Right Stay Africa website settings, properties, and tour packages. It features a modern, responsive design with dark mode aesthetics.

## Accessing the Dashboard

Navigate to `/admin` to access the admin dashboard.

```
http://localhost:3000/admin
```

## Features

### 1. Site Settings

Manage global website configuration including:

- **Contact Information**
  - Site Name
  - Contact Email
  - Contact Phone
  - Physical Address

- **Financial Settings**
  - Default Commission Rate (%)
  - Payment Processing Fee (%)
  - Default Cleaning Fee (ZAR)
  - Default Welcome Pack Fee (ZAR)

**Note:** All settings are stored in the `app_settings` table and can be referenced throughout your application.

### 2. Property Management

Full CRUD operations for managing rental properties:

- **Create** new properties with:
  - Apartment Number (unique identifier)
  - Owner Name & Email
  - Physical Address
  - Cleaner Payout Amount
  - Welcome Pack Fee

- **Edit** existing property details
- **Delete** properties (with confirmation)
- **View** all properties in a card-based layout

**Database Table:** `apartments`

### 3. Tour Package Management

Manage tour offerings with comprehensive details:

- **Create** tour packages with:
  - Tour Name
  - Description
  - Price (ZAR)
  - Duration (e.g., "4 hours", "Full day")
  - Maximum Participants
  - Location
  - Active/Inactive Status

- **Edit** existing tour packages
- **Delete** tours (with confirmation)
- **View** all tours with status indicators
- **Toggle** visibility to customers

**Database Table:** `tour_packages`

## Database Setup

### Tour Packages Migration

Run the following migration to create the tour packages table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard
```

The migration file is located at:
```
supabase/migrations/create_tour_packages.sql
```

This creates:
- `tour_packages` table with all necessary fields
- Indexes for performance optimization
- Triggers for automatic timestamp updates
- Sample tour packages (Table Mountain Hike, Cape Peninsula Tour, Wine Tasting Tour)

## API Routes

### Site Settings
- `GET /api/admin/site-settings` - Fetch all settings
- `POST /api/admin/site-settings` - Update settings

### Properties
- `GET /api/admin/properties` - List all properties
- `POST /api/admin/properties` - Create new property
- `PUT /api/admin/properties?id={id}` - Update property
- `DELETE /api/admin/properties?id={id}` - Delete property

### Tour Packages
- `GET /api/admin/tour-packages` - List all tour packages
- `POST /api/admin/tour-packages` - Create new tour package
- `PUT /api/admin/tour-packages?id={id}` - Update tour package
- `DELETE /api/admin/tour-packages?id={id}` - Delete tour package

## Component Structure

```
/app/admin/
  └── page.tsx                    # Main dashboard with tab navigation

/components/admin/
  ├── SiteSettings.tsx           # Site configuration form
  ├── PropertySettings.tsx       # Property CRUD interface
  └── TourPackageSettings.tsx    # Tour package CRUD interface

/app/api/admin/
  ├── site-settings/
  │   └── route.ts              # Site settings API handlers
  ├── properties/
  │   └── route.ts              # Property CRUD API handlers
  └── tour-packages/
      └── route.ts              # Tour package CRUD API handlers
```

## Features & UI Elements

### Navigation
- **Desktop:** Horizontal tab navigation in header
- **Mobile:** Collapsible hamburger menu
- **Active State:** Visual indicator for current tab

### Forms
- Real-time validation
- Success/Error notifications with auto-dismiss
- Loading states on submit buttons
- Responsive grid layouts

### Modals
- Smooth animations
- Backdrop blur effect
- Keyboard-accessible (ESC to close)
- Form validation before submission

### Data Display
- Card-based layouts for easy scanning
- Color-coded status badges
- Icon indicators for quick identification
- Hover effects for interactive elements

## Styling

Built with:
- **Tailwind CSS** - Utility-first styling
- **Gradient Backgrounds** - Modern blue/purple gradients
- **Dark Mode** - Eye-friendly dark theme
- **Lucide Icons** - Consistent iconography
- **Backdrop Blur** - Glass-morphism effects

## Security Considerations

⚠️ **Important:** This dashboard has no authentication by default. Before deploying to production:

1. Implement authentication (NextAuth.js, Clerk, or Supabase Auth)
2. Add role-based access control (RBAC)
3. Protect API routes with middleware
4. Use service role keys only on the server side
5. Implement rate limiting
6. Add audit logging

### Example Auth Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const session = request.cookies.get('session');
  
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

## Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Future Enhancements

Potential improvements:
- [ ] Authentication & Authorization
- [ ] Bulk operations (import/export CSV)
- [ ] Image uploads for properties and tours
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Booking management interface
- [ ] Email notifications
- [ ] Activity logs
- [ ] Multi-language support
- [ ] File attachments

## Troubleshooting

### Settings not saving
- Check browser console for errors
- Verify Supabase connection
- Ensure `app_settings` table exists

### Properties/Tours not loading
- Run the tour packages migration
- Check API route responses in Network tab
- Verify database permissions

### Modal not closing
- Check for JavaScript errors
- Clear browser cache
- Try keyboard ESC key

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Supabase logs
3. Verify all migrations have run
4. Check API route responses

## License

Part of Right Stay Africa property management system.

