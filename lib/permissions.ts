import { NextApiRequest } from 'next'
import { verifyToken } from './auth'
import { prisma } from './prisma'
import { getAuthToken } from './cookieUtils'
import { isPermanentSuperAdmin } from './adminIdentity'
import { REGISTRATION_STATUSES } from './registration'

export interface PermissionContext {
  canAdvance: boolean
  canViews: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export async function checkUserPermissions(
  req: NextApiRequest, 
  menuPageName: string
): Promise<{ user: any; permissions: PermissionContext } | null> {
  // Get token from cookie using cookie utility or Authorization header
  let token = getAuthToken(req)
  
  // Also check middleware header
  if (!token) {
    token = req.headers['x-auth-token'] as string
  }
  
  // Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    return null
  }

  const user = await getAdminFromCookie(req, token)
  if (!user) {
    return null
  }

  // All authenticated admins have full permissions
  return {
    user,
    permissions: {
      canAdvance: true,
      canViews: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    }
  }
}

// Get admin data with full permissions from cookie
export async function getAdminFromCookie(
  req: NextApiRequest,
  tokenOverride?: string
): Promise<any | null> {
  const token = tokenOverride || getAuthToken(req)
  if (!token) {
    return null
  }

  const user = verifyToken(token)
  if (!user) {
    return null
  }

  // Get admin data from DB
  const admin = await prisma.adminDB.findFirst({
    where: {
      username: user.username,
      isActive: true,
    },
    include: {
      adminPosition: {
        include: {
          adminDepartment: true,
          AdminDefaultPermissionDB: {
            where: { isDeleted: false },
            include: { menuWebDB: true },
          },
        },
      },
      webBase: { include: {} },
    },
  }) as any

  if (!admin) {
    return null
  }

  if (
    !admin.emailVerifiedAt ||
    admin.registrationStatus !== REGISTRATION_STATUSES.approved ||
    Number(admin.tokenVersion || 0) !== Number(user.tokenVersion || 0)
  ) {
    return null
  }

  const isSuperAdmin = isPermanentSuperAdmin(admin)

  // All admins get full permissions
  return {
    ...admin,
    permissions: [],
    role: isSuperAdmin ? 'superadmin' : 'admin',
    isSuperAdmin,
  }
}

// Helper function to check if user has specific permission for a menu
export async function hasPermission(
  req: NextApiRequest,
  menuPageName: string,
  permission: keyof PermissionContext
): Promise<boolean> {
  const result = await checkUserPermissions(req, menuPageName)
  if (!result) return false
  return result.permissions[permission]
}

// Middleware helper to check if admin can access a page
export async function canAccessPage(req: NextApiRequest, menuPageName: string): Promise<boolean> {
  return await hasPermission(req, menuPageName, 'canViews')
}

// Permission decorator for API routes
export function requirePermission(menuPageName: string, permission: keyof PermissionContext) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function(req: NextApiRequest, res: any, ...args: any[]) {
      const userPermissions = await checkUserPermissions(req, menuPageName)
      
      if (!userPermissions) {
        return res.status(401).json({ error: 'ไม่มีสิทธิ์เข้าถึง - กรุณาเข้าสู่ระบบ' })
      }

      if (!userPermissions.permissions[permission]) {
        return res.status(403).json({ 
          error: `ไม่มีสิทธิ์ ${permission} สำหรับหน้า ${menuPageName}` 
        })
      }

      return method.apply(this, [req, res, ...args])
    }
  }
}

// Simple auth check for API routes
export async function requireAuth(req: NextApiRequest, res: any): Promise<any | null> {
  const admin = await getAdminFromCookie(req)
  if (!admin) {
    res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
    return null
  }
  return admin
}
