// hooks/useMenuSystem.ts

import { useState, useEffect } from 'react'
import axios from 'axios'
import { MenuWebDB } from '@prisma/client'
import { ExtendedAdminDB } from '@/data/interface'
import { MenuWebDBWithChildren } from '@/data'


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
  refreshMenus: () => Promise<void>
}

export function useMenuSystem({
  admin,
  DEV_ONLY_MENUS = [],
  ADMIN_USERS = []
}: UseMenuSystemOptions): UseMenuSystemReturn {
  const [menuItems, setMenuItems] = useState<MenuWebDBWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ ฟิลเตอร์ตามสิทธิ์
  const filterMenus = (items: MenuWebDBWithChildren[]): MenuWebDBWithChildren[] => {
    return items
      .filter(item => {
        if (DEV_ONLY_MENUS.includes(item.name) && !ADMIN_USERS.includes(admin?.username || '')) {
          return false
        }
        return item.isVisible && item.canViews
      })
      .map(item => ({
        ...item,
        children: filterMenus(item.children || [])
      }))
      .filter(item => item.head || !item.parentId || (item.children && item.children.length > 0))
  }

  const fetchMenus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/menu-web/showorder')
      const result = response.data

      if (result.success && result.data?.menus) {
        const flat: MenuWebDB[] = result.data.menus
        setMenuItems(result.data.menus);
        // setMenuItems(filtered)
      } else {
        setError('ไม่พบข้อมูลเมนู')
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [admin])

  return {
    menuItems,
    loading,
    error,
    refreshMenus: fetchMenus
  }
}


