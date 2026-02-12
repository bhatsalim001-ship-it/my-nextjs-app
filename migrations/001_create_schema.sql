-- ==========================================
-- SECUREFORCE DATABASE SCHEMA
-- Security Manpower Management System
-- ==========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. USER PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 2. DEPARTMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 3. DESIGNATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 4. LOCATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 5. COMPANY SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  office_address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 6. EMPLOYEES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL UNIQUE, -- SF-0001, SF-0002, etc.
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  designation_id UUID NOT NULL REFERENCES public.designations(id) ON DELETE RESTRICT,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  photo_url TEXT,
  date_of_joining DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  id_card_valid_from DATE,
  id_card_valid_until DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 7. ID CARD TEMPLATES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.id_card_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- modern, corporate, minimal, security, etc.
  layout_config JSONB NOT NULL, -- Stores template JSON structure
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- 8. EMPLOYEE CARD ASSIGNMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.employee_card_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.id_card_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id)
);

-- ==========================================
-- 9. ACTIVITY LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT')),
  entity_type TEXT NOT NULL, -- 'employee', 'department', 'designation', 'location', etc.
  entity_id TEXT,
  entity_name TEXT,
  changes JSONB, -- Store what changed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_employees_department ON public.employees(department_id);
CREATE INDEX idx_employees_designation ON public.employees(designation_id);
CREATE INDEX idx_employees_location ON public.employees(location_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_created_at ON public.employees(created_at DESC);
CREATE INDEX idx_designations_department ON public.designations(department_id);
CREATE INDEX idx_employee_card_assignments_employee ON public.employee_card_assignments(employee_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_card_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to read all departments
CREATE POLICY "Allow authenticated users to read departments" ON public.departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage departments" ON public.departments
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow authenticated users to read all designations
CREATE POLICY "Allow authenticated users to read designations" ON public.designations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage designations" ON public.designations
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow authenticated users to read all locations
CREATE POLICY "Allow authenticated users to read locations" ON public.locations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage locations" ON public.locations
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow authenticated users to read employees
CREATE POLICY "Allow authenticated users to read employees" ON public.employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage employees" ON public.employees
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow authenticated users to read templates
CREATE POLICY "Allow authenticated users to read templates" ON public.id_card_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage templates" ON public.id_card_templates
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow users to read company settings
CREATE POLICY "Allow authenticated users to read company settings" ON public.company_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to manage company settings" ON public.company_settings
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Allow users to read activity logs (admins can see all, staff can see general)
CREATE POLICY "Allow authenticated users to read activity logs" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- ==========================================
-- SEEDING SAMPLE DATA
-- ==========================================

-- Insert departments
INSERT INTO public.departments (name, description) VALUES
  ('Security', 'Security and surveillance personnel'),
  ('Housekeeping', 'Cleaning and maintenance staff'),
  ('Administration', 'Administrative and office staff')
ON CONFLICT (name) DO NOTHING;

-- Insert locations
INSERT INTO public.locations (name, address, city, state, phone, email) VALUES
  ('New Delhi Office', '123 MG Road', 'New Delhi', 'Delhi', '+91-11-2000-0000', 'delhi@secureforce.com'),
  ('Mumbai Office', '45 Bandra West', 'Mumbai', 'Maharashtra', '+91-22-6000-0000', 'mumbai@secureforce.com'),
  ('Bangalore Office', '789 Whitefield', 'Bangalore', 'Karnataka', '+91-80-4000-0000', 'bangalore@secureforce.com'),
  ('Hyderabad Office', '321 HITEC City', 'Hyderabad', 'Telangana', '+91-40-6000-0000', 'hyderabad@secureforce.com')
ON CONFLICT (name) DO NOTHING;

-- Insert designations
INSERT INTO public.designations (name, department_id, description)
SELECT 'Security Guard', id, 'Field security personnel' FROM public.departments WHERE name = 'Security'
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.designations (name, department_id, description)
SELECT 'Senior Security Officer', id, 'Senior security management' FROM public.departments WHERE name = 'Security'
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.designations (name, department_id, description)
SELECT 'Housekeeping Staff', id, 'Cleaning and maintenance' FROM public.departments WHERE name = 'Housekeeping'
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.designations (name, department_id, description)
SELECT 'Administrative Officer', id, 'Office administration' FROM public.departments WHERE name = 'Administration'
ON CONFLICT (name) DO NOTHING;

-- Insert company settings
INSERT INTO public.company_settings (company_name, office_address, city, state, phone, email, website) VALUES
  ('SecureForce India', 'SecureForce House, 123 MG Road, New Delhi - 110001', 'New Delhi', 'Delhi', '+91-11-2000-0000', 'contact@secureforce.com', 'https://secureforce.com')
ON CONFLICT DO NOTHING;
