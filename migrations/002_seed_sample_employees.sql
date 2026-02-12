-- ==========================================
-- SEED TEST DATA FOR SECUREFORCE
-- ==========================================

-- Note: Create test user first via Supabase auth dashboard or API
-- Then create the test admin user profile:

-- Get the IDs of departments and locations we created
DO $$
DECLARE
  security_dept_id UUID;
  housekeeping_dept_id UUID;
  admin_dept_id UUID;
  delhi_loc_id UUID;
  mumbai_loc_id UUID;
  bangalore_loc_id UUID;
  hyderabad_loc_id UUID;
  sg_desig_id UUID;
  sso_desig_id UUID;
  hk_desig_id UUID;
  ao_desig_id UUID;
  test_user_id UUID;
BEGIN
  -- Get department IDs
  SELECT id INTO security_dept_id FROM public.departments WHERE name = 'Security';
  SELECT id INTO housekeeping_dept_id FROM public.departments WHERE name = 'Housekeeping';
  SELECT id INTO admin_dept_id FROM public.departments WHERE name = 'Administration';

  -- Get location IDs
  SELECT id INTO delhi_loc_id FROM public.locations WHERE name = 'New Delhi Office';
  SELECT id INTO mumbai_loc_id FROM public.locations WHERE name = 'Mumbai Office';
  SELECT id INTO bangalore_loc_id FROM public.locations WHERE name = 'Bangalore Office';
  SELECT id INTO hyderabad_loc_id FROM public.locations WHERE name = 'Hyderabad Office';

  -- Get designation IDs
  SELECT id INTO sg_desig_id FROM public.designations WHERE name = 'Security Guard';
  SELECT id INTO sso_desig_id FROM public.designations WHERE name = 'Senior Security Officer';
  SELECT id INTO hk_desig_id FROM public.designations WHERE name = 'Housekeeping Staff';
  SELECT id INTO ao_desig_id FROM public.designations WHERE name = 'Administrative Officer';

  -- You'll need to get the test_user_id from your Supabase auth.users table
  -- Replace with actual UUID from your test user account
  test_user_id := '00000000-0000-0000-0000-000000000000'::UUID;

  -- Insert sample employees (6 total)
  INSERT INTO public.employees (
    employee_id, name, email, phone, department_id, designation_id, location_id,
    date_of_joining, emergency_contact_name, emergency_contact_phone, status,
    id_card_valid_from, id_card_valid_until, created_by
  ) VALUES
    (
      'SF-0001', 'Rajesh Kumar', 'rajesh.kumar@secureforce.com', '+91-9876543210',
      security_dept_id, sg_desig_id, delhi_loc_id,
      '2023-01-15', 'Priya Kumar', '+91-9876543211', 'active',
      '2024-01-01', '2026-12-31', test_user_id
    ),
    (
      'SF-0002', 'Priya Singh', 'priya.singh@secureforce.com', '+91-9876543212',
      security_dept_id, sso_desig_id, mumbai_loc_id,
      '2022-06-20', 'Amit Singh', '+91-9876543213', 'active',
      '2024-01-01', '2026-12-31', test_user_id
    ),
    (
      'SF-0003', 'Vikram Patel', 'vikram.patel@secureforce.com', '+91-9876543214',
      security_dept_id, sg_desig_id, bangalore_loc_id,
      '2023-03-10', 'Neha Patel', '+91-9876543215', 'active',
      '2024-01-01', '2026-12-31', test_user_id
    ),
    (
      'SF-0004', 'Anita Sharma', 'anita.sharma@secureforce.com', '+91-9876543216',
      housekeeping_dept_id, hk_desig_id, hyderabad_loc_id,
      '2023-05-05', 'Rohan Sharma', '+91-9876543217', 'active',
      '2024-01-01', '2026-12-31', test_user_id
    ),
    (
      'SF-0005', 'Sanjay Gupta', 'sanjay.gupta@secureforce.com', '+91-9876543218',
      admin_dept_id, ao_desig_id, delhi_loc_id,
      '2022-09-12', 'Sneha Gupta', '+91-9876543219', 'active',
      '2024-01-01', '2026-12-31', test_user_id
    ),
    (
      'SF-0006', 'Deepak Verma', 'deepak.verma@secureforce.com', '+91-9876543220',
      security_dept_id, sg_desig_id, mumbai_loc_id,
      '2023-08-22', 'Kavya Verma', '+91-9876543221', 'inactive',
      '2024-01-01', '2025-12-31', test_user_id
    );

  RAISE NOTICE 'Sample employees inserted successfully!';
END $$;
