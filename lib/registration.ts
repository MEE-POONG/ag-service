import { prisma } from './prisma'

export const REGISTRATION_STATUSES = {
  pendingEmail: 'PENDING_EMAIL',
  pendingApproval: 'PENDING_APPROVAL',
  approved: 'APPROVED',
} as const

export const PENDING_REGISTRATION_DEPARTMENT = 'Public Registration'
export const PENDING_REGISTRATION_POSITION = 'Pending Review'

export function normalizeUsername(username: unknown): string {
  return String(username ?? '').trim()
}

export function getUsernameValidationError(username: unknown): string | null {
  const normalized = normalizeUsername(username)

  if (normalized.length < 3 || normalized.length > 32) {
    return 'ชื่อผู้ใช้ต้องมี 3-32 ตัวอักษร'
  }

  if (!/^[A-Za-z0-9._-]+$/.test(normalized)) {
    return 'ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข จุด ขีดกลาง และขีดล่าง'
  }

  if (['admin', 'superadmin', 'system'].includes(normalized.toLowerCase())) {
    return 'ชื่อผู้ใช้นี้ไม่สามารถใช้สมัครสมาชิกได้'
  }

  return null
}

export function isPendingRegistrationPosition(position: {
  name?: string | null
  adminDepartment?: { name?: string | null } | null
} | null | undefined): boolean {
  return (
    position?.name === PENDING_REGISTRATION_POSITION &&
    position.adminDepartment?.name === PENDING_REGISTRATION_DEPARTMENT
  )
}

export async function ensurePendingRegistrationPosition(): Promise<string> {
  const now = new Date()
  const department = await prisma.adminDepartmentDB.upsert({
    where: { name: PENDING_REGISTRATION_DEPARTMENT },
    update: {
      isActive: true,
      isDeleted: false,
      updatedAt: now,
      updatedBy: 'public-registration',
    },
    create: {
      name: PENDING_REGISTRATION_DEPARTMENT,
      description: 'บัญชีที่สมัครจากหน้าสาธารณะและยังไม่ได้รับการอนุมัติ',
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'public-registration',
      updatedBy: 'public-registration',
    },
  })

  const position = await prisma.adminPositionDB.upsert({
    where: {
      adminDepartmentId_name: {
        adminDepartmentId: department.id,
        name: PENDING_REGISTRATION_POSITION,
      },
    },
    update: {
      priority: 9999,
      isActive: true,
      isDeleted: false,
      updatedAt: now,
      updatedBy: 'public-registration',
    },
    create: {
      name: PENDING_REGISTRATION_POSITION,
      priority: 9999,
      adminDepartmentId: department.id,
      isActive: true,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: 'public-registration',
      updatedBy: 'public-registration',
    },
  })

  return position.id
}
