/**
 * VAPID Public Key API
 * Returns the public key for Web Push subscription
 */

import type { NextApiRequest, NextApiResponse } from 'next'

interface VapidKeyResponse {
  success?: boolean
  data?: {
    publicKey: string
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VapidKeyResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!publicKey) {
      return res.status(500).json({
        success: false,
        error: 'VAPID public key not configured'
      })
    }

    return res.status(200).json({
      success: true,
      data: { publicKey }
    })
  } catch (error) {
    console.error('Get VAPID key error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get VAPID key'
    })
  }
}

