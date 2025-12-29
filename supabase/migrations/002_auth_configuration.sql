-- ============================================================================
-- SUPABASE AUTHENTICATION CONFIGURATION
-- Run this AFTER creating the main schema
-- ============================================================================

-- 1. Disable email confirmation (auto-confirm all signups)
-- Note: This needs to be done in Supabase Dashboard UI
-- Go to: Authentication > Providers > Email
-- Turn OFF: "Confirm email"

-- 2. Auto-confirm all existing unverified users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 3. Create function to handle Google OAuth profile linking
CREATE OR REPLACE FUNCTION public.link_google_account()
RETURNS TRIGGER AS $$
BEGIN
  -- If user with same email already exists, link Google account
  UPDATE public.profiles
  SET 
    google_id = NEW.raw_user_meta_data->>'sub',
    auth_provider = 'google',
    avatar_url = COALESCE(avatar_url, NEW.raw_user_meta_data->>'picture'),
    full_name = COALESCE(full_name, NEW.raw_user_meta_data->>'name')
  WHERE email = NEW.email
    AND google_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger for Google OAuth linking
DROP TRIGGER IF EXISTS on_google_signin ON auth.users;
CREATE TRIGGER on_google_signin
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_app_meta_data->>'provider' = 'google')
  EXECUTE FUNCTION public.link_google_account();

-- 5. Add unique constraint for case-insensitive username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx 
ON profiles (LOWER(username));

-- 6. Create function to search user by identifier (email/username/phone)
CREATE OR REPLACE FUNCTION public.find_user_by_identifier(identifier TEXT)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, email
  FROM public.profiles
  WHERE 
    email = identifier
    OR username = LOWER(identifier)
    OR phone = identifier
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update profiles table to add missing columns (if not already added)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='google_id') THEN
    ALTER TABLE profiles ADD COLUMN google_id TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='auth_provider') THEN
    ALTER TABLE profiles ADD COLUMN auth_provider TEXT DEFAULT 'email';
  END IF;
END $$;

-- 8. Create RLS policy for username lookup
CREATE POLICY "Users can search by username"
  ON profiles FOR SELECT
  USING (true); -- Allow anyone to search for usernames (needed for login)

-- ============================================================================
-- INSTRUCTIONS FOR SUPABASE DASHBOARD
-- ============================================================================

-- STEP 1: Disable Email Confirmation
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers
-- Click "Email" provider
-- Toggle OFF: "Confirm email"
-- Toggle OFF: "Double confirm email changes"
-- Click "Save"

-- STEP 2: Enable Phone Authentication (Optional)
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers
-- Click "Phone"
-- Choose a provider (Twilio, MessageBird, etc.)
-- Configure credentials
-- Toggle ON: "Phone login enabled"
-- Click "Save"

-- STEP 3: Verify Google OAuth
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers
-- Click "Google"
-- Verify Client ID and Secret are set
-- Redirect URL should be: https://YOUR_PROJECT.supabase.co/auth/v1/callback

-- ============================================================================
-- TESTING
-- ============================================================================

-- Test 1: Create user with email
-- User signs up with: email + password
-- Should auto-create profile with role='user'

-- Test 2: Create user with username
-- User signs up with: email + username + password
-- Username should be unique and lowercase

-- Test 3: Login with username
-- User logins with: username + password
-- Should find email from username and login

-- Test 4: Login with Google OAuth
-- User clicks "Continue with Google"
-- Should create profile or link to existing email

-- Test 5: Login with phone
-- User signs up with: phone + password
-- Should create profile with phone number
