import PaginationSelect from '@/components/PaginationSelect';
import { TheLayout } from '@/components/TheLayout'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DepartmentsModalAdd from '@/container/admin/departments/ModalAdd';
import DepartmentsModalEdit from '@/container/admin/departments/ModalEdit';
import DepartmentsModalDelete from '@/container/admin/departments/ModalDelete';
import DepartmentsModalView from '@/container/admin/departments/ModalView';
import PositionModalAdd from '@/container/admin/departments/PositionModalAdd';
import axios from '@/lib/axios';
import { use, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/queryKeys';
import { AdminPositionDB } from '@prisma/client';
import ReactIconComponent from '@/components/ReactIconComponent';
import { ExtendedAdminDepartment } from '@/data/interface';
import PositionModalDelete from '@/container/admin/departments/PositionModalDelete';
import PositionModalEdit from '@/container/admin/departments/PositionModalEdit';
import PositionModalActive from '@/container/admin/departments/PositionModalActive';
import PositionModalPermission from '@/container/admin/departments/PositionModalPermission';
import PositionModalChange from '@/container/admin/departments/PositionModalChange';
import DepartmentsModalPosition from '@/container/admin/departments/ModalSwitchPosition';

// วาง helper ข้างบน component ได้เลย (ไม่ใช้ cn/cva)
const priorityDot = (p: number) =>
  p === 1 ? 'bg-red-100'
    : p === 2 ? 'bg-orange-100'
      : p === 3 ? 'bg-yellow-100'
        : 'bg-green-100';

const priorityLeftBorder = (p: number) =>
  p === 1 ? 'border-red-500'
    : p === 2 ? 'border-orange-500'
      : p === 3 ? 'border-yellow-500'
        : 'border-green-500';

export default function DepartmentsPage() {
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
  });
  const [departments, setDepartments] = useState<ExtendedAdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const { data: depResp, refetch } = useQuery({
    queryKey: qk.departments.list,
    queryFn: async () => {
      const res = await axios.get('/api/admin-departments')
      return res.data as { success: boolean; data: ExtendedAdminDepartment[] }
    },
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (depResp?.success) {
      setDepartments(depResp.data || [])
    }
    setLoading(false)
  }, [depResp])

  useEffect(() => {
    console.log('departments', departments);
  }, [departments, depResp])

  return (
    <TheLayout>
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 bg-white shadow-sm border border-primary-200 mr-4`}>
              <ReactIconComponent
                icon={`FaSitemap`}
                setClass="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
              />
            </div>
            แผนกงาน
          </h1>
          <DepartmentsModalAdd onSuccess={() => { refetch() }} />

        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>ชื่อแผนก</TableHead>
                <TableHead>ตำแหน่งในแผนก</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments && departments?.map((list, index) => (
                <TableRow key={list.id}>
                  <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between px-2 py-1 rounded">
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${list.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className=" text-gray-700">
                          <div className="font-semibold text-gray-900">{list.name}</div>
                          <div className="text-xs text-gray-500">{list.description || '-'}</div>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className='flex flex-row gap-1'>
                        <PositionModalAdd list={list} onSuccess={() => refetch()} />
                        {/* <PositionModalChange list={list} onSuccess={() => refetch()} /> */}
                        <DepartmentsModalPosition onSuccess={() => refetch()} data={list ?? []} />
                      </div>
                      {Array.isArray(list.adminPositions) &&
                        // ถ้าอยากให้ชัวร์ว่าเรียงตาม priority
                        list.adminPositions.slice().sort((a, b) => Number(a.priority) - Number(b.priority)).map((pos) => (
                          <div
                            key={pos.id}
                            className={`flex items-center justify-between bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border-l-4 ${priorityLeftBorder(Number(pos.priority))} ${priorityDot(Number(pos.priority))}`}
                          >
                            <div className="flex items-center">
                              <ReactIconComponent icon="FaUser" setClass="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1 sm:mr-2" />
                              {/* จุดสีแสดง priority */}
                              {/* <span className={`inline-block w-2 h-2 rounded-full mr-2 ${priorityDot(pos.priority)}`} /> */}
                              <span className="text-xs sm:text-sm text-gray-700 font-bold">
                                {pos.name} #{pos.priority}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <PositionModalActive list={list} position={pos} onSuccess={() => refetch()} />
                              <PositionModalPermission list={list} position={pos} onSuccess={() => refetch()} />
                              <PositionModalEdit list={list} position={pos} onSuccess={() => refetch()} />
                              <PositionModalDelete list={list} position={pos} onSuccess={() => refetch()} />
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </TableCell>
                  <TableCell >
                    <div className='w-max ml-auto flex flex-row gap-1'>
                      {/* สร้าง modal เพิ่ม position */}
                      <DepartmentsModalView data={list} />
                      <DepartmentsModalEdit data={list} onSuccess={() => refetch()} />
                      <DepartmentsModalDelete data={list} onSuccess={() => refetch()} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
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
