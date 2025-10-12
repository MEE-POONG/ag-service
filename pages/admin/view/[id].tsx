import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { TheLayout } from '@/components/TheLayout'
import axios from '@/lib/axios'
import { ExtendedAdminDB } from '@/data/interface'
import Link from 'next/link'
import { FaEdit, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaBuilding, FaUserTag, FaCalendarAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'

export default function ViewAdminPage() {
  const router = useRouter()
  const { id } = router.query
  
  const { data: admin, isLoading: loading, error } = useQuery({
    queryKey: id && typeof id === 'string' ? qk.admins.detail(id) : ['admins','detail','idle'],
    queryFn: async () => {
      const response = await axios.get(`/api/admin?id=${id}`)
      if (!response.data?.success) throw new Error(response.data?.error || 'ไม่พบข้อมูล Admin')
      return response.data.data as ExtendedAdminDB
    },
    enabled: !!id && typeof id === 'string',
    staleTime: 60 * 1000,
  })

  const formatDate = (date: string | Date) => {
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

  if (loading) {
    return (
      <TheLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">กำลังโหลดข้อมูล...</div>
        </div>
      </TheLayout>
    )
  }

  if (error || !admin) {
    return (
      <TheLayout>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="text-lg text-red-600 mb-4">{(error as any)?.message || 'ไม่พบข้อมูล Admin'}</div>
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
      <div className="max-w-4xl mx-auto pl-1 sm:p-2">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              ข้อมูลผู้ดูแลระบบ
            </h1>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/admin/edit/${admin.id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="mr-2" />
              แก้ไข
            </Link>
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

            {/* ข้อมูลตำแหน่ง */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ตำแหน่งงาน</h3>
              
              {admin.AdminPositionDB?.adminDepartment && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaBuilding className="inline mr-2" />
                    แผนก
                  </label>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-400">
                    {admin.AdminPositionDB.adminDepartment.name}
                  </span>
                </div>
              )}

              {admin.AdminPositionDB && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    <FaUserTag className="inline mr-2" />
                    ตำแหน่ง
                  </label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(Number(admin.AdminPositionDB.priority))}`}>
                    {admin.AdminPositionDB.name}
                  </span>
                  {admin.AdminPositionDB.priority && (
                    <div className="text-xs text-gray-500 mt-1">
                      ลำดับความสำคัญ: {Number(admin.AdminPositionDB.priority)}
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

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/admin/edit/${admin.id}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="mr-2" />
            แก้ไขข้อมูล
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            กลับหน้ารายการ
          </Link>
        </div>
      </div>
    </TheLayout>
  )
}
