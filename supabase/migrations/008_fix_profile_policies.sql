-- Fix profile policies to allow authenticated users to insert their own profile
-- This is needed for the fallback profile creation in the auth hook

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;

-- Add INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure the trigger function has SECURITY DEFINER to bypass RLS
-- This allows the trigger to insert profiles even with RLS enabled
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  provider_type TEXT;
  google_sub TEXT;
BEGIN
  -- Detect provider type
  provider_type := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  
  -- Extract Google ID if Google OAuth
  IF provider_type = 'google' THEN
    google_sub := NEW.raw_user_meta_data->>'sub';
  END IF;
  
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    phone,
    role,
    google_id,
    auth_provider
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NEW.phone,
    'user', -- Default role
    google_sub,
    provider_type
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
