import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticator } from 'otplib'

type Data =
  | { success: true; valid: boolean }
  | { success: false; error: string }

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    }

    const { secret, token, window: winParam } = req.body || {}
    if (!secret || typeof secret !== 'string') {
      return res.status(400).json({ success: false, error: 'secret is required' })
    }
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'token is required' })
    }

    const normalized = String(secret).replace(/\s+/g, '').toUpperCase()
    const win = Number.isFinite(Number(winParam)) ? Number(winParam) : 1
    const inst = authenticator.create({ window: win })
    const valid = inst.check(token, normalized)
    return res.status(200).json({ success: true, valid })
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Internal Server Error' })
  }
}
