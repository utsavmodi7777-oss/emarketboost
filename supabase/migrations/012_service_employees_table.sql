-- Create service_employees table for employee management
CREATE TABLE IF NOT EXISTS public.service_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  aadhar_number TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on employee_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_employees_employee_id ON public.service_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_service_employees_user_id ON public.service_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_service_employees_status ON public.service_employees(status);

-- Enable RLS
ALTER TABLE public.service_employees ENABLE ROW LEVEL SECURITY;

-- Policies for service_employees
CREATE POLICY "Service employees can view all employees"
  ON public.service_employees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('service', 'admin')
    )
  );

CREATE POLICY "Service employees can update own record"
  ON public.service_employees
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow employee registration"
  ON public.service_employees
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all employees"
  ON public.service_employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER service_employees_updated_at
  BEFORE UPDATE ON public.service_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_service_employees_updated_at();

-- Create main service account profile if not exists
DO $$
DECLARE
  service_user_id UUID;
BEGIN
  -- Check if service user exists
  SELECT id INTO service_user_id
  FROM auth.users
  WHERE email = 'service@gmail.com';

  -- If exists, ensure profile has service role
  IF service_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (service_user_id, 'service@gmail.com', 'service', 'Service Team Manager')
    ON CONFLICT (id) DO UPDATE
    SET role = 'service', full_name = 'Service Team Manager';
  END IF;
END $$;
