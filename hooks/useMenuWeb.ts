// /hooks/useMenuWeb.ts
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import { useAuth } from '@/hooks/useAuth'

interface UseMenuReturn {
  menuWeb: any | null
  menuLoading: boolean
  error: string | null
  refreshMenu: () => Promise<void>
}

export function useMenuWeb(): UseMenuReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // =========================
  // 🧩 ฟังก์ชันกรองสิทธิ์ (ปิดการกรองชั่วคราว)
  // =========================
  const filterMenusByPermissions = (menus: any[], currentUser: any) => {
    console.group('🧠 filterMenusByPermissions (TEMP BYPASS MODE)')
    console.log('📦 menus:', menus)
    console.log('👤 currentUser:', currentUser)
    console.log('⚠️ Permission filtering is temporarily DISABLED — all menus will be visible.')
    console.groupEnd()

    // ✅ คืนค่าทุกเมนูโดยไม่กรอง
    return Array.isArray(menus) ? menus : []
  }

  // =========================
  // 🔍 ดึงข้อมูลเมนู + กรองสิทธิ์
  // =========================
  const {
    data: menuWebData,
    isFetching,
    isPending,
    error,
  } = useQuery({
    queryKey: qk.menus.all,
    queryFn: async () => {
      const res = await axios.get('/api/auth/me')
      const rawMenu = res.data?.menuWeb ?? null
      const currentUser = res.data?.user ?? null

      console.group('🔍 useMenuWeb → API Response')
      console.log('👤 currentUser:', currentUser)
      console.log('📁 rawMenu:', rawMenu)
      console.groupEnd()

      if (!currentUser || !rawMenu) {
        console.warn('⚠️ Missing user or menu data.')
        return []
      }

      // 🧩 ตอนนี้ไม่กรองสิทธิ์ (คืนเมนูทั้งหมด)
      const filtered = filterMenusByPermissions(
        Array.isArray(rawMenu) ? rawMenu : [],
        currentUser
      )

      console.log('✅ Filtered (bypass mode):', filtered)
      return filtered
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // =========================
  // 🔁 Refresh Menu Data
  // =========================
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get('/api/auth/me')
      const rawMenu = res.data?.menuWeb ?? null
      const currentUser = res.data?.user ?? null

      if (!currentUser || !rawMenu) return []

      // 🧩 คืนเมนูทั้งหมด (ไม่กรอง)
      return filterMenusByPermissions(
        Array.isArray(rawMenu) ? rawMenu : [],
        currentUser
      )
    },
    onSuccess: (filtered) => {
      queryClient.setQueryData(qk.menus.all, filtered)
      console.log('♻️ Menu cache updated (bypass mode).')
    },
  })

  const refreshMenu = async () => {
    try {
      await refreshMutation.mutateAsync()
    } catch (err) {
      console.error('🚫 Failed to refresh menu:', err)
    }
  }

  useEffect(() => {
    console.log('📊 menuWebData:', menuWebData)
    console.log('👤 user from useAuth:', user)
  }, [menuWebData, user])

  return {
    menuWeb: menuWebData ?? null,
    menuLoading: isPending || isFetching,
    error: error ? (error as any)?.message ?? 'การโหลดเมนูล้มเหลว' : null,
    refreshMenu,
  }
}
