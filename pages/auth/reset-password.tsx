import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReactIconComponent from '@/components/ReactIconComponent'
import { MIN_PASSWORD_LENGTH } from '@/lib/passwordPolicy'

export default function ResetPasswordPage() {
  const router = useRouter()
  const queryReference = typeof router.query.reference === 'string' ? router.query.reference : ''
  const referenceCode = queryReference.trim().toUpperCase()
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!referenceCode || otp.length !== 6) {
      setError('กรุณากรอกเลขอ้างอิงและรหัส OTP 6 หลักให้ครบ')
      return
    }

    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post('/api/auth/reset-password', {
        referenceCode,
        otp,
        password,
      })
      setMessage(response.data.message)
      setOtp('')
      setPassword('')
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#A78BFA] to-[#34D399] px-4 py-10">
      <Card className="w-full max-w-md border border-purple-500 bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <ReactIconComponent icon="FaKey" setClass="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold">ตั้งรหัสผ่านใหม่</CardTitle>
          <CardDescription>กรอก OTP จากอีเมล แล้วตั้งรหัสผ่านใหม่อย่างน้อย {MIN_PASSWORD_LENGTH} ตัวอักษร</CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="space-y-5 text-center" aria-live="polite">
              <p className="text-green-700">{message}</p>
              <Link
                href="/auth/login"
                className="block w-full rounded-full bg-[#A78BFA] px-4 py-2 text-center font-medium text-white hover:bg-[#8B5CF6]"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <p id="reference-code-label" className="text-sm font-medium">เลขอ้างอิง</p>
                <div
                  aria-labelledby="reference-code-label"
                  aria-live="polite"
                  className="w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 font-mono font-semibold tracking-wide text-purple-900"
                >
                  {referenceCode || (router.isReady ? 'ไม่พบเลขอ้างอิง' : 'กำลังโหลด...')}
                </div>
                <input type="hidden" name="reference-code" value={referenceCode} />
                <p className="text-xs text-muted-foreground">เลขนี้ต้องตรงกับเลขอ้างอิงที่แนบในอีเมล</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="one-time-code">รหัส OTP</Label>
                <Input
                  id="one-time-code"
                  name="one-time-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  enterKeyHint="next"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={submitting}
                  aria-describedby="otp-hint"
                  className="text-center font-mono text-xl font-bold tracking-[0.35em]"
                  required
                />
                <p id="otp-hint" className="text-xs text-muted-foreground">กรอกรหัสตัวเลข 6 หลัก รหัสหมดอายุภายใน 10 นาที</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">รหัสผ่านใหม่</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    enterKeyHint="done"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={submitting}
                    className="pr-24"
                    required
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

              <div aria-live="polite" className="min-h-6 text-sm">
                {error ? <p className="text-red-700">{error}</p> : null}
              </div>

              <Button type="submit" className="w-full rounded-full !bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6]" disabled={submitting || !referenceCode}>
                {submitting ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-purple-700 hover:underline">
              ขอรหัส OTP ใหม่
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
