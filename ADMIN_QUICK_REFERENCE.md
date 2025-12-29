# 🎯 Admin Panel - Quick Reference Card

## Login Credentials
```
Email:    admin@gmail.com
Password: 2762003
URL:      http://localhost:5173/admin/login
```

## One-Time Setup (Supabase Dashboard)

### Create User
```
Navigation: Authentication > Users > Add user
Email:      admin@gmail.com
Password:   2762003
☑️ Auto Confirm User
```

### Grant Admin Role
```sql
UPDATE public.profiles
SET role = 'admin', full_name = 'System Administrator'
WHERE email = 'admin@gmail.com';
```

## Access Points

| What | URL |
|------|-----|
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin` |
| User Login | `/auth` |
| User Dashboard | `/user` |

## Admin Features

- ✅ View all users (total count, details)
- ✅ Change user roles (user/service/admin)
- ✅ View all campaigns platform-wide
- ✅ Assign campaigns to service team
- ✅ Track revenue and statistics
- ✅ Export campaign data to CSV
- ✅ Monitor service team performance

## Setup Script
```bash
npm run setup:admin
```

## Common Tasks

### Promote User to Service Team
1. Login to admin panel
2. Go to "User Management" tab
3. Find the user
4. Change role dropdown to "Service"

### Assign Campaign
1. Go to "All Campaigns" tab
2. Find campaign
3. Select service member from dropdown
4. Auto-saves assignment

### Export Data
1. Go to "All Campaigns" tab
2. Click "Export CSV" button
3. File downloads automatically

## Security Notes

⚠️ **Production:**
- Change admin password immediately
- Use environment variables for credentials
- Enable 2FA if available
- Regularly audit admin actions
- Limit admin access

✅ **Development:**
- Current setup is for testing
- Auto-confirm is enabled
- Credentials are in code (remove for prod)

## Troubleshooting

**Cannot Login?**
- Verify user exists in Supabase Auth
- Check profile role is 'admin'
- Clear browser cache

**Access Denied?**
- Run the SQL query again
- Check console for errors
- Verify session is valid

**Profile Not Found?**
- User may need profile entry
- Check RLS policies
- Verify database connection

## Files Modified/Created

```
src/pages/admin/AdminAuth.tsx          [NEW]
src/pages/admin/AdminDashboard.tsx     [UPDATED]
src/App.tsx                            [UPDATED]
src/pages/Auth.tsx                     [UPDATED]
scripts/setup-admin.js                 [NEW]
ADMIN_SETUP.md                         [NEW]
ADMIN_QUICK_START.md                   [NEW]
ADMIN_IMPLEMENTATION_SUMMARY.md        [NEW]
package.json                           [UPDATED]
```

---
**Ready to use!** Just complete the Supabase setup and login! 🚀
