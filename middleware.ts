import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, shouldSkipAuth } from '@/lib/middlewareUtils'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes that don't need auth, and login page
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next()
  }

  // Get token using utility function
  const token = getTokenFromRequest(request)

  // If no token, redirect to login
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Authenticated; continue request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (login endpoint)
     * - api/auth/logout (logout endpoint)
     * - api/auth/me (session check endpoint)
     * - auth/login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     * - public (public files)
     */
    '/((?!api/auth/(?:login|logout|me)|auth/login|_next/static|_next/image|favicon.ico|uploads|public).*)',
  ],
}
