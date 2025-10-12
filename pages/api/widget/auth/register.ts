import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface RegisterResponse {
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
 * Widget Register API
 * POST /api/widget/auth/register
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
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
    const { name, email, phone, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Check if email already exists
    const existingCustomer = await prisma.chatCustomerDB.findFirst({
      where: { email }
    })

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique customer ID
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create customer
    const customer = await prisma.chatCustomerDB.create({
      data: {
        customerId,
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        isActive: true,
        source: 'widget_registration',
        lastLoginAt: new Date()
      }
    })

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

    return res.status(201).json({
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
    console.error('Widget register error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}
