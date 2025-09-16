import React from 'react'
import { TheLayout } from '@/components/TheLayout'
import Link from 'next/link'
import { FaEdit, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaCalendarAlt, FaToggleOn, FaToggleOff, FaShieldAlt, FaKey, FaCog, FaInfoCircle } from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'
import AdminModalNewPassword from '@/container/admin/ModalNewPassword'
import AdminModalEdit from '@/container/admin/ModalEdit'

export default function ViewAdminPage() {
  const { user, userLoading } = useAuth()
  const admin = user;
  console.log('16 admin : ', admin);

  const formatDate = (date: string | Date) => {
    if (!date) return 'ไม่ระบุ'
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaToggleOn className="mr-1" />
        เปิดใช้งาน
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaToggleOff className="mr-1" />
        ปิดใช้งาน
      </span>
    )
  }

  const getPriorityColor = (priority?: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border border-red-400'
      case 2:
        return 'bg-orange-100 text-orange-800 border border-orange-400'
      case 3:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-400'
      default:
        return 'bg-green-100 text-green-800 border border-green-400'
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-400'
      case 'superadmin':
        return 'bg-red-100 text-red-800 border border-red-400'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-400'
    }
  }

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'ผู้ดูแลระบบ'
      case 'superadmin':
        return 'ผู้ดูแลระบบสูงสุด'
      default:
        return 'ผู้ใช้'
    }
  }

  if (userLoading) {
    return (
      <TheLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">กำลังโหลดข้อมูล...</div>
        </div>
      </TheLayout>
    )
  }

  if (!admin) {
    return (
      <TheLayout>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="text-lg text-red-600 mb-4">ไม่พบข้อมูลผู้ใช้</div>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            กลับหน้ารายการ
          </Link>
        </div>
      </TheLayout>
    )
  }

  return (
    <TheLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link
              href="/admin"
              className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 mr-4"
            >
              <FaArrowLeft className="mr-2" />
              กลับ
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                ข้อมูลผู้ดูแลระบบ
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(admin.role)}`}>
                  <FaShieldAlt className="mr-1" />
                  {getRoleDisplayName(admin.role)}
                </span>
                {getStatusBadge(admin.isActive)}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <AdminModalNewPassword data={admin} />
            <AdminModalEdit data={admin} />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ข้อมูลส่วนตัว */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลส่วนตัว</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaUser className="inline mr-2" />
                    ชื่อผู้ใช้
                  </label>
                  <p className="text-lg font-medium text-gray-900">{admin.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaUser className="inline mr-2" />
                    ชื่อ-นามสกุล
                  </label>
                  <p className="text-lg font-medium text-gray-900">{admin.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaEnvelope className="inline mr-2" />
                    อีเมล
                  </label>
                  <p className="text-lg text-gray-900">{admin.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaPhone className="inline mr-2" />
                    เบอร์โทร
                  </label>
                  <p className="text-lg text-gray-900">{admin.tel || 'ไม่ระบุ'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ข้อมูลตำแหน่งและสถานะ */}
          <div className="space-y-6">
            {/* สถานะ */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">สถานะ</h3>
              <div className="flex justify-center">
                {getStatusBadge(admin.isActive)}
              </div>
            </div>

            {/* ข้อมูล Web Base */}
            {admin.webBase && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูล Web Base</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      <FaBuilding className="inline mr-2" />
                      ชื่อ Web Base
                    </label>
                    <p className="text-lg font-medium text-gray-900">{admin.webBase.name}</p>
                  </div>
                  {(admin.webBase as any)?._count && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">แอดมิน:</span>
                        <span className="ml-2 font-medium">{(admin.webBase as any)._count.AdminDB}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">AG User:</span>
                        <span className="ml-2 font-medium">{(admin.webBase as any)._count.AGUserDB}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ข้อมูลตำแหน่ง */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ตำแหน่งงาน</h3>

              {admin.adminPosition?.adminDepartment && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaBuilding className="inline mr-2" />
                    แผนก
                  </label>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-400">
                    {admin.adminPosition.adminDepartment.name}
                  </span>
                </div>
              )}

              {admin.adminPosition && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaUserTag className="inline mr-2" />
                    ตำแหน่ง
                  </label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(Number(admin.adminPosition.priority))}`}>
                    {admin.adminPosition.name}
                  </span>
                  {admin.adminPosition.priority && (
                    <div className="text-xs text-gray-500 mt-1">
                      ลำดับความสำคัญ: {Number(admin.adminPosition.priority)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ข้อมูลระบบ */}
        <div className="mt-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลระบบ</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">
                  <FaCalendarAlt className="inline mr-2" />
                  วันที่สร้าง
                </label>
                <p className="text-gray-900">{formatDate(admin.createdAt)}</p>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">
                  <FaCalendarAlt className="inline mr-2" />
                  แก้ไขล่าสุด
                </label>
                <p className="text-gray-900">{formatDate(admin.updatedAt)}</p>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">สร้างโดย</label>
                <p className="text-gray-900">{admin.createdBy || 'ไม่ระบุ'}</p>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">แก้ไขโดย</label>
                <p className="text-gray-900">{admin.updatedBy || 'ไม่ระบุ'}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-gray-500 mb-1">ID ในระบบ</label>
              <p className="text-gray-900 font-mono text-sm">{admin.id}</p>
            </div>
          </div>
        </div>

        {/* สิทธิ์การเข้าถึง */}
        {admin.permissions && admin.permissions.length > 0 && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <FaKey className="inline mr-2" />
                สิทธิ์การเข้าถึง
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {admin.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    <FaShieldAlt className="mr-2 text-xs" />
                    {permission}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <FaInfoCircle className="inline mr-1" />
                รวม {admin.permissions.length} สิทธิ์การเข้าถึง
              </div>
            </div>
          </div>
        )}

        {/* รายละเอียดสิทธิ์ตามตำแหน่ง */}
        {admin.adminPosition?.AdminDefaultPermissionDB && admin.adminPosition.AdminDefaultPermissionDB.length > 0 && (
          <div className="mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <FaCog className="inline mr-2" />
                รายละเอียดสิทธิ์ตามตำแหน่ง
              </h3>
              <div className="space-y-4">
                {admin.adminPosition.AdminDefaultPermissionDB.filter((permission: any) => permission.menuPage).map((permission: any, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{permission.menuPage?.name}</h4>
                      <span className="text-xs text-gray-500">{permission.menuPage?.description}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div className={`flex items-center px-2 py-1 rounded ${permission.canViews ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="mr-1">{permission.canViews ? '✓' : '✗'}</span>
                        ดู
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded ${permission.canCreate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="mr-1">{permission.canCreate ? '✓' : '✗'}</span>
                        สร้าง
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded ${permission.canUpdate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="mr-1">{permission.canUpdate ? '✓' : '✗'}</span>
                        แก้ไข
                      </div>
                      <div className={`flex items-center px-2 py-1 rounded ${permission.canDelete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="mr-1">{permission.canDelete ? '✓' : '✗'}</span>
                        ลบ
                      </div>
                    </div>
                    {permission.menuPage.manager && permission.menuPage.manager.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium">Manager Routes:</span> {permission.menuPage.manager.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
      </div>
    </TheLayout>
  )
}
