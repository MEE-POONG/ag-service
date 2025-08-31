import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
//import { sampleUser } from '@/data/sampleUser'
import { ExtendedAdminDB } from '@/data/interface'
import axios from '@/lib/axios'
import { TheLayout } from '@/components/TheLayout'

// Use ExtendedAdminDB for admin-only system
type User = ExtendedAdminDB;

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me')
        const data = response.data

        // เช็คว่ามี user data หรือไม่ (API ส่งกลับ { user, message })
        if (response.status === 200 && data.user) {
          setUser(data.user)
        } else {
          localStorage.removeItem('auth-token')
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('auth-token')
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still redirect to login even if logout request fails
      router.push('/auth/login')
    }
  }

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

  if (!user) {
    return null
  }

  return (
    <TheLayout >
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              ยินดีต้อนรับ, {user.name || user.username} ({user.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-red-100 text-red-700 border border-solid border-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">จัดการผู้ใช้</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            จัดการข้อมูลผู้ใช้ ระบบสิทธิ์ และการเข้าถึง
          </p>
          <Link href="/admin/users" className="btn-primary inline-block text-sm sm:text-base">
            จัดการผู้ใช้
          </Link>
        </div>

        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">ระบบ Admin</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              จัดการผู้ดูแลระบบ ตำแหน่ง และแผนก
            </p>
            <Link href="/admin/admins" className="btn-primary inline-block text-sm sm:text-base">
              จัดการ Admin
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">ฐานข้อมูล AG</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            จัดการฐานข้อมูลเว็บและผู้ใช้ AG
          </p>
          <Link href="/admin/ag-database" className="btn-primary inline-block text-sm sm:text-base">
            จัดการฐานข้อมูล
          </Link>
        </div>

        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">ระบบสิทธิ์</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              จัดการสิทธิ์การเข้าถึงและเมนู
            </p>
            <Link href="/admin/permissions" className="btn-primary inline-block text-sm sm:text-base">
              จัดการสิทธิ์
            </Link>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">ประวัติการใช้งาน</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              ดูประวัติการเข้าสู่ระบบและกิจกรรม
            </p>
            <Link href="/admin/activity-log" className="btn-primary inline-block text-sm sm:text-base">
              ดูประวัติ
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">โปรไฟล์</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            จัดการข้อมูลส่วนตัวและรหัสผ่าน
          </p>
          <Link href="/profile" className="btn-primary inline-block text-sm sm:text-base">
            แก้ไขโปรไฟล์
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">โปรไฟล์</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            จัดการข้อมูลส่วนตัวและรหัสผ่าน
          </p>
          <Link href="/profile" className="btn-primary inline-block text-sm sm:text-base">
            แก้ไขโปรไฟล์
          </Link>
        </div>

      </div>

    </TheLayout>
  )
} 

