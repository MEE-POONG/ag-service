/**
 * 🛡️ Authentication & Authorization Library
 *
 * 🎯 วัตถุประสงค์:
 * - จัดการการเข้ารหัสและตรวจสอบรหัสผ่าน (Password Hashing & Verification)
 * - สร้างและตรวจสอบ JWT Token (Token Generation & Verification)
 * - ตรวจสอบสิทธิ์การเข้าถึงของผู้ใช้ (User Authentication)
 * - จัดการบทบาทและสิทธิ์ (Role & Permission Management)
 * - ป้องกันข้อมูลสำคัญ (Data Sanitization)
 *
 * 🔧 ฟังก์ชันหลัก:
 * - hashPassword(): เข้ารหัสรหัสผ่าน
 * - verifyPassword(): ตรวจสอบรหัสผ่าน
 * - generateToken(): สร้าง JWT Token
 * - verifyToken(): ตรวจสอบ JWT Token
 * - authenticateAdmin(): ตรวจสอบสิทธิ์ผู้ใช้
 * - sanitizeAdminForClient(): ลบข้อมูลสำคัญก่อนส่งไปยัง Client
 */

// /lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { ExtendedAdminDB } from '@/data/interface'
import { isPermanentSuperAdmin } from './adminIdentity'
import { REGISTRATION_STATUSES } from './registration'

/** 👥 รองรับบทบาทต่างๆ ในระบบ */
export type AppRole = 'superadmin' | 'admin' | 'user' | 'aguser'

/** 🎫 ข้อมูลที่จะใส่ใน JWT Token (เก็บเฉพาะข้อมูลที่จำเป็นและปลอดภัย) */
export interface JwtUserPayload {
  sub: string          // User ID (Subject)
  username: string     // ชื่อผู้ใช้
  role: AppRole        // บทบาทในระบบ
  isSuperAdmin: boolean // สถานะ Super Admin
  tokenVersion: number // เวอร์ชั่น Token (ใช้สำหรับ revoke token เมื่อเปลี่ยนรหัสหรือบังคับ logout)
  iat?: number        // Issued At (เวลาที่สร้าง token)
  exp?: number        // Expiration Time (เวลาหมดอายุ)
  iss?: string        // Issuer (ผู้ออก token)
  aud?: string        // Audience (ผู้รับ token)
}

// 🔑 การตั้งค่าความปลอดภัย
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// ⚠️ เตือนเมื่อไม่มี JWT_SECRET ใน Production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET is missing in production!')
}

// 🔐 === ฟังก์ชันจัดการรหัสผ่าน ===

/**
 * 🔒 เข้ารหัสรหัสผ่านด้วย bcrypt
 * @param password รหัสผ่านที่ต้องการเข้ารหัส
 * @returns รหัสผ่านที่เข้ารหัสแล้ว (hash)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12) // ใช้ salt rounds = 12 (ระดับความปลอดภัยสูง)
}

/**
 * 🔓 ตรวจสอบรหัสผ่านกับ hash ที่เก็บไว้ใน database
 * @param password รหัสผ่านที่ผู้ใช้กรอก
 * @param hashedPassword รหัสผ่านที่เข้ารหัสแล้วใน database
 * @returns true หากรหัสผ่านถูกต้อง, false หากไม่ถูกต้อง
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 🎫 === ฟังก์ชันจัดการ JWT Token ===

/**
 * 🏭 สร้าง JWT Token จาก payload ที่กำหนด
 * @param payload ข้อมูลผู้ใช้ที่จะใส่ใน token
 * @returns JWT Token string
 */
export function generateToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',        // อายุ token 7 วัน
    issuer: 'MeGuild',      // ผู้ออก token
    audience: 'admin',      // กลุ่มผู้ใช้ที่สามารถใช้ token นี้ได้
  })
}

/**
 * 🔍 ตรวจสอบความถูกต้องของ JWT Token และดึง payload ออกมา
 * @param token JWT Token ที่ต้องการตรวจสอบ
 * @returns JwtUserPayload หาก token ถูกต้อง, null หาก token ไม่ถูกต้อง
 *
 * ⚠️ หมายเหตุ: อย่านำ payload นี้ไปใช้แทนข้อมูลสดจาก database
 */
export function verifyToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'MeGuild',
      audience: 'admin'
    }) as JwtUserPayload
  } catch {
    return null // Token ไม่ถูกต้อง, หมดอายุ, หรือถูกแก้ไข
  }
}

// 🛠️ === ฟังก์ชันช่วยเหลือ (Helper Functions) ===

/**
 * 🔑 ดึงรหัสผ่านที่เข้ารหัสแล้วจากฟิลด์ที่เป็นไปได้
 * @param u ข้อมูลผู้ใช้จาก database
 * @returns รหัสผ่านที่เข้ารหัสแล้ว หรือ undefined หากไม่พบ
 *
 * หมายเหตุ: รองรับการเปลี่ยนแปลง schema ระหว่างรุ่น (password หรือ passwordHash)
 */
function getHashedPassword(u: any): string | undefined {
  if (typeof u?.password === 'string') return u.password
  if (typeof u?.passwordHash === 'string') return u.passwordHash
  return undefined
}

/**
 * 🧹 ลบข้อมูลสำคัญออกจาก object ก่อนส่งกลับไปยัง client
 * @param admin ข้อมูลผู้ใช้ที่ต้องการทำความสะอาด
 * @returns ข้อมูลผู้ใช้ที่ปลอดภัยสำหรับส่งไปยัง client
 *
 * 🚫 ข้อมูลที่จะถูกลบ:
 * - password / passwordHash (รหัสผ่าน)
 * - resetToken (token สำหรับรีเซ็ตรหัสผ่าน)
 * - resetTokenExpire (วันหมดอายุของ reset token)
 */
export function sanitizeAdminForClient<T extends Record<string, any>>(admin: T): T {
  const copy: any = { ...admin }
  if ('password' in copy) delete copy.password
  if ('passwordHash' in copy) delete copy.passwordHash
  if ('resetToken' in copy) delete copy.resetToken
  if ('resetTokenExpire' in copy) delete copy.resetTokenExpire
  return copy
}

/**
 * 📋 ดึงรายชื่อสิทธิ์ (permissions) จากความสัมพันธ์ตำแหน่งงาน
 * @param admin ข้อมูลผู้ใช้ที่มี AdminPositionDB และ permissions
 * @returns array ของชื่อเมนูที่ผู้ใช้มีสิทธิ์เข้าถึง
 */
function extractPermissionNames(admin: any): string[] {
  const list = admin?.AdminPositionDB?.AdminDefaultPermissionDB ?? []
  return list.map((p: any) => p?.menuWebDB?.name).filter(Boolean)
}

// 🔐 === ฟังก์ชันหลักสำหรับการตรวจสอบสิทธิ์ ===

/**
 * 🎯 ตรวจสอบสิทธิ์การเข้าถึงของผู้ใช้ (Main Authentication Function)
 * @param username ชื่อผู้ใช้
 * @param password รหัสผ่าน
 * @returns ข้อมูลผู้ใช้ที่ปลอดภัย หรือ null หากการตรวจสอบล้มเหลว
 *
 * 🔄 Process Flow:
 * 1. ตรวจสอบชื่อผู้ใช้และค้นหาในฐานข้อมูล
 * 2. ตรวจสอบสถานะ active ของผู้ใช้
 * 3. ตรวจสอบรหัสผ่าน
 * 4. ดึงข้อมูลสิทธิ์และบทบาท
 * 5. ทำความสะอาดข้อมูลก่อนส่งกลับ
 */
export async function authenticateAdmin(
  username: string,
  password: string
): Promise<ExtendedAdminDB | null> {
  const uname = String(username).trim()

  // 🔍 ค้นหาผู้ใช้ในฐานข้อมูลพร้อมข้อมูลที่เกี่ยวข้อง
  const admin = await prisma.adminDB.findFirst({
    where: {
      username: uname,
    },
    include: {
      adminPosition: {
        include: {
          adminDepartment: true, // ข้อมูลแผนก
          AdminDefaultPermissionDB: {
            where: { isDeleted: false }, // เฉพาะสิทธิ์ที่ยังใช้งาน
            include: { menuWebDB: true } // รายละเอียดหน้าเมนู
          },
        },
      },
      webBase: true, // ข้อมูล website base
    },
  })

  // ❌ ไม่พบผู้ใช้
  if (!admin) return null

  // 🔑 ดึงรหัสผ่านที่เข้ารหัสแล้วจาก database
  const hash = getHashedPassword(admin)
  if (!hash) return null // ไม่มีรหัสผ่าน

  // 🔓 ตรวจสอบรหัสผ่าน
  const ok = await verifyPassword(password, hash)
  if (!ok) return null // รหัสผ่านไม่ถูกต้อง

  // 📋 สร้างรายการสิทธิ์และกำหนดบทบาท
  const permissions = extractPermissionNames(admin)
  const isSuperAdmin = isPermanentSuperAdmin(admin)
  const role: AppRole = isSuperAdmin ? 'superadmin' : 'admin'

  // 🔢 ดึง tokenVersion สำหรับการจัดการ token revocation
  const tokenVersion = Number((admin as any).tokenVersion || 0)

  // 🧹 ทำความสะอาดข้อมูลและเพิ่มข้อมูลเสริม
  const safe = sanitizeAdminForClient({
    ...admin,
    permissions,
    role,
    isSuperAdmin,
    tokenVersion,
  }) as ExtendedAdminDB & { tokenVersion?: number }

  return safe
}

/**
 * 🏗️ สร้าง JWT Payload จากข้อมูลผู้ใช้
 * @param admin ข้อมูลผู้ใช้ (จาก database หรือข้อมูลที่ทำความสะอาดแล้ว)
 * @returns JwtUserPayload สำหรับสร้าง JWT Token
 */
export function buildJwtPayload(admin: any): JwtUserPayload {
  const isRoot = isPermanentSuperAdmin(admin)
  return {
    sub: String(admin.id),                        // User ID
    username: admin.username,                     // ชื่อผู้ใช้
    role: isRoot ? 'superadmin' : 'admin',       // บทบาท (superadmin หรือ admin)
    isSuperAdmin: !!isRoot,                      // สถานะ super admin
    tokenVersion: Number(admin.tokenVersion || 0), // เวอร์ชั่น token
  }
}
