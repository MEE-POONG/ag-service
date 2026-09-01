import { createHash, randomBytes } from 'crypto'
import { prisma } from './prisma'
import { normalizeEmail } from './adminIdentity'
import { sendPasswordResetEmail, sendVerificationEmail } from './accountEmail'

export const ADMIN_TOKEN_TYPES = {
  passwordReset: 'PASSWORD_RESET',
  emailVerification: 'EMAIL_VERIFICATION',
} as const

type AdminTokenType = (typeof ADMIN_TOKEN_TYPES)[keyof typeof ADMIN_TOKEN_TYPES]
type TokenAdmin = { id: string; email: string; name: string }

const TOKEN_TTL_MS: Record<AdminTokenType, number> = {
  PASSWORD_RESET: 30 * 60 * 1000,
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
}

const TOKEN_COOLDOWN_MS = 60 * 1000

export function hashAdminAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

async function issueAdminAuthToken(
  admin: TokenAdmin,
  type: AdminTokenType
): Promise<{ rawToken: string; tokenId: string } | null> {
  const recentToken = await prisma.adminAuthTokenDB.findFirst({
    where: {
      adminId: admin.id,
      type,
      usedAt: null,
      createdAt: { gt: new Date(Date.now() - TOKEN_COOLDOWN_MS) },
    },
    select: { id: true },
  })

  if (recentToken) return null

  const rawToken = randomBytes(32).toString('hex')
  const token = await prisma.adminAuthTokenDB.create({
    data: {
      adminId: admin.id,
      type,
      email: normalizeEmail(admin.email),
      tokenHash: hashAdminAuthToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS[type]),
    },
    select: { id: true },
  })

  return { rawToken, tokenId: token.id }
}

async function issueAndSend(
  admin: TokenAdmin,
  type: AdminTokenType,
  sender: (admin: TokenAdmin, token: string) => Promise<void>
): Promise<'sent' | 'cooldown'> {
  const issued = await issueAdminAuthToken(admin, type)
  if (!issued) return 'cooldown'

  try {
    await sender(admin, issued.rawToken)
    return 'sent'
  } catch (error) {
    await prisma.adminAuthTokenDB.delete({ where: { id: issued.tokenId } }).catch(() => undefined)
    throw error
  }
}

export function sendPasswordResetForAdmin(admin: TokenAdmin) {
  return issueAndSend(admin, ADMIN_TOKEN_TYPES.passwordReset, sendPasswordResetEmail)
}

export function sendVerificationForAdmin(admin: TokenAdmin) {
  return issueAndSend(admin, ADMIN_TOKEN_TYPES.emailVerification, sendVerificationEmail)
}
