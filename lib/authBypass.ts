const DEFAULT_BYPASS_USER_ID = '000000000000000000000001'

/**
 * Temporary emergency access switch.
 *
 * This is intentionally opt-in so normal authentication remains the default.
 * Remove AUTH_BYPASS_ENABLED or set it to anything other than "true" to turn
 * the bypass off again.
 */
export function isAuthBypassEnabled(): boolean {
  return process.env.AUTH_BYPASS_ENABLED?.trim().toLowerCase() === 'true'
}

export function getAuthBypassUser() {
  const username = process.env.AUTH_BYPASS_USERNAME?.trim() || 'superadmin'
  const id = process.env.AUTH_BYPASS_USER_ID?.trim() || DEFAULT_BYPASS_USER_ID

  return {
    id,
    sub: id,
    username,
    name: 'Temporary Super Admin',
    email: 'bypass@local.invalid',
    tel: null,
    profile: null,
    isActive: true,
    adminPositionId: null,
    webBaseId: null,
    adminPosition: null,
    webBase: null,
    role: 'superadmin' as const,
    isSuperAdmin: true,
    tokenVersion: 0,
    permissions: [],
    createdAt: new Date(0),
    createdBy: 'auth-bypass',
    updatedAt: new Date(0),
    updatedBy: 'auth-bypass',
    deleteAt: null,
    deleteBy: null,
  }
}
