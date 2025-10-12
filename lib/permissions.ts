import { NextApiRequest } from 'next'
import { verifyToken } from './auth'
import { prisma } from './prisma'
import { getAuthToken } from './cookieUtils'

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

  const user = verifyToken(token)
  if (!user) {
    return null
  }

  // Superadmin has all permissions
  if (user.username === 'superadmin') {
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

  // Get user's permissions for the specific menu page from AdminDefaultPermissionDB
  const admin = await prisma.adminDB.findFirst({
    where: {
      username: user.username,
      isActive: true,

    },
    include: {
      adminPosition: {
        include: {
          AdminDefaultPermissionDB: {
            where: {
              isDeleted: false,
            },
            include: {
              menuWebDB: true,
            },
          },
        },
      },
    },
  }) as any

  if (!admin || !admin.adminPosition) {
    return {
      user,
      permissions: {
        canAdvance: false,
        canViews: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      }
    }
  }

  // Get permissions from AdminDefaultPermissionDB
  const permission = admin.adminPosition?.AdminDefaultPermissionDB?.find(
    (p: any) => p.menuWebDB?.name === menuPageName
  )

  const permissions: PermissionContext = {
    canAdvance: permission?.canAdvance || false,
    canViews: permission?.canViews || false,
    canCreate: permission?.canCreate || false,
    canUpdate: permission?.canUpdate || false,
    canDelete: permission?.canDelete || false,
  }

  return { user, permissions }
}

// Get admin data with full permissions from cookie
export async function getAdminFromCookie(req: NextApiRequest): Promise<any | null> {
  const token = getAuthToken(req)
  if (!token) {
    return null
  }

  const user = verifyToken(token)
  if (!user) {
    return null
  }

  // For superadmin, get all menu permissions
  if (user.username === 'superadmin') {
    const allMenuPages = await prisma.menuWebDB.findMany({
      where: {  },
      select: { name: true }
    })
    
    return {
      ...user,
      permissions: allMenuPages.map(p => p.name),
      role: 'superadmin',
      isSuperAdmin: true,
    }
  }

  // Get detailed admin data with permissions
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
            where: {
              isDeleted: false,
            },
            include: {
              menuWebDB: true,
            },
          },
        },
      },
      webBase: {
        include: {}
      },
    },
  }) as any

  if (!admin) {
    return null
  }

  const permissions = admin.AdminPositionDB?.AdminDefaultPermissionDB?.map((p: any) => p.menuWebDB?.name).filter(Boolean) || []

  return {
    ...admin,
    permissions,
    role: 'admin',
    isSuperAdmin: false,
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
  
  // Superadmin has all permissions
  if (result.user.username === 'superadmin') return true
  
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

      // Superadmin bypasses all permission checks
      if (userPermissions.user.username === 'superadmin') {
        return method.apply(this, [req, res, ...args])
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