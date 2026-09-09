import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { AxiosError } from 'axios'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReactIconComponent from '@/components/ReactIconComponent'
import { PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS } from '@/lib/accountRecoveryPolicy'

const COOLDOWN_STORAGE_KEY = 'ag-password-reset-cooldown-until'

type ForgotPasswordError = {
  error?: string
  retryAfterSeconds?: number
}

function getRemainingSeconds(deadline: number): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [rateLimited, setRateLimited] = useState(false)
  const requestInFlight = useRef(false)

  useEffect(() => {
    const storedDeadline = Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY))
    if (Number.isFinite(storedDeadline) && storedDeadline > Date.now()) {
      setCooldownUntil(storedDeadline)
      setCooldownSeconds(getRemainingSeconds(storedDeadline))
    } else {
      window.localStorage.removeItem(COOLDOWN_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!cooldownUntil) return

    const updateCountdown = () => {
      const remaining = getRemainingSeconds(cooldownUntil)
      setCooldownSeconds(remaining)
      if (remaining === 0) {
        setCooldownUntil(0)
        setRateLimited(false)
        window.localStorage.removeItem(COOLDOWN_STORAGE_KEY)
      }
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 250)
    return () => window.clearInterval(timer)
  }, [cooldownUntil])

  function startCooldown(seconds: number) {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0
      ? Math.ceil(seconds)
      : PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS
    const deadline = Date.now() + safeSeconds * 1000
    window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(deadline))
    setCooldownUntil(deadline)
    setCooldownSeconds(safeSeconds)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (requestInFlight.current) return
    if (cooldownSeconds > 0) {
      setError(`ส่งรหัส OTP ใหม่ได้ใน ${formatCountdown(cooldownSeconds)} นาที`)
      return
    }

    requestInFlight.current = true
    setSubmitting(true)
    setMessage('')
    setError('')
    setRateLimited(false)

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      setMessage(response.data.message)
      startCooldown(Number(response.data.retryAfterSeconds))
      const referenceCode = response.data.referenceCode
      if (referenceCode) {
        await router.push({
          pathname: '/auth/reset-password',
          query: { reference: referenceCode },
        })
      }
    } catch (requestError) {
      const axiosError = requestError as AxiosError<ForgotPasswordError>
      const responseRetryAfter = Number(axiosError.response?.data?.retryAfterSeconds)
      const headerRetryAfter = Number(axiosError.response?.headers?.['retry-after'])
      const retryAfter = Number.isFinite(responseRetryAfter) && responseRetryAfter > 0
        ? responseRetryAfter
        : headerRetryAfter

      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        startCooldown(retryAfter)
        setRateLimited(true)
        setError('')
      } else {
        setError(axiosError.response?.data?.error || 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง')
      }
    } finally {
      requestInFlight.current = false
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
                aria-describedby="forgot-password-status"
                disabled={submitting}
                required
              />
            </div>

            <div id="forgot-password-status" aria-live="polite" aria-atomic="true" className="min-h-6 text-sm">
              {message ? <p className="text-green-700">{message}</p> : null}
              {error ? <p className="text-red-700">{error}</p> : null}
              {!message && !error && cooldownSeconds > 0 ? (
                <p className={rateLimited ? 'text-red-700' : 'text-amber-700'}>
                  {rateLimited ? 'ส่งคำขอถี่เกินไป — ' : ''}
                  ส่งรหัส OTP ใหม่ได้ใน {formatCountdown(cooldownSeconds)} นาที
                </p>
              ) : null}
            </div>
            <div className="mt-6 text-center">
              <Button type="submit" className="w-full rounded-full !bg-[#A78BFA] px-4 !text-white hover:!bg-[#8B5CF6]" disabled={submitting || cooldownSeconds > 0}>
                {submitting
                  ? 'กำลังส่ง...'
                  : cooldownSeconds > 0
                    ? `ส่งใหม่ได้ใน ${formatCountdown(cooldownSeconds)}`
                    : 'ส่งรหัส OTP'}
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
