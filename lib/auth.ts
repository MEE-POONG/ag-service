// /lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { ExtendedAdminDB } from '@/data/interface'

/** รองรับบทบาท superadmin */
export type AppRole = 'superadmin' | 'admin' | 'user' | 'aguser'

/** Payload ที่จะใส่ใน JWT (เล็กและปลอดภัย) */
export interface JwtUserPayload {
  sub: string          // user id
  username: string
  role: AppRole
  isSuperAdmin: boolean
  tokenVersion: number // ใช้ revoke token เวลาเปลี่ยนรหัส/บังคับ logout
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

const ROOT_USERNAME = (process.env.NEXT_PUBLIC_ROOT_USERNAME || 'superadmin').toLowerCase()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET is missing in production!')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/** sign เฉพาะ payload ขนาดเล็กเท่านั้น */
export function generateToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'MeGuild',
    audience: 'admin',
  })
}

/** verify JWT -> payload (อย่านำไปใช้แทนข้อมูลสดจาก DB) */
export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'MeGuild', audience: 'admin' }) as JwtUserPayload
  } catch {
    return null
  }
}

/** helper: เอาค่า hash จากฟิลด์ password หรือ passwordHash (กัน schema ต่างรุ่น) */
function getHashedPassword(u: any): string | undefined {
  if (typeof u?.password === 'string') return u.password
  if (typeof u?.passwordHash === 'string') return u.passwordHash
  return undefined
}

/** ตัด field อ่อนไหวก่อนส่งกลับ client */
export function sanitizeAdminForClient<T extends Record<string, any>>(admin: T): T {
  const copy: any = { ...admin }
  if ('password' in copy) delete copy.password
  if ('passwordHash' in copy) delete copy.passwordHash
  if ('resetToken' in copy) delete copy.resetToken
  if ('resetTokenExpire' in copy) delete copy.resetTokenExpire
  return copy
}

/** ดึงชื่อ permission จากความสัมพันธ์ตำแหน่ง */
function extractPermissionNames(admin: any): string[] {
  const list = admin?.adminPosition?.AdminDefaultPermissionDB ?? []
  return list.map((p: any) => p?.menuPage?.name).filter(Boolean)
}

/**
 * ตรวจ DB + verify รหัสผ่าน
 * คืน ExtendedAdminDB (sanitize แล้ว) พร้อม permissions และ role
 */
export async function authenticateAdmin(
  username: string,
  password: string
): Promise<ExtendedAdminDB | null> {
  const uname = String(username).trim()
  const isRootLogin = uname.toLowerCase() === ROOT_USERNAME

  const admin = await prisma.adminDB.findFirst({
    where: {
      username: uname,
      isActive: true,
      
    },
    include: {
      adminPosition: {
        include: {
          adminDepartment: true,
          AdminDefaultPermissionDB: { include: { menuPage: true } },
        },
      },
      webBase: true,
    },
  })

  if (!admin) return null

  // ดึง hash จากฟิลด์ที่ถูกต้อง (password หรือ passwordHash)
  const hash = getHashedPassword(admin)
  if (!hash) return null

  // ตรวจสอบรหัสผ่าน
  const ok = await verifyPassword(password, hash)
  if (!ok) return null

  // สร้าง permissions และ role
  const permissions = extractPermissionNames(admin)
  const role: AppRole = isRootLogin ? 'superadmin' : 'admin'

  // แนบ tokenVersion (ถ้ามี) เพื่อใช้ใส่ลง JWT
  const tokenVersion = Number((admin as any).tokenVersion || 0)

  const safe = sanitizeAdminForClient({
    ...admin,
    permissions,
    role,
    tokenVersion,
  }) as ExtendedAdminDB & { tokenVersion?: number }

  return safe
}

/** สร้าง payload สำหรับ JWT จาก object ผู้ใช้ (รับจาก DB หรือ safe user ก็ได้) */
export function buildJwtPayload(admin: any): JwtUserPayload {
  const isRoot = (admin?.username || '').toLowerCase() === ROOT_USERNAME
  return {
    sub: String(admin.id),
    username: admin.username,
    role: isRoot ? 'superadmin' : 'admin',
    isSuperAdmin: !!isRoot,
    tokenVersion: Number(admin.tokenVersion || 0),
  }
}
