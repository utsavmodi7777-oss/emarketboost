-- Setup admin user for EMarketBoost
-- Email: admin@gmail.com
-- Password: 2762003

-- Note: This script is for development/demo purposes
-- In production, admin users should be created through secure processes

-- Step 1: Create the admin user through Supabase Auth
-- This needs to be done via Supabase Dashboard or Auth API, as direct auth.users manipulation
-- is restricted. Here's what to do:

-- MANUAL STEPS (via Supabase Dashboard):
-- 1. Go to Authentication > Users in your Supabase Dashboard
-- 2. Click "Add user" -> "Create new user"
-- 3. Email: admin@gmail.com
-- 4. Password: 2762003
-- 5. Check "Auto Confirm User" (to skip email confirmation)
-- 6. Click "Create user"

-- Step 2: Update the profile to admin role
-- After creating the user via dashboard, run this query:

-- UPDATE public.profiles
-- SET 
--   role = 'admin',
--   full_name = 'System Administrator'
-- WHERE email = 'admin@gmail.com';

-- Alternative: If you have access to Supabase service role key, you can use the API:
-- POST https://[YOUR_PROJECT_REF].supabase.co/auth/v1/admin/users
-- Headers:
--   apikey: [YOUR_SERVICE_ROLE_KEY]
--   Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
--   Content-Type: application/json
-- Body:
-- {
--   "email": "admin@gmail.com",
--   "password": "2762003",
--   "email_confirm": true,
--   "user_metadata": {
--     "role": "admin",
--     "full_name": "System Administrator"
--   }
-- }

-- After user is created via API or Dashboard, ensure profile exists:
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin',
  'System Administrator'
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'System Administrator';

-- Grant necessary permissions (should already exist from previous migrations)
-- Verify admin can access all tables
DO $$
BEGIN
  -- Ensure RLS policies allow admin access
  -- This is just a verification step
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gmail.com') THEN
    RAISE NOTICE 'Admin user email found in auth.users';
  ELSE
    RAISE WARNING 'Admin user NOT found - please create via Supabase Dashboard';
  END IF;
END $$;
