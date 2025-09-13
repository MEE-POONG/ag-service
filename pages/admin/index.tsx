import React, { useState, useEffect } from 'react'
import { TheLayout } from '@/components/TheLayout'
import axios from '@/lib/axios'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PaginationSelect from '@/components/PaginationSelect'
import { Params } from '@/data/interfaceDefault'
import { ExtendedAdminDB } from '@/data/interface'
import AdminModalDelete from '@/container/admin/ModalDelete'
import AdminModalNewPassword from '@/container/admin/ModalNewPassword'
import { usePermissions } from '@/hooks/usePermissions'
import { useQuery } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import { useAuth } from '@/hooks/useAuth'

type AdminListResp = {
  success: boolean
  data: ExtendedAdminDB[]
  pagination?: { totalPages?: number }
  error?: string
}

const positionColorByPriority = (p?: number) => {
  switch (p) {
    case 1: return 'bg-red-100 text-red-800 border border-red-400'
    case 2: return 'bg-orange-100 text-orange-800 border border-orange-400'
    case 3: return 'bg-yellow-100 text-yellow-800 border border-yellow-400'
    default: return 'bg-green-100 text-green-800 border border-green-400'
  }
}

export default function AdminPage() {
  const { checkPermission, hasMenuAccess, isSuperAdmin } = usePermissions()
  const { user } = useAuth()
  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
  })
  const [admins, setAdmins] = useState<ExtendedAdminDB[]>([])

  const headPermissions = checkPermission('ระบบผู้ดูแล')
  const supportPermissions = checkPermission('แอดมิน')

  // ✅ ใส่ params ลง queryKey และยิงไปกับ API
  const {
    data: queryData,          // เปลี่ยนชื่อเลี่ยงชนกับ field .data ด้านใน
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AdminListResp, Error>({
    queryKey: [...qk.admins.list, params.page, params.pageSize, params.keyword] as const,
    queryFn: async () => {
      const res = await axios.get<AdminListResp>('/api/admin', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          keyword: params.keyword || '',
        },
      })
      if (!res.data?.success) {
        throw new Error(res.data?.error || 'โหลดข้อมูลผู้ดูแลล้มเหลว')
      }
      return res.data
    },

    // ✅ v5 แทนที่ keepPreviousData ด้วย placeholderData
    placeholderData: (prev) => prev,

    refetchOnWindowFocus: true,
    staleTime: 60_000,
  })


  // ✅ อัปเดต state เมื่อ data เปลี่ยน (ไม่ผูกกับ router)
  useEffect(() => {
    console.log('admin data : ', queryData)
    if (queryData?.data) setAdmins(queryData.data)
    if (queryData?.pagination?.totalPages) {
      setParams((prev) => ({ ...prev, totalPages: queryData.pagination!.totalPages! }))
    }
  }, [queryData])

  // ✅ refresh เมื่อกลับโฟกัส/แสดงผลใหม่
  useEffect(() => {
    const onFocus = () => { refetch() }
    const onVisible = () => { if (!document.hidden) refetch() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refetch])

  useEffect(() => {
    console.log('headPermissions : ', headPermissions);
    console.log('supportPermissions : ', supportPermissions);
  }, [headPermissions])

  return (
    <TheLayout>
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <div>
            <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
              จัดการผู้ดูแลระบบ
            </h1>
            {isSuperAdmin && <p className="text-sm text-blue-600 mt-1">🔑 Super Admin - สิทธิ์เต็ม</p>}
          </div>

          {/* ✅ จัดวงเล็บเงื่อนไขให้ชัดเจน */}
          {(headPermissions.canAdvance || supportPermissions.canCreate || (user?.username === 'superadmin' || user?.username === 'admin')) ? (
            <Link
              href="/admin/add"
              className="inline-flex items-center px-2 py-1 text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            >
              <FaPlus className="mr-2" /> เพิ่มผู้ดูแล
            </Link>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          {isLoading ? (
            <div className="text-sm text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : isError ? (
            <div className="text-sm text-red-600">
              {(error as Error)?.message || 'โหลดข้อมูลล้มเหลว'}
            </div>
          ) : (
            <>
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
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-400">
                              {item.adminPosition?.adminDepartment?.name || '-'}
                            </span>
                            <br />
                            {item.adminPosition?.name ? (
                              <span
                                className={`inline-flex px-2 py-1 mt-1 rounded-full text-xs font-semibold ${positionColorByPriority(Number(item.adminPosition?.priority))}`}
                              >
                                {item.adminPosition?.name}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.isActive
                            ? <span className="inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">เปิดใช้งาน</span>
                            : <span className="inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">ปิดใช้งาน</span>}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {headPermissions.canAdvance || supportPermissions.canUpdate || user?.username === `admin` ?
                            (<AdminModalNewPassword data={item} />) : null}
                          {headPermissions.canAdvance || supportPermissions.canView || user?.username === `admin` ? (
                            <Link href={`/admin/view/${item.id}`} className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200">
                              ดู
                            </Link>
                          ) : null}
                          {headPermissions.canAdvance || supportPermissions.canUpdate || user?.username === `admin` ? (
                            <Link href={`/admin/edit/${item.id}`} className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200">
                              แก้ไข
                            </Link>
                          ) : null}
                          {headPermissions.canAdvance || supportPermissions.canDelete || user?.username === `admin` ? (
                            <AdminModalDelete
                              data={item}
                              onSuccess={() => refetch()}
                            />
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 sm:mt-6">
                <PaginationSelect
                  params={params}
                  setParams={setParams} // แค่แก้ page/pageSize → useQuery จะ refetch เองเพราะอยู่ใน queryKey
                />
              </div>
            </>
          )}
        </div>
      </div>
    </TheLayout>
  )
}
