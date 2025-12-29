# Admin Panel Setup Guide

## Admin Credentials
- **Email**: admin@gmail.com
- **Password**: 2762003

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Project Dashboard**
   - Navigate to: https://app.supabase.com

2. **Create Admin User**
   - Go to `Authentication` → `Users`
   - Click `Add user` → `Create new user`
   - Fill in the details:
     - Email: `admin@gmail.com`
     - Password: `2762003`
     - ✅ Check "Auto Confirm User"
   - Click `Create user`

3. **Update User Role to Admin**
   - Go to `SQL Editor`
   - Run this query:
   ```sql
   UPDATE public.profiles
   SET 
     role = 'admin',
     full_name = 'System Administrator'
   WHERE email = 'admin@gmail.com';
   ```

4. **Verify Setup**
   - Go to `Table Editor` → `profiles`
   - Find the user with email `admin@gmail.com`
   - Verify `role` is set to `admin`

### Option 2: Using Setup Script

Run the following command from your project directory:

```bash
npm run setup:admin
```

This will guide you through the admin user creation process.

### Option 3: Manual SQL (Advanced)

If you have direct database access:

```sql
-- Step 1: Create user in auth.users (via Supabase Auth API)
-- Use the Supabase Dashboard or API for this step

-- Step 2: Update profile
UPDATE public.profiles
SET 
  role = 'admin',
  full_name = 'System Administrator'
WHERE email = 'admin@gmail.com';

-- Step 3: Verify
SELECT id, email, role, full_name 
FROM public.profiles 
WHERE email = 'admin@gmail.com';
```

## Accessing the Admin Panel

1. **Navigate to Admin Login**
   - URL: `http://localhost:5173/admin/login`

2. **Login with Admin Credentials**
   - Email: admin@gmail.com
   - Password: 2762003

3. **Admin Dashboard**
   - After successful login, you'll be redirected to `/admin`
   - Here you can:
     - View all users
     - Manage user roles
     - View and assign campaigns
     - Monitor platform statistics
     - Export data

## Admin Panel Features

### Dashboard Overview
- Total users count
- Total campaigns
- Total revenue
- Active service team members

### User Management
- View all registered users
- Change user roles (user/service/admin)
- Monitor user activity

### Campaign Management
- View all campaigns across platform
- Assign campaigns to service team members
- Monitor campaign status and payment
- Export campaign data to CSV

### Service Team Management
- View service team members
- Monitor assigned campaigns
- Track completion rates

## Security Notes

- Admin panel is protected by role-based access control
- Only users with `admin` role can access
- Non-admin users will be redirected
- Separate login page for admin authentication

## Troubleshooting

### Cannot Login
- Verify the user exists in Supabase Dashboard
- Check email confirmation status
- Verify profile has `admin` role

### Access Denied
- Ensure profile role is set to `admin` in database
- Clear browser cache and try again
- Check browser console for errors

### Profile Not Found
- User might not have a profile entry
- Run the profile creation SQL query
- Verify RLS policies are correct

## Development vs Production

**Development:**
- Use the provided credentials for testing
- Auto-confirm email is acceptable

**Production:**
- Change the admin password immediately
- Use strong, unique passwords
- Enable two-factor authentication if available
- Limit admin access to trusted personnel
- Regularly audit admin actions

## Next Steps

After setting up the admin panel:

1. Login to admin panel
2. Create additional admin users if needed
3. Promote service team members
4. Review and configure platform settings
5. Monitor user activity and campaigns
