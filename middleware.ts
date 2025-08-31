import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ExtendedAdminDB } from './data/interface'

// รายการ path ที่ต้องการป้องกัน
const protectedPaths = [
  '/admin',
  '/api/admin',
  '/api/admin-departments',
  '/api/admin-permissions',
  '/api/admin-positions',
  '/setting',
  '/reports',
  '/documents'
]

// รายการ path ที่ superadmin เท่านั้นที่เข้าถึงได้
const superAdminOnlyPaths = [
  '/admin/permissions',
  '/admin/departments',
  '/api/admin-permissions',
  '/api/admin-departments'
]

// Menu mapping สำหรับตรวจสอบสิทธิ์
const pathToMenuMapping: Record<string, string> = {
  '/admin': 'ระบบผู้ดูแล',
  '/reports': 'รายงาน',
  '/documents': 'เอกสาร',
  '/setting': 'ตั้งค่า'
}

function verifyToken(token: string): ExtendedAdminDB | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as ExtendedAdminDB
  } catch {
    return null
  }
}

function isSuperAdmin(user: ExtendedAdminDB | null): boolean {
  return user?.username === 'superadmin'
}

function hasPermissionForPath(user: ExtendedAdminDB | null, path: string): boolean {
  // ถ้าเป็น superadmin ให้ผ่านทั้งหมด
  if (isSuperAdmin(user)) {
    return true
  }

  // ตรวจสอบจาก path mapping
  const menuName = pathToMenuMapping[path]
  if (menuName && user?.permissions?.includes(menuName)) {
    return true
  }

  // ตรวจสอบจาก adminPosition permissions
  if (user?.adminPosition?.AdminDefaultPermissionDB) {
    const hasMenuPermission = user.adminPosition.AdminDefaultPermissionDB.some(
      (permission: any) => {
        const permissionMenuName = permission.menuPage?.name
        return permissionMenuName === menuName && permission.canViews
      }
    )
    if (hasMenuPermission) {
      return true
    }
  }

  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ข้าม static files และ API routes ที่ไม่ต้องการการตรวจสอบ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/auth/login' ||
    pathname === '/auth/logout' ||
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/logout' ||
    pathname === '/api/auth/me'
  ) {
    return NextResponse.next()
  }

  // ตรวจสอบว่า path ต้องการการป้องกันหรือไม่
  const isProtectedPath = protectedPaths.some(protectedPath => 
    pathname.startsWith(protectedPath)
  )

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // ดึง token จาก cookie หรือ Authorization header
  let token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  // ถ้าไม่มี token ให้ redirect ไป login
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // ตรวจสอบ token
  const user = verifyToken(token)
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // ตรวจสอบว่าเป็น superadmin only path หรือไม่
  const isSuperAdminOnlyPath = superAdminOnlyPaths.some(superAdminPath => 
    pathname.startsWith(superAdminPath)
  )

  if (isSuperAdminOnlyPath && !isSuperAdmin(user)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // ตรวจสอบสิทธิ์การเข้าถึง path
  if (!hasPermissionForPath(user, pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // เพิ่ม user data ใน headers สำหรับใช้ใน API routes
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-data', JSON.stringify(user))
  requestHeaders.set('x-is-superadmin', isSuperAdmin(user).toString())

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
