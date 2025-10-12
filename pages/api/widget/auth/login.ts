import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface LoginResponse {
  success: boolean
  data?: {
    user: {
      id: string
      name: string
      email: string
      phone?: string
    }
    token: string
  }
  error?: string
}

/**
 * Widget Login API
 * POST /api/widget/auth/login
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  // Enable CORS for external domains
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

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
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    // Find customer by email
    const customer = await prisma.chatCustomerDB.findFirst({
      where: { email }
    })

    if (!customer) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is disabled'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password || '')
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer.id,
        email: customer.email,
        type: 'widget_customer'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    )

    // Update last login
    await prisma.chatCustomerDB.update({
      where: { id: customer.id },
      data: { 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    })

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: customer.id,
          name: customer.name || 'Guest',
          email: customer.email,
          phone: customer.phone
        },
        token
      }
    })
  } catch (error) {
    console.error('Widget login error:', error)
    return res.status(500).json({
      success: false,
      error: 'Login failed'
    })
  }
}
