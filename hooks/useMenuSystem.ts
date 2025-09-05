// hooks/useMenuSystem.ts

import { useMemo } from 'react'
import axios from '@/lib/axios'
import { MenuWebDB } from '@prisma/client'
import { ExtendedAdminDB } from '@/data/interface'
import { MenuWebDBWithChildren } from '@/data'
import { useQuery } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'


// Option สำหรับสิทธิ์
export interface UseMenuSystemOptions {
  admin?: ExtendedAdminDB
  DEV_ONLY_MENUS?: string[]
  ADMIN_USERS?: string[]
}

interface UseMenuSystemReturn {
  menuItems: MenuWebDBWithChildren[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMenuSystem({
  admin,
  DEV_ONLY_MENUS = [],
  ADMIN_USERS = []
}: UseMenuSystemOptions): UseMenuSystemReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.menus.showOrder,
    queryFn: async () => {
      const response = await axios.get('/api/menu-web/showorder')
      // API returns { success, data }
      const list: MenuWebDB[] = response?.data?.data ?? []
      return list as unknown as MenuWebDBWithChildren[]
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const menuItems = useMemo(() => {
    const items = (data ?? []) as MenuWebDBWithChildren[]
    const filterMenus = (nodes: MenuWebDBWithChildren[]): MenuWebDBWithChildren[] =>
      nodes
        .filter(item => {
          if (DEV_ONLY_MENUS.includes(item.name) && !ADMIN_USERS.includes(admin?.username || '')) {
            return false
          }
          return (item as any).isVisible !== false && ((item as any).canViews ?? true)
        })
        .map(item => ({
          ...item,
          children: filterMenus((item.children || []) as any),
        }))
        .filter(item => item.head || !item.parentId || (item.children && item.children.length > 0))

    return filterMenus(items)
  }, [data, admin?.username, DEV_ONLY_MENUS, ADMIN_USERS])

  return {
    menuItems,
    loading: isLoading,
    error: error ? (error as any).message ?? 'เกิดข้อผิดพลาด' : null,
    refetch,
  }
}

