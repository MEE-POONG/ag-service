import React, { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'
import { Dialog, Transition } from '@headlessui/react'
import axios from 'axios'

interface Admin {
  id: string
  username: string
  name: string
  email: string
  tel?: string
  adminPosition: {
    name: string
    adminDepartment?: {
      name: string
    } | null
  } | null
  isActive: boolean
  createdAt: string
}

interface AuthUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user' | 'aguser'
  permissions?: string[]
}

export default function AdminPage() {
  const [authUser, setAuthUser] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAdmins()
    // const checkAuth = async () => {
    //   try {
    //     const response = await axios.get('/api/auth/me')
    //     const data = response.data
        
    //     if (data.isAuthenticated && data.user?.role === 'admin') {
    //       setAuthUser(data.user)
    //       fetchAdmins()
    //     } else {
    //       router.push('/auth/login')
    //     }
    //   } catch (error) {
    //     console.error('Auth check failed:', error)
    //     router.push('/auth/login')
    //   } finally {
    //     setLoading(false)
    //   }
    // }

    // checkAuth()
  }, [router])

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('/api/admin')
      const data = response.data
      
      if (data.success) {
        setAdmins(data.data)
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
      }
    } catch (error) {
      console.error('Fetch admins failed:', error)
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      const res = await axios.delete(`/api/AdminDB/${deleteId}`)
      if (res.data.success) {
        toast.success('ลบผู้ดูแลระบบสำเร็จ')
        setAdmins(admins.filter(a => a.id !== deleteId))
      } else {
        toast.error(res.data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      console.error('Delete admin failed:', error)
      toast.error('เกิดข้อผิดพลาดในการลบ')
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">กำลังโหลด...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!authUser) {
  //   return null
  // }

  return (
    <TheLayout>
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">จัดการผู้ดูแลระบบ</h1>
          <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            เพิ่มผู้ดูแลระบบใหม่
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ชื่อ-นามสกุล</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">อีเมล</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">เบอร์โทร</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">ตำแหน่ง</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">กลุ่มงาน/แผนก</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{admin.username}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{admin.name}</div>
                    <div className="text-xs text-gray-500 md:hidden sm:block">{admin.email}</div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">{admin.name}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">{admin.email}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{admin.tel || '-'}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">{admin.adminPosition?.name || '-'}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{admin.adminPosition?.adminDepartment?.name || '-'}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{admin.isActive ? 'ใช้งาน' : 'ระงับ'}</span>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                      <button className="text-primary-600 hover:text-primary-900">แก้ไข</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => setDeleteId(admin.id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal ยืนยันการลบ */}
      <Transition.Root show={!!deleteId} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDeleteId(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-xl p-4 sm:p-6">
                <Dialog.Title as="h3" className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">ยืนยันการลบผู้ดูแลระบบ</Dialog.Title>
                <p className="text-sm sm:text-base mb-4 sm:mb-6">คุณต้องการลบผู้ดูแลระบบนี้ใช่หรือไม่?</p>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <button className="btn-secondary text-sm sm:text-base" onClick={() => setDeleteId(null)} disabled={deleteLoading}>ยกเลิก</button>
                  <button className="btn-danger text-sm sm:text-base" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'กำลังลบ...' : 'ลบ'}</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </TheLayout>
  )
} 

