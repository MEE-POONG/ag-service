import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

interface LogoutResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Widget Logout API
 * POST /api/widget/auth/logout
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  // Enable CORS for external domains
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Widget-Token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const token = req.headers['x-widget-token'] as string

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required'
      })
    }

    // Verify token (optional - for logging purposes)
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      // Token is invalid or expired, but we still allow logout
     // console.log('Invalid token during logout:', error)
    }

    // For widget logout, we just return success
    // The client should handle clearing the token from storage
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
   // console.error('Widget logout error:', error)
    return res.status(500).json({
      success: false,
      error: 'Logout failed'
    })
  }
}
