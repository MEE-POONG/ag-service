import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { ExtendedAdminDB } from '@/data/interface'

interface UseAuthReturn {
  user: ExtendedAdminDB | null
  userLoading: boolean
  error: string | null
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<ExtendedAdminDB | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await axios.get('/api/auth/me', { withCredentials: true })
        if (!mounted) return
        const u = res.data?.user ?? null
        setUser(u)
        if (!u && router.pathname !== '/auth/login') {
          router.replace(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`)
        }
      } catch (e) {
        if (!mounted) return
        setUser(null)
        setError('การตรวจสอบสิทธิ์ล้มเหลว')
        if (router.pathname !== '/auth/login') {
          router.replace(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`)
        }
      } finally {
        if (mounted) setUserLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [router])

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true })
    } finally {
      // สำหรับ session เก่าที่เคยใช้ localStorage
      try { localStorage.removeItem('auth-token') } catch {}
      setUser(null)
      router.replace('/auth/login')
    }
  }

  return { user, userLoading, error, logout }
}