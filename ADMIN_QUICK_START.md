# Quick Start: Admin Panel Access

## 🎯 Quick Setup (3 Minutes)

### Step 1: Create Admin User in Supabase
1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add user"** → **"Create new user"**
5. Enter:
   - **Email:** `admin@gmail.com`
   - **Password:** `2762003`
   - ✅ **Check:** "Auto Confirm User"
6. Click **"Create user"**

### Step 2: Grant Admin Role
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Paste and run:
```sql
UPDATE public.profiles
SET role = 'admin', full_name = 'System Administrator'
WHERE email = 'admin@gmail.com';
```
4. Click **"Run"**

### Step 3: Access Admin Panel
1. Start your dev server: `npm run dev`
2. Visit: http://localhost:5173/admin/login
3. Login with:
   - **Email:** admin@gmail.com
   - **Password:** 2762003

## ✨ Admin Panel Features

Once logged in, you can:
- 📊 View platform statistics (users, campaigns, revenue)
- 👥 Manage all users and change their roles
- 📋 View and assign campaigns to service team
- 🔧 Monitor service team performance
- 📥 Export campaign data to CSV
- ⚙️ Configure platform settings

## 🔒 Security Features

- Separate admin login page
- Role-based access control
- Automatic redirects for unauthorized access
- Session management
- Protected routes

## 🛠️ Admin Panel Routes

- `/admin/login` - Admin authentication
- `/admin` - Admin dashboard (protected)

## 📞 Support

If you encounter any issues:
1. Check that the user exists in Supabase Auth
2. Verify the profile has `role = 'admin'`
3. Clear browser cache and cookies
4. Check browser console for errors

## 🔄 Alternative: Use Setup Script

Run: `npm run setup:admin` for step-by-step instructions in terminal.
