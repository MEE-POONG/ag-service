// /pages/auth/login.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  // ดึง redirect target ถ้ามี ?redirect=/path
  const redirectTo = typeof router.query?.redirect === 'string' ? router.query.redirect : '/'

  const { data: me, isFetching: checking } = useQuery({
    queryKey: qk.auth.me,
    queryFn: async () => {
      const res = await axios.get('/api/auth/me')
      return res.data?.user ?? null
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!router.isReady) return
    if (me) {
      router.replace(typeof redirectTo === 'string' && redirectTo.startsWith('/') ? redirectTo : '/')
    }
  }, [me, router.isReady, redirectTo, router])

  const loginMutation = useMutation({
    mutationFn: async (payload: { username: string; password: string }) => {
      const response = await axios.post('/api/auth/login', payload)
      return response.data
    },
    onSuccess: (data) => {
      // Prime the cache with returned user
      queryClient.setQueryData(qk.auth.me, data?.user ?? null)
      toast.success(data?.message || 'เข้าสู่ระบบสำเร็จ')
      router.replace(typeof redirectTo === 'string' && redirectTo.startsWith('/') ? redirectTo : '/')
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'เกิดข้อผิดพลาดในการเชื่อมต่อ'
      toast.error(msg)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginMutation.mutateAsync({ username, password })
    } catch (err) {
      // Error is handled by onError toast; prevent unhandled rejection overlay
      // No-op
    } finally {
      setLoading(false)
    }
  }

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
              <label htmlFor="username" className="sr-only">ชื่อผู้ใช้</label>
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
              <label htmlFor="password" className="sr-only">รหัสผ่าน</label>
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
