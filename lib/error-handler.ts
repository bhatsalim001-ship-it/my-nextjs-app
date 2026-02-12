import { toast } from 'sonner'

export type ErrorLevel = 'error' | 'warning' | 'info'

export interface LogEntry {
  timestamp: string
  level: ErrorLevel
  message: string
  context?: Record<string, any>
  stack?: string
}

class Logger {
  private logs: LogEntry[] = []
  private readonly MAX_LOGS = 100

  log(level: ErrorLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    }

    this.logs.push(entry)

    // Keep only last MAX_LOGS
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logFn = console[level] || console.log
      logFn(`[${level.toUpperCase()}] ${message}`, context)
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error?.stack,
    }

    this.logs.push(entry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS)
    }

    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, context, error)
    }

    // Send to error tracking in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(entry)
    }
  }

  warning(message: string, context?: Record<string, any>) {
    this.log('warning', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  private reportError(entry: LogEntry) {
    // TODO: Send to Sentry, LogRocket, or similar service
    // This would be configured based on environment
  }
}

export const logger = new Logger()

// Error handling helper for API calls
export async function handleApiError(
  error: any,
  context: string,
  showToast: boolean = true
): Promise<{ message: string; details?: any }> {
  let message = 'An unexpected error occurred'
  let details = error

  if (error?.error_description) {
    // Supabase error
    message = error.error_description
    details = error
  } else if (error?.message) {
    // Standard error
    message = error.message
    details = error
  } else if (typeof error === 'string') {
    // String error
    message = error
  }

  logger.error(`${context}: ${message}`, { error })

  if (showToast) {
    toast.error(message)
  }

  return { message, details }
}

// Validation error handler
export function handleValidationError(
  errors: Record<string, string[]>,
  context: string = 'Validation failed'
): void {
  logger.warning(context, { errors })
  const errorMessages = Object.values(errors).flat()
  if (errorMessages.length > 0) {
    toast.error(errorMessages[0])
  }
}

// Success handler with logging
export function handleSuccess(
  message: string,
  context?: string,
  showToast: boolean = true
): void {
  if (context) {
    logger.info(`${context}: ${message}`)
  } else {
    logger.info(message)
  }

  if (showToast) {
    toast.success(message)
  }
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any
  let delay = initialDelay

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        logger.warning(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`, { error })
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  }

  throw lastError
}
