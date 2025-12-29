# Fix "Email not confirmed" Error

## Quick Fix (2 minutes):

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/itmgxziovfyuyswmfxpd/sql/new
2. You should see the SQL Editor

### Step 2: Run This SQL Command
Copy and paste this into the SQL Editor:

```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
```

### Step 3: Click "RUN" button

### Step 4: Try logging in again
- Email: hanuman7@gmail.com
- Password: (your password)

---

## Then Disable Email Confirmation for Future Users:

### Step 1: Go to Auth Providers
https://supabase.com/dashboard/project/itmgxziovfyuyswmfxpd/auth/providers

### Step 2: Click "Email" provider

### Step 3: Turn OFF these settings:
- ❌ Confirm email
- ❌ Double confirm email changes

### Step 4: Click "Save"

---

After this, you'll be able to login and all future signups will work instantly!
