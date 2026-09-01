import nodemailer from 'nodemailer'

type MailContent = {
  to: string
  subject: string
  text: string
  html: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getMailConfig() {
  const legacyUser = process.env.MAIL_USER?.trim()
  const legacyPass = process.env.MAIL_PASS
  const user = process.env.SMTP_USER?.trim() || legacyUser
  const rawPass = process.env.SMTP_PASSWORD || legacyPass
  const host = process.env.SMTP_HOST?.trim() || (user && rawPass ? 'smtp.gmail.com' : undefined)
  const pass = host?.toLowerCase() === 'smtp.gmail.com'
    ? rawPass?.replace(/\s+/g, '')
    : rawPass
  const port = Number(process.env.SMTP_PORT || 587)
  const from = process.env.EMAIL_FROM?.trim() || user

  if (!host || !Number.isInteger(port) || port <= 0 || !from) {
    throw new Error('Email delivery is not configured. Set SMTP_HOST, SMTP_PORT and EMAIL_FROM.')
  }

  if (Boolean(user) !== Boolean(pass)) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together.')
  }

  return {
    from,
    transport: {
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    },
  }
}

export function assertEmailDeliveryConfigured(): void {
  getMailConfig()
  getAppBaseUrl()
}

export async function verifyEmailDelivery(): Promise<void> {
  const config = getMailConfig()
  const transporter = nodemailer.createTransport(config.transport)
  await transporter.verify()
}

function getAppBaseUrl(): string {
  const configuredUrl = process.env.APP_BASE_URL?.trim() || process.env.NEXTAUTH_URL?.trim()

  if (configuredUrl) {
    const parsed = new URL(configuredUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('APP_BASE_URL must use http or https.')
    }
    return parsed.origin
  }

  if (process.env.NODE_ENV !== 'production') {
    return `http://localhost:${process.env.PORT || '3002'}`
  }

  throw new Error('APP_BASE_URL is required in production.')
}

async function sendMail(content: MailContent): Promise<void> {
  const config = getMailConfig()
  const transporter = nodemailer.createTransport(config.transport)

  await transporter.sendMail({
    from: config.from,
    ...content,
  })
}

function createActionEmail(params: {
  recipientName: string
  heading: string
  description: string
  actionLabel: string
  actionUrl: string
  expiresText: string
}) {
  const name = escapeHtml(params.recipientName || 'ผู้ใช้งาน')
  const url = escapeHtml(params.actionUrl)

  return {
    text: [
      `สวัสดี ${params.recipientName || 'ผู้ใช้งาน'}`,
      '',
      params.description,
      params.actionUrl,
      '',
      params.expiresText,
      'หากคุณไม่ได้เป็นผู้ดำเนินการ โปรดละเว้นอีเมลฉบับนี้',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;line-height:1.6">
        <h1 style="font-size:24px;color:#6d28d9">${escapeHtml(params.heading)}</h1>
        <p>สวัสดี ${name}</p>
        <p>${escapeHtml(params.description)}</p>
        <p style="margin:28px 0">
          <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">
            ${escapeHtml(params.actionLabel)}
          </a>
        </p>
        <p style="font-size:14px;color:#6b7280">${escapeHtml(params.expiresText)}</p>
        <p style="font-size:14px;color:#6b7280">หากคุณไม่ได้เป็นผู้ดำเนินการ โปรดละเว้นอีเมลฉบับนี้</p>
      </div>
    `,
  }
}

export async function sendPasswordResetOtpEmail(
  admin: { email: string; name: string },
  otp: string,
  referenceCode: string
) {
  const name = escapeHtml(admin.name || 'ผู้ใช้งาน')
  const safeOtp = escapeHtml(otp)
  const safeReference = escapeHtml(referenceCode)
  await sendMail({
    to: admin.email,
    subject: `รหัส OTP ตั้งรหัสผ่านใหม่ [${referenceCode}]`,
    text: [
      `สวัสดี ${admin.name || 'ผู้ใช้งาน'}`,
      '',
      'รหัส OTP สำหรับตั้งรหัสผ่านใหม่:',
      otp,
      `เลขอ้างอิง: ${referenceCode}`,
      '',
      'รหัสนี้ใช้ได้ครั้งเดียวและหมดอายุภายใน 10 นาที',
      'หากคุณไม่ได้เป็นผู้ดำเนินการ โปรดละเว้นอีเมลฉบับนี้',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;line-height:1.6">
        <h1 style="font-size:24px;color:#6d28d9">รหัส OTP ตั้งรหัสผ่านใหม่</h1>
        <p>สวัสดี ${name}</p>
        <p>กรอกรหัส OTP ด้านล่างในหน้า AG Service เพื่อตั้งรหัสผ่านใหม่</p>
        <div style="margin:24px 0;padding:20px;border:1px solid #c4b5fd;border-radius:12px;background:#faf5ff;text-align:center">
          <div style="font-size:13px;color:#6b7280">รหัส OTP</div>
          <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#6d28d9">${safeOtp}</div>
          <div style="margin-top:14px;font-size:14px;color:#4b5563">เลขอ้างอิง: <strong>${safeReference}</strong></div>
        </div>
        <p style="font-size:14px;color:#6b7280">รหัสนี้ใช้ได้ครั้งเดียวและหมดอายุภายใน 10 นาที</p>
        <p style="font-size:14px;color:#6b7280">หากคุณไม่ได้เป็นผู้ดำเนินการ โปรดละเว้นอีเมลฉบับนี้</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(admin: { email: string; name: string }, token: string) {
  const url = new URL('/auth/verify-email', getAppBaseUrl())
  url.searchParams.set('token', token)
  const content = createActionEmail({
    recipientName: admin.name,
    heading: 'ยืนยันอีเมลของคุณ',
    description: 'กรุณายืนยันอีเมลนี้ก่อนเข้าใช้งาน AG Service',
    actionLabel: 'ยืนยันอีเมล',
    actionUrl: url.toString(),
    expiresText: 'ลิงก์นี้ใช้ได้ครั้งเดียวและหมดอายุภายใน 24 ชั่วโมง',
  })

  await sendMail({
    to: admin.email,
    subject: 'ยืนยันอีเมลสำหรับ AG Service',
    ...content,
  })
}
