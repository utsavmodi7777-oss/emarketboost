-- Fix infinite recursion in profiles policies
-- The issue is that policies were checking the profiles table within themselves

-- First, drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service can view user profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can do everything on profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service and admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can do everything" ON profiles;
DROP POLICY IF EXISTS "Service can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can modify all profiles" ON profiles;

DROP POLICY IF EXISTS "Service can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can modify all profiles" ON profiles;

-- Create a security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Recreate policies without recursion
-- Users can always view and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for profile creation)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Now create policies using the function (function has SECURITY DEFINER so it bypasses RLS)
CREATE POLICY "Service can view all profiles"
  ON profiles FOR SELECT
  USING (public.get_my_role() IN ('service', 'admin'));

CREATE POLICY "Admin can modify all profiles"
  ON profiles FOR ALL
  USING (public.get_my_role() = 'admin');
