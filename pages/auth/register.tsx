import { FormEvent, useState } from 'react'
import Link from 'next/link'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReactIconComponent from '@/components/ReactIconComponent'

interface RegistrationForm {
  username: string
  email: string
  name: string
  tel: string
  password: string
}

const initialForm: RegistrationForm = {
  username: '',
  email: '',
  name: '',
  tel: '',
  password: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: keyof RegistrationForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post('/api/auth/register', form)
      setMessage(response.data.message)
      setForm(initialForm)
      setShowPassword(false)
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#A78BFA] to-[#34D399] px-4 py-10">
      <Card className="w-full max-w-lg border border-purple-500 bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <ReactIconComponent icon="FaUserPlus" setClass="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-2xl font-bold">สมัครสมาชิก</CardTitle>
          <CardDescription>
            ยืนยันอีเมลก่อน จากนั้นบัญชีจะรอผู้ดูแลระบบกำหนดสิทธิ์และอนุมัติ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="space-y-5 text-center" role="status" aria-live="polite">
              <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800">
                {message}
              </div>
              <p className="text-sm text-muted-foreground">
                หากไม่พบอีเมล กรุณาตรวจสอบโฟลเดอร์สแปมหรือขอส่งอีเมลยืนยันใหม่
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/verify-email"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[#A78BFA] px-4 py-2 font-medium text-white transition-colors hover:bg-[#8B5CF6]"
                >
                  ขอส่งอีเมลยืนยันใหม่
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="ชื่อผู้สมัคร"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    disabled={submitting}
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tel">เบอร์โทร <span className="font-normal text-muted-foreground">(ไม่บังคับ)</span></Label>
                  <Input
                    id="tel"
                    name="tel"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="08x-xxx-xxxx"
                    value={form.tel}
                    onChange={(event) => updateField('tel', event.target.value)}
                    disabled={submitting}
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  pattern="[A-Za-z0-9._-]{3,32}"
                  title="ใช้ตัวอักษรอังกฤษ ตัวเลข จุด ขีดกลาง หรือขีดล่าง จำนวน 3-32 ตัว"
                  placeholder="username"
                  value={form.username}
                  onChange={(event) => updateField('username', event.target.value)}
                  disabled={submitting}
                  minLength={3}
                  maxLength={32}
                  required
                />
                <p className="text-xs text-muted-foreground">ใช้ตัวอักษรอังกฤษ ตัวเลข จุด ขีดกลาง หรือขีดล่าง จำนวน 3-32 ตัว</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    enterKeyHint="send"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    disabled={submitting}
                    minLength={8}
                    required
                    className="pr-24"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 text-sm font-medium text-purple-700 hover:underline disabled:opacity-50"
                    aria-pressed={showPassword}
                    disabled={submitting}
                  >
                    {showPassword ? 'ซ่อน' : 'แสดง'}รหัสผ่าน
                  </button>
                </div>
              </div>

              <div aria-live="polite" className="min-h-6 text-sm">
                {error ? <p className="text-red-700">{error}</p> : null}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full !bg-[#A78BFA] !text-white hover:!bg-[#8B5CF6]"
                disabled={submitting}
              >
                {submitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิกและส่งอีเมลยืนยัน'}
              </Button>
            </form>
          )}

          {!message ? (
            <div className="mt-6 text-center">
              <span className="text-sm text-muted-foreground">มีบัญชีแล้ว? </span>
              <Link href="/auth/login" className="text-sm font-medium text-purple-700 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
