import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReactIconComponent from '@/components/ReactIconComponent'

export default function VerifyEmailPage() {
  const router = useRouter()
  const token = typeof router.query.token === 'string' ? router.query.token : ''
  const queryEmail = typeof router.query.email === 'string' ? router.query.email : ''
  const [email, setEmail] = useState(queryEmail)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleVerify() {
    if (!token) return
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post('/api/auth/verify-email', { token })
      setMessage(response.data.message)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || 'ไม่สามารถยืนยันอีเมลได้')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post('/api/auth/resend-verification', { email })
      setMessage(response.data.message)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || 'ไม่สามารถส่งอีเมลยืนยันได้')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#A78BFA] to-[#34D399] px-4 py-10">
      <Card className="w-full max-w-md border border-purple-500 bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <ReactIconComponent icon="FaRegEnvelopeOpen" setClass="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold">ยืนยันอีเมล</CardTitle>
          <CardDescription>
            {token ? 'กดยืนยันเพื่อเปิดใช้งานอีเมลของบัญชีนี้' : 'กรอกอีเมลเพื่อขอลิงก์ยืนยันใหม่'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <Button type="button" onClick={handleVerify} className="w-full rounded-full !bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6]" disabled={submitting || Boolean(message)}>
              {submitting ? 'กำลังยืนยัน...' : 'ยืนยันอีเมล'}
            </Button>
          ) : (
            <form onSubmit={handleResend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  enterKeyHint="send"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-full !bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6]" disabled={submitting}>
                {submitting ? 'กำลังส่ง...' : 'ส่งอีเมลยืนยันอีกครั้ง'}
              </Button>
            </form>
          )}

          <div aria-live="polite" className="mt-4 min-h-6 text-sm text-center">
            {message ? <p className="text-green-700">{message}</p> : null}
            {error ? <p className="text-red-700">{error}</p> : null}
          </div>

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm font-medium text-purple-700 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
