// Environment and app configuration
export const APP_CONFIG = {
  // App metadata
  appName: 'SecureForce',
  appVersion: '1.0.0',
  environment: process.env.NODE_ENV || 'development',

  // URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // Security
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  rateLimitWindow: 60 * 1000, // 1 minute
  maxRequests: 100,
  maxAuthRequests: 10,
  authRateLimitWindow: 15 * 60 * 1000, // 15 minutes

  // File upload
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],

  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100,

  // Cache
  cacheExpireTime: 5 * 60 * 1000, // 5 minutes
  enableCache: true,

  // Logging
  enableLogging: true,
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',

  // Features
  features: {
    exportEnabled: true,
    backupEnabled: true,
    analyticsEnabled: true,
    auditLogsEnabled: true,
  },

  // Validation rules
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,

  // UI
  toastDuration: 3000, // milliseconds
  animationDuration: 300, // milliseconds
}

// Check if all required env vars are set
export function validateEnvironment(): string[] {
  const errors: string[] = []

  if (!APP_CONFIG.supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  if (!APP_CONFIG.supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  return errors
}

// Get config value with fallback
export function getConfig<T>(key: keyof typeof APP_CONFIG, defaultValue?: T): T {
  return (APP_CONFIG[key] as T) || defaultValue!
}
