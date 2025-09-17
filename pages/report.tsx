import React from 'react'
import { TheLayout } from '@/components/TheLayout'
import { useAuth } from '@/hooks/useAuth'
import PageHeader from '@/components/PageHeader'

export default function ReportsPage() {
  const { user: authUser, userLoading: loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  return (
    <TheLayout>
      <PageHeader
        title="จัดการ Adjust Bet"
        icon='FaAdjust'
        description="ระบบจัดการการปรับเบทสำหรับลูกค้า"
        gradient={true}
   
      />
      <div className="bg-white shadow-sm rounded-lg p1-1 sm:p-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">รายงาน</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-blue-50 p1-1 sm:p-2 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">รายงานผู้ใช้</h3>
            <p className="text-sm sm:text-base text-blue-700 mb-3 sm:mb-4">ดูสถิติการใช้งานของผู้ใช้ในระบบ</p>
            <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ดูรายงาน
            </button>
          </div>

          <div className="bg-green-50 p1-1 sm:p-2 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">รายงานกิจกรรม</h3>
            <p className="text-sm sm:text-base text-green-700 mb-3 sm:mb-4">ดูประวัติการเข้าสู่ระบบและกิจกรรม</p>
            <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              ดูรายงาน
            </button>
          </div>

          <div className="bg-purple-50 p1-1 sm:p-2 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-2">รายงานสิทธิ์</h3>
            <p className="text-sm sm:text-base text-purple-700 mb-3 sm:mb-4">ดูการใช้งานสิทธิ์ในระบบ</p>
            <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              ดูรายงาน
            </button>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 
