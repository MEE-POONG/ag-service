import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { ExtendedAdminDB } from '@/data/interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'

interface UseAuthReturn {
  user: ExtendedAdminDB | null
  userLoading: boolean
  error: string | null
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: meData,
    isFetching,
    isPending,
    error,
  } = useQuery({
    queryKey: qk.auth.me,
    queryFn: async () => {
      const res = await axios.get('/api/auth/me')
      return res.data?.user ?? null
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // Redirect to login when unauthenticated (client-side safeguard)
  useEffect(() => {
    if (!router.isReady) return
    if (router.pathname === '/auth/login') return
    if (meData === null) {
      router.push('/auth/login')
    }
  }, [router.isReady, router.pathname, meData, router])

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout')
    },
    onSuccess: () => {
      // Clear any legacy tokens
      try { localStorage.removeItem('auth-token') } catch {}
      // Clear cached user
      queryClient.setQueryData(qk.auth.me, null)
    },
  })

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
      router.push('/auth/login')
    } catch (err) {
      // Even on failure, ensure redirect and cache clear
      queryClient.setQueryData(qk.auth.me, null)
      try { localStorage.removeItem('auth-token') } catch {}
      router.push('/auth/login')
    }
  }

  return {
    user: meData ?? null,
    userLoading: isPending || isFetching,
    error: error ? (error as any)?.message ?? 'การตรวจสอบสิทธิ์ล้มเหลว' : null,
    logout,
  }
}
