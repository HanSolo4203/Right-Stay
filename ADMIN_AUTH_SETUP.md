# Admin Authentication Setup

## Overview

I've created a complete authentication system for your admin dashboard using Supabase Auth. The system includes:

- ✅ Login page at `/admin/login`
- ✅ Protected admin dashboard at `/admin`
- ✅ Sign-out functionality
- ✅ Session management
- ✅ Automatic redirects

## Features

### Login Page (`/admin/login`)
- Beautiful, modern UI matching your site design
- Email/password authentication
- Show/hide password toggle
- Loading states and error handling
- Automatic redirect if already logged in
- Link to return to main website

### Protected Dashboard (`/admin`)
- Authentication check on page load
- User email display
- Sign-out button (desktop and mobile)
- Automatic redirect to login if not authenticated
- Real-time auth state monitoring

## Setup Instructions

### 1. Enable Supabase Auth

Go to your Supabase dashboard:

1. Navigate to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### 2. Create Your First Admin User

You can create an admin user in two ways:

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter email and password
4. Click **Create user**

#### Option B: Via API (with email confirmation)
Use the Supabase client to sign up:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'your-secure-password'
});
```

### 3. Test the Login

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/admin/login`

3. Enter your admin credentials

4. You should be redirected to `/admin` dashboard

## Usage

### Accessing the Admin Dashboard

- **URL**: `http://localhost:3000/admin`
- If not logged in, you'll be automatically redirected to `/admin/login`

### Signing Out

Click the **Sign Out** button in the header:
- Desktop: Top-right corner
- Mobile: Bottom of the mobile menu

### Security Features

✅ **Session Persistence**: Users stay logged in across page refreshes
✅ **Auto-redirect**: Unauthenticated users can't access `/admin`
✅ **Real-time Auth**: Listens for auth state changes
✅ **Secure Storage**: Sessions stored securely by Supabase

## Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Structure

```
app/
  admin/
    page.tsx           # Protected dashboard (updated)
    login/
      page.tsx         # New login page
lib/
  supabase.ts          # Supabase client (existing)
```

## Customization

### Password Requirements

To set custom password requirements, go to Supabase Dashboard:
- **Authentication** → **Policies**
- Configure minimum password length, complexity, etc.

### Email Templates

Customize authentication emails:
- **Authentication** → **Email Templates**
- Edit: Confirmation, Password Recovery, Magic Link, etc.

### Adding More Admin Users

Simply create new users in the Supabase dashboard:
- **Authentication** → **Users** → **Add user**

## Troubleshooting

### Can't sign in?
- ✅ Check that Email provider is enabled in Supabase
- ✅ Verify your environment variables are correct
- ✅ Ensure the user exists in Authentication → Users
- ✅ Check browser console for error messages

### Redirect loop?
- ✅ Clear browser cache and cookies
- ✅ Check that Supabase client is properly initialized

### Session not persisting?
- ✅ Check browser storage settings (cookies enabled)
- ✅ Verify NEXT_PUBLIC_SUPABASE_URL is correct

## Next Steps

### Optional Enhancements

1. **Password Reset**
   - Add "Forgot Password?" link to login page
   - Implement password recovery flow

2. **Two-Factor Authentication**
   - Enable in Supabase dashboard
   - Add 2FA UI to login page

3. **Role-Based Access**
   - Add user metadata for roles
   - Implement permission checks per dashboard section

4. **Email Verification**
   - Require email confirmation before login
   - Add email verification flow

5. **Activity Logging**
   - Track login/logout events
   - Monitor admin actions

## Support

If you need help:
- 📚 [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- 🔐 [Next.js Authentication Guide](https://nextjs.org/docs/authentication)

---

**Status**: ✅ Ready to use
**Last Updated**: October 17, 2025

