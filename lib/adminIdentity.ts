export const PERMANENT_SUPER_ADMIN_EMAIL = 'humansaees0@gmail.com'

export function normalizeEmail(email: unknown): string {
  return String(email ?? '').trim().toLowerCase()
}

export function isValidEmail(email: unknown): boolean {
  const normalized = normalizeEmail(email)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

export function isEmailVerified(admin: { emailVerifiedAt?: Date | string | null }): boolean {
  return Boolean(admin.emailVerifiedAt)
}

export function isPermanentSuperAdminEmail(email: unknown): boolean {
  return normalizeEmail(email) === PERMANENT_SUPER_ADMIN_EMAIL
}

export function isPermanentSuperAdmin(admin: {
  email?: string | null
  emailVerifiedAt?: Date | string | null
}): boolean {
  return isPermanentSuperAdminEmail(admin.email) && isEmailVerified(admin)
}
