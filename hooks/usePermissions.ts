import { useAuth } from './useAuth'
import { useMemo } from 'react'

export interface PermissionCheck {
  canView: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canAdvance: boolean
}

export function usePermissions() {
  const { user, userLoading } = useAuth()

  // สร้าง map ของสิทธิ์จาก user data
  const permissionsMap = useMemo(() => {
    const map = new Map<string, any>()
    
    if (user?.adminPosition?.AdminDefaultPermissionDB) {
      user.adminPosition.AdminDefaultPermissionDB.forEach((permission: any) => {
        map.set(permission.menuPage.name, permission)
      })
    }
    
    return map
  }, [user])

  // ฟังก์ชันตรวจสอบสิทธิ์สำหรับเมนูเฉพาะ
  const checkPermission = (menuName: string): PermissionCheck => {
    // Superadmin has all permissions
    if (isSuperAdmin) {
      return {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canAdvance: true
      }
    }

    const permission = permissionsMap.get(menuName)
    
    // ถ้าไม่มีข้อมูลสิทธิ์ ให้ตรวจจาก basic permissions
    if (!permission) {
      const hasBasicPermission = user?.permissions?.includes(menuName) || false
      return {
        canView: hasBasicPermission,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canAdvance: false
      }
    }

    return {
      canView: permission.canViews || false,
      canCreate: permission.canCreate || false,
      canUpdate: permission.canUpdate || false,
      canDelete: permission.canDelete || false,
      canAdvance: permission.canAdvance || false
    }
  }

  // ฟังก์ชันตรวจสอบว่ามีสิทธิ์เข้าถึงเมนูหรือไม่
  const hasMenuAccess = (menuName: string): boolean => {
    const permission = checkPermission(menuName)
    return permission.canView
  }

  // ฟังก์ชันตรวจสอบสิทธิ์หลายเมนูพร้อมกัน
  const checkMultiplePermissions = (menuNames: string[]): Record<string, PermissionCheck> => {
    const result: Record<string, PermissionCheck> = {}
    
    menuNames.forEach(menuName => {
      result[menuName] = checkPermission(menuName)
    })
    
    return result
  }

  // ตรวจสอบว่าเป็น super admin หรือไม่ (มีสิทธิ์ทุกอย่าง)
  const isSuperAdmin = useMemo(() => {
    // Wait for user data to load before checking
    if (userLoading || !user) {
      return false
    }
    
    // Check if user is the superadmin username or has superadmin role
    // console.log(84,`admin check user : user?.username: ${user?.username} : `,user?.username === 'superadmin' || user?.role === 'superadmin' || user?.isSuperAdmin || false);
    
    return user?.username === 'superadmin' || user?.role === 'superadmin' || user?.isSuperAdmin || false
  }, [user, userLoading])

  return {
    user,
    userLoading,
    checkPermission,
    hasMenuAccess,
    checkMultiplePermissions,
    isSuperAdmin,
    allPermissions: permissionsMap
  }
}
