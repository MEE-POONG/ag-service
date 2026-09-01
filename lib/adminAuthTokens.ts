import { createHash, randomBytes, randomInt } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { normalizeEmail } from './adminIdentity'
import { sendPasswordResetOtpEmail, sendVerificationEmail } from './accountEmail'

export const ADMIN_TOKEN_TYPES = {
  passwordResetOtp: 'PASSWORD_RESET_OTP',
  emailVerification: 'EMAIL_VERIFICATION',
} as const

type AdminTokenType = (typeof ADMIN_TOKEN_TYPES)[keyof typeof ADMIN_TOKEN_TYPES]
type TokenAdmin = { id: string; email: string; name: string }

const TOKEN_TTL_MS: Record<AdminTokenType, number> = {
  PASSWORD_RESET_OTP: 10 * 60 * 1000,
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
}

const TOKEN_COOLDOWN_MS = 60 * 1000
const PASSWORD_RESET_REFERENCE_PATTERN = /^AG-[A-F0-9]{12}$/
const PASSWORD_RESET_OTP_PATTERN = /^\d{6}$/
const PASSWORD_RESET_STORAGE_PREFIX = 'otp'

export function hashAdminAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function createPasswordResetReference(): string {
  return `AG-${randomBytes(6).toString('hex').toUpperCase()}`
}

export function isPasswordResetReference(value: unknown): value is string {
  return typeof value === 'string' && PASSWORD_RESET_REFERENCE_PATTERN.test(value)
}

export function isPasswordResetOtp(value: unknown): value is string {
  return typeof value === 'string' && PASSWORD_RESET_OTP_PATTERN.test(value)
}

export function getPasswordResetTokenPrefix(referenceCode: string): string {
  return `${PASSWORD_RESET_STORAGE_PREFIX}:${referenceCode}:`
}

export async function comparePasswordResetOtp(
  storedValue: string,
  referenceCode: string,
  otp: string
): Promise<boolean> {
  const prefix = getPasswordResetTokenPrefix(referenceCode)
  if (!storedValue.startsWith(prefix)) return false
  const otpHash = storedValue.slice(prefix.length)
  return bcrypt.compare(otp, otpHash)
}

async function issueAdminAuthToken(
  admin: TokenAdmin,
  type: AdminTokenType
): Promise<{ rawToken: string; tokenId: string } | null> {
  const recentToken = await prisma.adminAuthTokenDB.findFirst({
    where: {
      adminId: admin.id,
      type,
      OR: [
        { usedAt: null },
        { usedAt: { isSet: false } },
      ],
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
      usedAt: null,
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

function extractPasswordResetReference(storedValue: string): string | null {
  const [prefix, referenceCode] = storedValue.split(':', 3)
  if (prefix !== PASSWORD_RESET_STORAGE_PREFIX || !isPasswordResetReference(referenceCode)) {
    return null
  }
  return referenceCode
}

export async function sendPasswordResetOtpForAdmin(
  admin: TokenAdmin
): Promise<{ referenceCode: string; status: 'sent' | 'cooldown' }> {
  const recentToken = await prisma.adminAuthTokenDB.findFirst({
    where: {
      adminId: admin.id,
      type: ADMIN_TOKEN_TYPES.passwordResetOtp,
      OR: [
        { usedAt: null },
        { usedAt: { isSet: false } },
      ],
      createdAt: { gt: new Date(Date.now() - TOKEN_COOLDOWN_MS) },
    },
    orderBy: { createdAt: 'desc' },
    select: { tokenHash: true },
  })
  const recentReference = recentToken
    ? extractPasswordResetReference(recentToken.tokenHash)
    : null

  if (recentReference) {
    return { referenceCode: recentReference, status: 'cooldown' }
  }

  const now = new Date()
  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0')
  const referenceCode = createPasswordResetReference()
  const otpHash = await bcrypt.hash(otp, 12)

  await prisma.adminAuthTokenDB.updateMany({
    where: {
      adminId: admin.id,
      type: ADMIN_TOKEN_TYPES.passwordResetOtp,
      OR: [
        { usedAt: null },
        { usedAt: { isSet: false } },
      ],
    },
    data: { usedAt: now },
  })

  const token = await prisma.adminAuthTokenDB.create({
    data: {
      adminId: admin.id,
      type: ADMIN_TOKEN_TYPES.passwordResetOtp,
      email: normalizeEmail(admin.email),
      tokenHash: `${getPasswordResetTokenPrefix(referenceCode)}${otpHash}`,
      expiresAt: new Date(now.getTime() + TOKEN_TTL_MS.PASSWORD_RESET_OTP),
      usedAt: null,
    },
    select: { id: true },
  })

  try {
    await sendPasswordResetOtpEmail(admin, otp, referenceCode)
    return { referenceCode, status: 'sent' }
  } catch (error) {
    await prisma.adminAuthTokenDB.delete({ where: { id: token.id } }).catch(() => undefined)
    throw error
  }
}

export function sendVerificationForAdmin(admin: TokenAdmin) {
  return issueAndSend(admin, ADMIN_TOKEN_TYPES.emailVerification, sendVerificationEmail)
}
