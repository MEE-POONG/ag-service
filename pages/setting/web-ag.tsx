import React, { useState, useEffect } from 'react'
import { TheLayout } from '@/components/TheLayout'
import PaginationSelect from '@/components/PaginationSelect'
import axios from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import WebBaseModalAdd from '@/container/web-ag/ModalAdd'
import WebBaseModalEdit from '@/container/web-ag/ModalEdit'
import { ExtendedWebBaseDB } from '@/data/interface'
import WebBaseModalDelete from '@/container/web-ag/ModalDelete'
import WebBaseModalView from '@/container/web-ag/ModalView'
import PageHeader from '@/components/PageHeader'

type WebBaseResp = {
  success: boolean;
  data: ExtendedWebBaseDB[];
  total?: number;
};

export default function WebAgPage() {
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
  });
  const [webBases, setWebBases] = useState<ExtendedWebBaseDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // ✅ สร้าง query string จาก state (รวม page & pageSize ด้วย)
  const qs = React.useMemo(() => {
    const p = new URLSearchParams();
    if (searchTerm) p.append('search', searchTerm);
    if (statusFilter) p.append('status', statusFilter);
    p.append('page', String(currentPage));
    p.append('pageSize', String(pageSize));
    return p.toString();
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  // ✅ ใส่ generic, ใช้ placeholderData แทน keepPreviousData (v5)
  const {
    data: webResp,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<WebBaseResp>({
    queryKey: qk.webBase.list(searchTerm, statusFilter, currentPage, pageSize),
    queryFn: async () => {
      const res = await axios.get(`/api/web-base?${qs}`);
      return res.data as WebBaseResp;
    },
    placeholderData: (prev) => prev, // ⬅️ แทน keepPreviousData
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ ใช้ isLoading จาก query และผูกชนิด webResp ถูกต้องแล้ว
  useEffect(() => {
    if (!webResp) return;
    setLoading(false);
    if (webResp.success) {
      setWebBases(webResp.data);
      setTotalItems(webResp.total ?? webResp.data.length);
    } else {
      setWebBases([]);
      setTotalItems(0);
    }
  }, [webResp]);


  return (
    <TheLayout>
      <PageHeader
        title="รายการ Web Base"
        icon='FaServer'
        description="ระบบจัดการข้อมูลฐานเว็บและการเข้าถึงระบบ"
        gradient={true}
        actions={
          <WebBaseModalAdd onSuccess={() => refetch()} />
        }
      />
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-md pl-1 sm:p-2 mb-6 sm:mb-8">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหา Web Base..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">ชื่อ Web Base</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">จำนวน Admin</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">จำนวน AG User</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500">สถานะ</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">วันที่สร้าง</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {webBases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 sm:px-4 py-8 text-center text-xs sm:text-sm text-gray-500">
                        ไม่พบข้อมูล Web Base
                      </td>
                    </tr>
                  ) : (
                    webBases.map((webBase) => (
                      <tr key={webBase.id}>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          <div className="font-medium">{webBase.name}</div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            Admin: {webBase._count?.AdminDB || 0} | AG User: {webBase._count?.AGUserDB || 0}
                          </div>
                          <div className="text-xs text-gray-500 md:hidden sm:block">
                            {new Date(webBase.createdAt).toLocaleDateString('th-TH')}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">{webBase._count?.AdminDB || 0}</td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">{webBase._count?.AGUserDB || 0}</td>
                        <td className="px-2 sm:px-4 py-3">
                          <span className={`px-1 sm:px-2 py-1 text-xs rounded-full ${webBase.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {webBase.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">
                          {new Date(webBase.createdAt).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <div className='w-max ml-auto flex flex-row gap-1'>
                            <WebBaseModalView data={webBase} />
                            <WebBaseModalEdit data={webBase} onSuccess={() => refetch()} />
                            <WebBaseModalDelete data={webBase} onSuccess={() => refetch()} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-4 sm:mt-6">
              <PaginationSelect
                params={params}
                setParams={setParams}
              />
            </div>
          )}
        </div>
      </div>
    </TheLayout>
  );
}
