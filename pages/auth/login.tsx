'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from 'axios'
import axiosAuth from '@/lib/axios'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  // เช็คว่าได้ login อยู่แล้วหรือไม่
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token')

        if (token) {
          // ตรวจสอบว่า token ยังใช้งานได้หรือไม่ - ใช้ axiosAuth ที่มี interceptor
          const response = await axiosAuth.get('/api/auth/me')
          if (response.status === 200 && response.data.user) {
            // ถ้า token ยังใช้งานได้ให้ redirect ไป dashboard
            router.push('/')
            return
          }
        }
      } catch (error) {
        // ถ้า token หมดอายุหรือไม่ valid ให้ลบออก
        localStorage.removeItem('auth-token')
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      })

      // Check for successful login based on actual API response format
      if (response?.status === 200) {
        const { message, user, token } = response.data

        if (user && token) {
          toast.success(message || 'เข้าสู่ระบบสำเร็จ')

          // Store token if needed for API authentication
          localStorage.setItem('auth-token', token)

          // Use window.location for more reliable redirect
          window.location.href = '/'
        } else {
          console.error('Missing user or token in response:', { user, token })
          throw new Error('ข้อมูลการเข้าสู่ระบบไม่สมบูรณ์')
        }
      } else {
        throw new Error(response.data.error || 'การเข้าสู่ระบบล้มเหลว')
      }
    } catch (error) {
      console.error('Login error:', error)

      let errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'

      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage
        console.error('API Error:', error.response.data)
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // แสดง loading ขณะเช็ค authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
            เข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            หรือ{' '}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              สมัครสมาชิกใหม่
            </Link>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                ชื่อผู้ใช้
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field rounded-t-lg text-sm sm:text-base"
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field rounded-b-lg text-sm sm:text-base"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
          <div className="text-center">
            <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-gray-500">
              กลับหน้าหลัก
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 

