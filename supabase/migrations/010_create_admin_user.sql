-- Create admin user migration
-- This creates an admin user with specific credentials
-- Email: admin@gmail.com
-- Password: 2762003

-- First, we need to create a function to safely create the admin user
-- This handles the case where the user might already exist

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@gmail.com';

  -- If admin doesn't exist, create it
  IF admin_user_id IS NULL THEN
    -- Insert into auth.users (this requires direct database access)
    -- Note: In production, you should create this user through Supabase dashboard
    -- or use Supabase auth API. This is for development purposes.
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@gmail.com',
      crypt('2762003', gen_salt('bf')), -- Hashed password
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    -- Create profile for admin user
    INSERT INTO public.profiles (
      id,
      email,
      role,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@gmail.com',
      'admin',
      'System Administrator',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Admin user created successfully with ID: %', admin_user_id;
  ELSE
    -- Update existing user to ensure admin role
    UPDATE public.profiles
    SET role = 'admin', full_name = 'System Administrator'
    WHERE id = admin_user_id;

    RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
  END IF;
END $$;

-- Grant admin role full access to all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
