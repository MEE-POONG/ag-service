import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReactIconComponent from '@/components/ReactIconComponent'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      setMessage(response.data.message)
      const referenceCode = response.data.referenceCode
      if (referenceCode) {
        await router.push({
          pathname: '/auth/reset-password',
          query: { reference: referenceCode },
        })
      }
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#A78BFA] to-[#34D399] px-4 py-10">
      <Card className="w-full max-w-md border border-purple-500 bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <ReactIconComponent icon="FaEnvelope" setClass="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold">ลืมรหัสผ่าน</CardTitle>
          <CardDescription>กรอกอีเมลของบัญชีเพื่อรับรหัส OTP ตั้งรหัสผ่านใหม่</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                enterKeyHint="send"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div aria-live="polite" className="min-h-6 text-sm">
              {message ? <p className="text-green-700">{message}</p> : null}
              {error ? <p className="text-red-700">{error}</p> : null}
            </div>
            <div className="mt-6 text-center">
              <Button type="submit" className="w-full rounded-full !bg-[#A78BFA] px-4 !text-white hover:!bg-[#8B5CF6]" disabled={submitting}>
                {submitting ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm font-medium text-purple-700 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
