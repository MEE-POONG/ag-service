// /lib/cookieUtils.ts
import type { NextApiResponse, NextApiRequest } from 'next'
import type { NextRequest } from 'next/server'
import { parse, serialize } from 'cookie'

export const AUTH_COOKIE_NAME = 'auth-token'
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 วัน

export function setAuthCookie(
  res: NextApiResponse,
  token: string,
  maxAgeSec: number = DEFAULT_MAX_AGE
) {
  res.setHeader(
    'Set-Cookie',
    serialize(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ถ้าข้ามโดเมนให้ใช้ 'none' + secure:true
      path: '/',
      maxAge: maxAgeSec,
    })
  )
}

export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    serialize(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  )
}

/**
 * ดึงค่า auth-token จากคำขอ
 * รองรับทั้ง NextApiRequest (API Routes) และ NextRequest (Middleware)
 */
export function getAuthToken(req: NextApiRequest | NextRequest): string | null {
  // เคส NextRequest (middleware): cookies.get(name)?.value
  const anyReq: any = req as any
  const ck = anyReq?.cookies

  if (ck && typeof ck.get === 'function') {
    const v = ck.get(AUTH_COOKIE_NAME)?.value
    return v || null
  }

  // เคส NextApiRequest (API routes): req.cookies[name]
  if (ck && typeof ck === 'object') {
    const v = ck[AUTH_COOKIE_NAME]
    if (typeof v === 'string') return v
  }

  // สำรอง: parse จาก header Cookie (ป้องกัน edge case)
  const headerCookie =
    typeof anyReq?.headers?.get === 'function'
      ? anyReq.headers.get('cookie')
      : anyReq?.headers?.cookie

  if (typeof headerCookie === 'string' && headerCookie.length > 0) {
    const parsed = parse(headerCookie)
    if (parsed[AUTH_COOKIE_NAME]) return parsed[AUTH_COOKIE_NAME]
  }

  return null
}
