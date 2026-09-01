import { NextRequest } from 'next/server'
import { parse } from 'cookie'

export function getTokenFromRequest(request: NextRequest): string | undefined {
  // Parse cookies using cookie package for better handling
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = parse(cookieHeader)
    const token = cookies['auth-token']
    if (token) return token
  }
  
  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return undefined
}

export function shouldSkipAuth(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/auth/me') ||
    pathname.startsWith('/api/auth/forgot-password') ||
    pathname.startsWith('/api/auth/reset-password') ||
    pathname.startsWith('/api/auth/verify-email') ||
    pathname.startsWith('/api/auth/resend-verification') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/debug') ||
    pathname.startsWith('/api/widget') || // Widget APIs are public
    pathname === '/auth/login' ||
    pathname === '/auth/forgot-password' ||
    pathname === '/auth/reset-password' ||
    pathname === '/auth/verify-email' ||
    pathname === '/auth/register' ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/icon-') ||
    pathname.startsWith('/chat-widget')
  )
}

// Map routes to menu names for permission checking
export function getMenuNameFromPath(pathname: string): string | null {
  const routeToMenuMap: Record<string, string> = {
    '/admin': 'ระบบผู้ดูแล',
    '/admin/admins': 'admin-management',
    '/admin/departments': 'department-management', 
    '/admin/permissions': 'permission-management',
    '/setting': 'settings',
    '/setting/menuweb': 'menu-management',
    '/setting/image-list': 'image-management',
    '/setting/web-ag': 'web-ag-management',
    '/partner': 'partner',
    '/partner/ag-user': 'ag-user-management',
    '/partner/members': 'member-management',
    '/reports': 'reports',
    '/documents': 'documents',
  }

  // Check exact match first
  if (routeToMenuMap[pathname]) {
    return routeToMenuMap[pathname]
  }

  // Check dynamic routes
  if (pathname.startsWith('/admin/edit/') || pathname.startsWith('/admin/view/')) {
    return 'admin-management'
  }

  // Default fallback
  return null
}
