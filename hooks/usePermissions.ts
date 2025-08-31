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
  const { user } = useAuth()
  
  // ตรวจสอบว่าเป็น superadmin หรือไม่
  const isSuperAdminUser = useMemo(
    () => user?.username === 'superadmin',
    [user?.username]
  )

  const rootAllTrue: PermissionCheck = {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canAdvance: true,
  }

  const permissionsMap = useMemo(() => {
    const map = new Map<string, any>()
    if (user?.adminPosition?.AdminDefaultPermissionDB) {
      user.adminPosition.AdminDefaultPermissionDB.forEach((permission: any) => {
        map.set(permission.menuPage.name, permission)
      })
    }
    return map
  }, [user])

  const checkPermission = (menuName: string): PermissionCheck => {
    // ถ้าเป็น superadmin ให้สิทธิ์ทั้งหมด
    if (isSuperAdminUser) return rootAllTrue

    const permission = permissionsMap.get(menuName)
    if (!permission) {
      const hasBasicPermission = user?.permissions?.includes(menuName) || false
      return {
        canView: hasBasicPermission,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canAdvance: false,
      }
    }
    return {
      canView: permission.canViews || false,
      canCreate: permission.canCreate || false,
      canUpdate: permission.canUpdate || false,
      canDelete: permission.canDelete || false,
      canAdvance: permission.canAdvance || false,
    }
  }

  const hasMenuAccess = (menuName: string): boolean => {
    // superadmin ผ่านเสมอ
    if (isSuperAdminUser) return true
    return checkPermission(menuName).canView
  }

  const isSuperAdmin = useMemo(() => {
    // รวม superadmin ด้วย
    if (isSuperAdminUser) return true
    const adminPermission = permissionsMap.get('ระบบผู้ดูแล')
    return adminPermission?.canAdvance || false
  }, [isSuperAdminUser, permissionsMap])

  return {
    user,
    checkPermission,
    hasMenuAccess,
    checkMultiplePermissions: (menuNames: string[]) =>
      Object.fromEntries(menuNames.map((m) => [m, checkPermission(m)])),
    isSuperAdmin,
    allPermissions: permissionsMap,
  }
}
