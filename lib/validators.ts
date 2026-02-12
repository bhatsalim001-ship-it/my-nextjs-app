import { z } from 'zod'

// Password validation helper
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Employee schemas
export const employeeFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  departmentId: z.string().uuid('Invalid department'),
  designationId: z.string().uuid('Invalid designation'),
  locationId: z.string().uuid('Invalid location'),
  dateOfJoining: z.string().date('Invalid date'),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  status: z.enum(['active', 'inactive', 'terminated']),
  idCardValidFrom: z.string().date('Invalid date'),
  idCardValidUntil: z.string().date('Invalid date'),
})

export const departmentFormSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  description: z.string().optional(),
})

export const designationFormSchema = z.object({
  name: z.string().min(2, 'Designation name is required'),
  departmentId: z.string().uuid('Invalid department'),
  description: z.string().optional(),
})

export const locationFormSchema = z.object({
  name: z.string().min(2, 'Location name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export const companySettingsSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  officeAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type EmployeeFormInput = z.infer<typeof employeeFormSchema>
export type DepartmentFormInput = z.infer<typeof departmentFormSchema>
export type DesignationFormInput = z.infer<typeof designationFormSchema>
export type LocationFormInput = z.infer<typeof locationFormSchema>
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>

// Database types
export interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Designation {
  id: string
  name: string
  department_id: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  employee_id: string
  name: string
  email: string | null
  phone: string
  department_id: string
  designation_id: string
  location_id: string
  photo_url: string | null
  date_of_joining: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  status: 'active' | 'inactive' | 'terminated'
  id_card_valid_from: string | null
  id_card_valid_until: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CompanySettings {
  id: string
  company_name: string
  office_address: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface IdCardTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  layout_config: Record<string, any>
  is_active: boolean
  is_default: boolean
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT'
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  changes: Record<string, any> | null
  created_at: string
}
