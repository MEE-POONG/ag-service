import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { ExtendedAdminDB } from '@/data/interface'


// export interface ExtendedAdminDB {
//   id: string
//   username: string
//   email: string
//   role: 'admin' | 'user' | 'aguser'
//   permissions?: string[]
// }

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(admin: ExtendedAdminDB): string {
  return jwt.sign(admin, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  })
}

export function verifyToken(token: string): ExtendedAdminDB | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as ExtendedAdminDB
  } catch {
    return null
  }
}

export async function authenticateAdmin(username: string, password: string): Promise<ExtendedAdminDB | null> {
  // Check AdminDB first
  const admin = await prisma.adminDB.findFirst({
    where: {
      username,
      isActive: true,
      isDeleted: false,
    },
    include: {
      adminPosition: {
        include: {
          adminDepartment: true,
          AdminDefaultPermissionDB: {
            include: {
              menuPage: true,
            },
          },
        },
      },
      webBase: true,
    },
  })

  if (admin && await verifyPassword(password, admin.password)) {
    const permissions = admin.adminPosition?.AdminDefaultPermissionDB.map(p => p.menuPage.name) || []

    // Return ExtendedAdminDB with permissions and role
    return {
      ...admin,
      permissions,
      role: 'admin', // Default role for admin system
    }
  }

  // This is an admin-only system, so we only check AdminDB
  return null
} 
