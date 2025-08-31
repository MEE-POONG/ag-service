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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          setUserLoading(false)
          // ถ้าไม่อยู่ในหน้า login ให้ redirect ไป login
          if (router.pathname !== '/auth/login') {
            router.push('/auth/login')
          }
          return
        }

        const response = await axios.get('/api/auth/me')
        const data = response.data
        
        if (response.status === 200 && data.user) {
          setUser(data.user)
        } else {
          localStorage.removeItem('auth-token')
          setUser(null)
          // ถ้าไม่อยู่ในหน้า login ให้ redirect ไป login
          if (router.pathname !== '/auth/login') {
            router.push('/auth/login')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('auth-token')
        setUser(null)
        setError('การตรวจสอบสิทธิ์ล้มเหลว')
        // ถ้าไม่อยู่ในหน้า login ให้ redirect ไป login
        if (router.pathname !== '/auth/login') {
          router.push('/auth/login')
        }
      } finally {
        setUserLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
      localStorage.removeItem('auth-token')
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still remove token and redirect even if logout API fails
      localStorage.removeItem('auth-token')
      setUser(null)
      router.push('/auth/login')
    }
  }

  return { user, userLoading, error, logout }
} 


