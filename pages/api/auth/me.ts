import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // รองรับทั้ง cookie และ Authorization header
  let token = req.cookies['auth-token']
  
  // ถ้าไม่มี token ใน cookie ให้เช็คจาก Authorization header
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // ตัด "Bearer " ออก
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'ไม่พบ token การเข้าสู่ระบบ' })
  }

  const user = verifyToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' })
  }

  return res.status(200).json({ user, message: 'ตรวจสอบสถานะการเข้าสู่ระบบสำเร็จ' })
} 
