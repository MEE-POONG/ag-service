// /pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken, sanitizeAdminForClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAuthToken } from '@/lib/cookieUtils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getAuthToken(req) // ✅ ใช้ helper จาก cookieUtils.ts
  if (!token) return res.status(200).json({ user: null })

  const payload = verifyToken(token)
  if (!payload) return res.status(200).json({ user: null })

  // เพื่อความถูกต้อง ดึงข้อมูลสดจาก DB
  const user = await prisma.adminDB.findUnique({
    where: { id: payload.sub },
    include: {
      adminPosition: {
        include: {
          adminDepartment: true,
          AdminDefaultPermissionDB: { include: { menuPage: true } },
        },
      },
      webBase: {
        include: {}
      },
    },
  })

  if (!user || user.isActive === false) {
    return res.status(200).json({ user: null })
  }

  const merged = {
    ...user,
    role: payload.role,
    permissions: (user.adminPosition?.AdminDefaultPermissionDB ?? [])
      .map((p: any) => p?.menuPage?.name)
      .filter(Boolean),
    tokenVersion: payload.tokenVersion ?? 0,
  }

  return res.status(200).json({ user: sanitizeAdminForClient(merged) })
}
