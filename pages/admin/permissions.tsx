import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import axios from '@/lib/axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import { usePermissions } from '@/hooks/usePermissions'

interface Permission {
  id: string
  name: string
  description: string
  link: string
  icon?: string
  showOrder?: number
  canAdvance?: boolean
  canViews?: boolean
  canCreate?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  isActive: boolean
}

interface AuthUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'user' | 'aguser'
  permissions?: string[]
}

const defaultForm: Partial<Permission> = {
  name: '',
  description: '',
  link: '',
  icon: '',
  showOrder: 0,
  canAdvance: false,
  canViews: true,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
  isActive: true,
}

export default function PermissionsPage() {
  const { checkPermission } = usePermissions()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<Permission>>(defaultForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const router = useRouter()

  const headPermissions = checkPermission('ระบบผู้ดูแล')
  const supportPermissions = checkPermission('แอดมิน')

  useEffect(() => {
    console.log('headPermissions : ', headPermissions);
    console.log('supportPermissions : ', supportPermissions);
  }, [headPermissions, supportPermissions])

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await axios.get('/api/auth/me')
  //       const data = response.data
        
  //       if (data.isAuthenticated && data.user?.role === 'admin') {
  //         setAuthUser(data.user)
  //         fetchPermissions()
  //       } else {
  //         router.push('/auth/login')
  //       }
  //     } catch (error) {
  //       console.error('Auth check failed:', error)
  //       router.push('/auth/login')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   checkAuth()
  // }, [router])

  const queryClient = useQueryClient()
  const { data: permResp, isFetching, refetch } = useQuery({
    queryKey: qk.menus.all,
    queryFn: async () => {
      const res = await axios.get('/api/menu-web')
      return res.data as { success: boolean; data: Permission[] }
    },
    staleTime: 60 * 1000,
  })
  useEffect(() => {
    if (permResp?.success) setPermissions(permResp.data || [])
    setLoading(false)
  }, [permResp])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editId ? 'PUT' : 'POST'
      const res = await axios({
        method,
        url: '/api/menu-web',
        data: {
          id: editId,
          ...form,
          updatedBy: authUser?.username || 'admin',
        },
      })
      const data = res.data
      if (data.success) {
        toast.success(editId ? 'แก้ไขสิทธิ์สำเร็จ' : 'เพิ่มสิทธิ์สำเร็จ')
        setShowForm(false)
        setForm(defaultForm)
        setEditId(null)
        await queryClient.invalidateQueries({ queryKey: qk.menus.all })
        refetch()
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    }
  }

  const handleEdit = (permission: Permission) => {
    setForm(permission)
    setEditId(permission.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบสิทธิ์นี้?')) return
    try {
      const res = await axios.delete('/api/menu-web', {
        data: { id },
        headers: { 'Content-Type': 'application/json' }
      })
      const data = res.data
      if (data.success) {
        toast.success('ลบสิทธิ์สำเร็จ')
        await queryClient.invalidateQueries({ queryKey: qk.menus.all })
        refetch()
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ')
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
      <div className="bg-white shadow-sm rounded-lg p1-1 sm:p-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">จัดการสิทธิ์การเข้าถึง</h1>
          <button
            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => {
              setShowForm(true)
              setForm(defaultForm)
              setEditId(null)
            }}
          >
            เพิ่มสิทธิ์ใหม่
          </button>
        </div>
        <Transition.Root show={showForm} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => { setShowForm(false); setEditId(null); }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
              leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-40 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-sm sm:max-w-2xl transform overflow-hidden rounded-2xl bg-white p1-1 sm:p-2 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-base sm:text-lg md:text-xl font-bold leading-6 text-gray-900 mb-3 sm:mb-4">
                      {editId ? 'แก้ไขสิทธิ์' : 'เพิ่มสิทธิ์ใหม่'}
                    </Dialog.Title>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">ชื่อสิทธิ์ *</label>
                          <input name="name" value={form.name} onChange={handleFormChange} required className="input-field text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">ลิงก์ (URL) *</label>
                          <input name="link" value={form.link} onChange={handleFormChange} required className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">ไอคอน</label>
                          <input name="icon" value={form.icon} onChange={handleFormChange} className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">ลำดับแสดง</label>
                          <input name="showOrder" type="number" value={form.showOrder} onChange={handleFormChange} className="input-field text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700">คำอธิบาย</label>
                          <textarea name="description" value={form.description} onChange={handleFormChange} className="input-field text-sm" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 sm:col-span-2">
                          <label className="flex items-center space-x-1 sm:space-x-2">
                            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} />
                            <span className="text-xs sm:text-sm">เปิดใช้งาน</span>
                          </label>
                          <label className="flex items-center space-x-1 sm:space-x-2">
                            <input type="checkbox" name="canAdvance" checked={form.canAdvance} onChange={handleFormChange} />
                            <span className="text-xs sm:text-sm">Advance</span>
                          </label>
                          <label className="flex items-center space-x-1 sm:space-x-2">
                            <input type="checkbox" name="canViews" checked={form.canViews} onChange={handleFormChange} />
                            <span className="text-xs sm:text-sm">ดู</span>
                          </label>
                          <label className="flex items-center space-x-1 sm:space-x-2">
                            <input type="checkbox" name="canCreate" checked={form.canCreate} onChange={handleFormChange} />
                            <span className="text-xs sm:text-sm">เพิ่ม</span>
                          </label>
                          <label className="flex items-center space-x-1 sm:space-x-2">
                            <input type="checkbox" name="canUpdate" checked={form.canUpdate} onChange={handleFormChange} />
                            <span className="text-xs sm:text-sm">แก้ไข</span>
                          </label>
                          <label className="flex items-center space-x-1 sm:space-x-2">
                            <input type="checkbox" name="canDelete" checked={form.canDelete} onChange={handleFormChange} />
                            <span className="text-xs sm:text-sm">ลบ</span>
                          </label>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end">
                        <button type="submit" className="btn-primary text-sm sm:text-base">
                          {editId ? 'บันทึกการแก้ไข' : 'เพิ่มสิทธิ์'}
                        </button>
                        <button type="button" className="btn-secondary text-sm sm:text-base" onClick={() => { setShowForm(false); setEditId(null); }}>
                          ยกเลิก
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสิทธิ์</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">คำอธิบาย</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">ลิงก์</th>
                <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ADV</th>
                <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ดู</th>
                <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">เพิ่ม</th>
                <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">แก้ไข</th>
                <th className="px-1 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ลบ</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-2 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{permission.name}</div>
                    <div className="text-xs text-gray-500 md:hidden">{permission.description}</div>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">{permission.description}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">{permission.link}</td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs hidden sm:table-cell">{permission.canAdvance ? '✔️' : ''}</td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs">{permission.canViews ? '✔️' : ''}</td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs hidden sm:table-cell">{permission.canCreate ? '✔️' : ''}</td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs hidden sm:table-cell">{permission.canUpdate ? '✔️' : ''}</td>
                  <td className="px-1 sm:px-2 py-3 sm:py-4 text-center text-xs hidden sm:table-cell">{permission.canDelete ? '✔️' : ''}</td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${permission.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {permission.isActive ? 'ใช้งาน' : 'ระงับ'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                      <button className="text-primary-600 hover:text-primary-900" onClick={() => handleEdit(permission)}>แก้ไข</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(permission.id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TheLayout>
  )
} 
