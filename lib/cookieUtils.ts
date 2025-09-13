// /lib/cookieUtils.ts
import type { NextApiResponse, NextApiRequest } from 'next'
import type { NextRequest } from 'next/server'
import { parse, serialize } from 'cookie'

export const AUTH_COOKIE_NAME = 'auth-token'
export const MENUWEB_COOKIE_NAME = 'menuweb-data'
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 วัน
const MENUWEB_MAX_AGE = 60 * 60 * 24 // 1 วัน (refresh ทุกวัน)

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

// ===== MenuWeb Cookie Functions =====

export interface MenuWebData {
  id: string;
  name: string;
  link: string;
  icon?: string;
  description: string;
  showOrder: number;
  children?: MenuWebData[];
}

/**
 * บันทึกข้อมูล menuweb ลง cookie
 */
export function setMenuWebCookie(
  res: NextApiResponse,
  menuwebData: MenuWebData[],
  maxAgeSec: number = MENUWEB_MAX_AGE
) {
  try {
    const jsonData = JSON.stringify(menuwebData);
    res.setHeader(
      'Set-Cookie',
      serialize(MENUWEB_COOKIE_NAME, jsonData, {
        httpOnly: false, // ให้ client-side เข้าถึงได้
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: maxAgeSec,
      })
    );
  } catch (error) {
    console.error('Error setting menuweb cookie:', error);
  }
}

/**
 * ลบข้อมูล menuweb จาก cookie
 */
export function clearMenuWebCookie(res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    serialize(MENUWEB_COOKIE_NAME, '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
}

/**
 * ดึงข้อมูล menuweb จาก cookie (server-side)
 */
export function getMenuWebData(req: NextApiRequest | NextRequest): MenuWebData[] | null {
  try {
    // เคส NextRequest (middleware): cookies.get(name)?.value
    const anyReq: any = req as any;
    const ck = anyReq?.cookies;

    let cookieValue: string | null = null;

    if (ck && typeof ck.get === 'function') {
      cookieValue = ck.get(MENUWEB_COOKIE_NAME)?.value || null;
    }
    // เคส NextApiRequest (API routes): req.cookies[name]
    else if (ck && typeof ck === 'object') {
      const v = ck[MENUWEB_COOKIE_NAME];
      if (typeof v === 'string') cookieValue = v;
    }

    // สำรอง: parse จาก header Cookie
    if (!cookieValue) {
      const headerCookie =
        typeof anyReq?.headers?.get === 'function'
          ? anyReq.headers.get('cookie')
          : anyReq?.headers?.cookie;

      if (typeof headerCookie === 'string' && headerCookie.length > 0) {
        const parsed = parse(headerCookie);
        if (parsed[MENUWEB_COOKIE_NAME]) {
          cookieValue = parsed[MENUWEB_COOKIE_NAME];
        }
      }
    }

    if (cookieValue) {
      const parsedData = JSON.parse(cookieValue) as MenuWebData[];
      return Array.isArray(parsedData) ? parsedData : null;
    }
  } catch (error) {
    console.error('Error parsing menuweb cookie:', error);
  }

  return null;
}

/**
 * ดึงข้อมูล menuweb จาก cookie (client-side)
 */
export function getClientMenuWebData(): MenuWebData[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = parse(document.cookie || '');
    const cookieValue = cookies[MENUWEB_COOKIE_NAME];
    
    if (cookieValue) {
      const parsedData = JSON.parse(cookieValue) as MenuWebData[];
      return Array.isArray(parsedData) ? parsedData : null;
    }
  } catch (error) {
    console.error('Error parsing client menuweb cookie:', error);
  }
  
  return null;
}

/**
 * บันทึกข้อมูล menuweb ลง cookie (client-side)
 */
export function setClientMenuWebCookie(menuwebData: MenuWebData[], maxAgeSec: number = MENUWEB_MAX_AGE) {
  if (typeof window === 'undefined') return;
  
  try {
    const jsonData = JSON.stringify(menuwebData);
    const cookieString = serialize(MENUWEB_COOKIE_NAME, jsonData, {
      path: '/',
      maxAge: maxAgeSec,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    document.cookie = cookieString;
  } catch (error) {
    console.error('Error setting client menuweb cookie:', error);
  }
}
