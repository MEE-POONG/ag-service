import React, { useEffect } from 'react'
import Link from 'next/link'
import { TheLayout } from '@/components/TheLayout'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import ReactIconComponent from '@/components/ReactIconComponent'
import PageHeader from '@/components/PageHeader'

export default function DashboardPage() {
  const { user, userLoading, logout } = useAuth()

  // ✅ ต้องอยู่ก่อนเงื่อนไข return ใดๆ
  // useEffect(() => {
  //   console.log('user in dashboard')
  // }, [])

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
          <p className="mt-4 text-gray-700">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // หรือ redirect ไปหน้า login ก็ได้
  }


  return (
    <TheLayout >
      {/* Themed Header */}
      <PageHeader
        title="แดชบอร์ด"
        icon='FaHome'
        description={`ยินดีต้อนรับ, ${user.name || user.username} (${user.role})`}
        gradient={true}
        actions={
          <Button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 text-sm font-medium  text-red-500 hover:bg-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm rounded-lg  border-1 border-red-500"
          >
            ออกจากระบบ
          </Button>
        }
      />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
          <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">จัดการผู้ใช้</h3>
          <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
            จัดการข้อมูลผู้ใช้ ระบบสิทธิ์ และการเข้าถึง
          </p>
          <Link href="/admin/users" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
            จัดการผู้ใช้
          </Link>
        </div>

        {user.role === 'admin' && (
          <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
            <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">ระบบ Admin</h3>
            <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
              จัดการผู้ดูแลระบบ ตำแหน่ง และแผนก
            </p>
            <Link href="/admin/admins" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
              จัดการ Admin
            </Link>
          </div>
        )}

        <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
          <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">ฐานข้อมูล AG</h3>
          <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
            จัดการฐานข้อมูลเว็บและผู้ใช้ AG
          </p>
          <Link href="/admin/ag-database" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
            จัดการฐานข้อมูล
          </Link>
        </div>

        {user.role === 'admin' && (
          <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
            <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">ระบบสิทธิ์</h3>
            <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
              จัดการสิทธิ์การเข้าถึงและเมนู
            </p>
            <Link href="/admin/permissions" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
              จัดการสิทธิ์
            </Link>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
            <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">ประวัติการใช้งาน</h3>
            <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
              ดูประวัติการเข้าสู่ระบบและกิจกรรม
            </p>
            <Link href="/admin/activity-log" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
              ดูประวัติ
            </Link>
          </div>
        )}

        <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
          <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">โปรไฟล์</h3>
          <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
            จัดการข้อมูลส่วนตัวและรหัสผ่าน
          </p>
          <Link href="/profile" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
            แก้ไขโปรไฟล์
          </Link>
        </div>

        <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 bg-white/90">
          <h3 className="mb-3 text-base font-semibold sm:text-lg md:text-xl sm:mb-4">โปรไฟล์</h3>
          <p className="mb-3 text-sm text-gray-600 sm:text-base sm:mb-4">
            จัดการข้อมูลส่วนตัวและรหัสผ่าน
          </p>
          <Link href="/profile" className="inline-flex items-center justify-center text-sm sm:text-base btn-theme rounded-full px-4 py-2 hover:!brightness-95">
            แก้ไขโปรไฟล์
          </Link>
        </div>

      </div>

    </TheLayout>
  )
} 
