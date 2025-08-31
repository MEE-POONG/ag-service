import React, { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
//import { sampleUser } from '@/data/sampleUser'
import { Dialog, Transition } from '@headlessui/react'
import axios from 'axios'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import ImgIndex from '@/components/ui/img'
import ImageModalView from '@/container/image-list/ModalView'
import PaginationSelect from '@/components/PaginationSelect'
import { Params } from '@/data/interfaceDefault'
import { ExtendedAdminDB } from '@/data/interface'
import AdminModalDelete from '@/container/admin/ModalDelete'
import AdminModalNewPassword from '@/container/admin/ModalNewPassword'
import { usePermissions } from '@/hooks/usePermissions'


const positionColorByPriority = (p?: number) => {
  switch (p) {
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

export default function AdminPage() {
  const { checkPermission, hasMenuAccess, isSuperAdmin } = usePermissions()
  
  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
  });
  const [admins, setAdmins] = useState<ExtendedAdminDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()

  // ตรวจสอบสิทธิ์สำหรับหน้า admin
  const adminPermissions = checkPermission('ระบบผู้ดูแล')

  // ตรวจสอบสิทธิ์เข้าถึงหน้า
  useEffect(() => {
    if (!hasMenuAccess('ระบบผู้ดูแล')) {
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
      router.push('/')
    }
  }, [hasMenuAccess, router])

  const fetchAdmins = async () => {
    try {
      const response = await axios.get('/api/admin')

      if (response.data.success) {
        console.log(response.data.data);

        setAdmins(response.data.data)
      } else {
        setError(response.data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
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

  useEffect(() => {
    fetchAdmins()
    setLoading(false)
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

  // Refresh data when component becomes visible again
  useEffect(() => {
    const handleFocus = () => {
      fetchAdmins()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAdmins()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <TheLayout>
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <div>
            <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
              จัดการผู้ดูแลระบบ
            </h1>
            {isSuperAdmin && (
              <p className="text-sm text-blue-600 mt-1">
                🔑 Super Admin - สิทธิ์เต็ม
              </p>
            )}
          </div>
          {adminPermissions.canCreate && (
            <Link
              href="/admin/add"
              className="inline-flex items-center px-2 py-1 text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            >
              <FaPlus className="mr-2" /> เพิ่มผู้ดูแล
            </Link>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>แผนก/ตำแหน่ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.tel}</TableCell>
                    <TableCell>
                      <div className="w-max text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-400`}
                        >
                          {item.adminPosition?.adminDepartment?.name}
                        </span>
                        <br />
                        {item.adminPosition?.name && (
                          <span
                            className={`inline-flex px-2 py-1 mt-1 rounded-full text-xs font-semibold ${positionColorByPriority(item.adminPosition?.priority)}`}
                          >
                            {item.adminPosition?.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isActive ? <span className="inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">เปิดใช้งาน</span> : <span className="inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">ปิดใช้งาน</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {/* ปุ่มรีเซ็ตรหัสผ่าน - ต้องมีสิทธิ์ update */}
                      {adminPermissions.canUpdate && (
                        <AdminModalNewPassword data={item} onSuccess={() => fetchAdmins()} />
                      )}
                      
                      {/* ปุ่มดูข้อมูล - ต้องมีสิทธิ์ view */}
                      {adminPermissions.canView && (
                        <Link href={`/admin/view/${item.id}`} className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">ดู</Link>
                      )}
                      
                      {/* ปุ่มแก้ไข - ต้องมีสิทธิ์ update */}
                      {adminPermissions.canUpdate && (
                        <Link
                          href={`/admin/edit/${item.id}`}
                          className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">แก้ไข</Link>
                      )}
                      
                      {/* ปุ่มลบ - ต้องมีสิทธิ์ delete */}
                      {adminPermissions.canDelete && (
                        <AdminModalDelete data={item} onSuccess={() => fetchAdmins()} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 sm:mt-6">
            <PaginationSelect
              params={params}
              setParams={setParams}
            />
          </div>
        </div>
      </div>
    </TheLayout>
  )
}

