import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAuthCookie } from '@/lib/cookieUtils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // Clear the auth cookie using cookie utility
  clearAuthCookie(res)
  return res.status(200).json({ message: 'ออกจากระบบสำเร็จ' })
} 
