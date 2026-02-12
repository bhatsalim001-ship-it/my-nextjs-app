import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or user ID for rate limiting
  return request.ip || request.headers.get('x-forwarded-for') || 'unknown'
}

function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

// Stricter rate limit for auth endpoints
function checkAuthRateLimit(key: string): boolean {
  return checkRateLimit(key, 10, 900000) // 10 requests per 15 minutes
}

export function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const pathname = requestUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]

  // Verify routes (public)
  const isVerifyRoute = pathname.startsWith('/verify/')

  // Get auth token from cookies
  const authToken = request.cookies.get('sb-session')

  // Apply rate limiting to auth endpoints
  if (publicRoutes.some(route => pathname === route)) {
    const rateLimitKey = getRateLimitKey(request)
    if (!checkAuthRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // General rate limiting for all requests
  const generalRateLimitKey = getRateLimitKey(request)
  if (!checkRateLimit(generalRateLimitKey, 200, 60000)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded.' },
      { status: 429 }
    )
  }

  // If trying to access protected route without auth, redirect to login
  if (!authToken && !publicRoutes.includes(pathname) && !isVerifyRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (authToken && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
