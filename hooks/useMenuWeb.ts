import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import { useAuth } from '@/hooks/useAuth'

/** 🔄 ประเภทข้อมูลที่ useMenu hook จะ return */
interface UseMenuReturn {
  menuWeb: any | null              // ข้อมูลเมนูเว็บที่ "กรองแล้ว"
  menuLoading: boolean
  error: string | null
  refreshMenu: () => Promise<void>
}

// ---- helper types ----
type MenuNode = {
  id: string
  canViews?: boolean
  children?: MenuNode[]
  subMenus?: MenuNode[]
  items?: MenuNode[]
  [k: string]: any
}

export function useMenuWeb(): UseMenuReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // =========================
  // ฟังก์ชันกรองสิทธิ์ (ย้ายมาที่นี่)
  // =========================
  const filterMenusByPermissions = (menus: any[], currentUser: any): MenuNode[] => {
    // admin/superadmin เห็นทั้งหมด
    const isAdmin = ['admin', 'superadmin'].includes(
      (currentUser?.username || '').toLowerCase()
    )
    if (isAdmin) return Array.isArray(menus) ? menus : []

    const perms: Array<{ menuPageWebId: string; canViews: boolean }> =
      currentUser?.AdminPositionDB?.AdminDefaultPermissionDB ?? []

    if (!Array.isArray(perms) || perms.length === 0 || !Array.isArray(menus)) {
      return []
    }

    const allow = new Set(
      perms.filter(p => p?.canViews).map(p => String(p.menuPageWebId))
    )

    const getChildren = (node: any): MenuNode[] =>
      (node?.children ?? node?.subMenus ?? node?.items ?? []) as MenuNode[]

    const childKeyOf = (node: any): 'children' | 'subMenus' | 'items' | null => {
      if (Array.isArray(node?.children)) return 'children'
      if (Array.isArray(node?.subMenus)) return 'subMenus'
      if (Array.isArray(node?.items)) return 'items'
      return null
    }

    const walk = (list: MenuNode[]): MenuNode[] => {
      return (list ?? []).reduce<MenuNode[]>((acc, node) => {
        const id = String(node?.id ?? '')
        const childKey = childKeyOf(node)
        const rawChildren = getChildren(node)
        const filteredChildren = walk(rawChildren)

        const selfAllowed = allow.has(id)
        const hasAllowedChild = filteredChildren.length > 0

        if (selfAllowed || hasAllowedChild) {
          const next: MenuNode = {
            ...node,
            canViews: !!selfAllowed, // sync ให้ตรงสิทธิจริง
          }
          if (childKey) {
            ; (next as any)[childKey] = filteredChildren
          }
          acc.push(next)
        }

        return acc
      }, [])
    }

    const result = walk(menus)
    return result
  }

  // 🔍 ดึงข้อมูลเมนูเว็บ + "กรองสิทธิ์" ตั้งแต่ชั้น queryFn
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
      // กรองสิทธิ์ที่นี่เลย
      const filtered = filterMenusByPermissions(Array.isArray(rawMenu) ? rawMenu : [], user)
      return filtered
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    // ถ้า user ยังไม่พร้อม อย่าเรียก queryFn
    enabled: !!user,
  })

  // 🔄 refresh: ดึงใหม่ + "กรองสิทธิ์" แล้วค่อย setCache
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.get('/api/auth/me')
      const rawMenu = res.data?.menuWeb ?? null
      return filterMenusByPermissions(Array.isArray(rawMenu) ? rawMenu : [], user)
    },
    onSuccess: (filtered) => {
      queryClient.setQueryData(qk.menus.all, filtered)
    },
  })

  const refreshMenu = async () => {
    try {
      await refreshMutation.mutateAsync()
    } catch (err) {
      console.error('Failed to refresh menu:', err)
    }
  }

  return {
    menuWeb: menuWebData ?? null,
    menuLoading: (isPending || isFetching) && !!user,
    error: error ? (error as any)?.message ?? 'การโหลดเมนูล้มเหลว' : null,
    refreshMenu,
  }
}
