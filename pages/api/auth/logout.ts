// /pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Set-Cookie', cookie.serialize('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',       // ถ้าข้ามโดเมนให้ใช้ 'none' + secure:true
    path: '/',
    maxAge: 0,             // ลบทันที
  }))

  return res.status(200).json({ message: 'ออกจากระบบสำเร็จ' })
}
