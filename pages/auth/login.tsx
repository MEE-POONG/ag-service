import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { qk } from '@/lib/queryKeys'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ReactIconComponent from '@/components/ReactIconComponent'

interface LoginFormData {
  username: string
  password: string
}

interface AuthUser {
  id: string
  username: string
  role?: string
}

interface LoginResponse {
  user: AuthUser
  message?: string
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p className="mt-4 text-base text-muted-foreground">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
    </div>
  </div>
)

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const redirectTo = typeof router.query?.redirect === 'string' ? router.query.redirect : '/'
  const safeRedirectUrl = (() => {
    if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) return '/'
    if (redirectTo.startsWith('/auth/login')) return '/'
    return redirectTo
  })()

  const { data: user, isLoading: isCheckingAuth } = useQuery({
    queryKey: qk.auth.me,
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        const response = await axios.get('/api/auth/me')
        return response.data?.user || null
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginFormData): Promise<LoginResponse> => {
      const response = await axios.post('/api/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(qk.auth.me, data.user)
      toast.success(data.message || 'เข้าสู่ระบบสำเร็จ')

      router.replace(safeRedirectUrl)
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'

      toast.error(errorMessage)

      if (error?.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
        const email = error.response.data.email
        router.push(`/auth/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`)
      }
    }
  })

  useEffect(() => {
    if (user && router.isReady) {
      router.replace(safeRedirectUrl)
    }
  }, [user, router.isReady, safeRedirectUrl, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }

    setLoading(true)
    try {
      await loginMutation.mutateAsync({ username, password })
    } catch {
      // Error handled by mutation onError
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingAuth) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#A78BFA] to-[#34D399] animate-gradient-x bg-[length:200%_200%]">
      {/* พื้นหลัง สีม่วงขาว to สี ฟ้าขาว */}
      <Card className="w-full max-w-md border border-purple-500 bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ReactIconComponent icon="FaRegUser" setClass="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            เข้าสู่ระบบเพื่อเข้าใช้งานแอปพลิเคชัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-purple-700 hover:underline"
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}รหัสผ่าน
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full !bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6] rounded-full px-4 py-2 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
              <Link
                href="/auth/forgot-password"
                className="block text-center text-sm font-medium text-purple-700 hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </form>
          <div className="mt-6 border-t border-purple-200 pt-5 text-center">
            <p className="mb-3 text-sm text-muted-foreground">ยังไม่มีบัญชี?</p>
            <Link
              href="/auth/register"
              className="inline-flex w-full items-center justify-center rounded-full border border-purple-400 px-4 py-2 font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
