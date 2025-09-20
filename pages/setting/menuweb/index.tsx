import { TheLayout } from '@/components/TheLayout';
import { useEffect, useMemo, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaginationSelect from '@/components/PaginationSelect';
import MenuWebModalAdd from '@/container/menuweb/ModalAdd';
import { MenuWebDB } from '@prisma/client';
import { useRouter } from 'next/router';
import MenuWebModalView from '@/container/menuweb/ModalView';
import MenuWebModalEdit from '@/container/menuweb/ModalEdit';
import MenuWebModalDelete from '@/container/menuweb/ModalDelete';
import MenuWebModalPosition from '@/container/menuweb/ModalSwitchPosition';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/queryKeys';
import PageHeader from '@/components/PageHeader';
import { Params } from '@/data/interfaceDefault';

type MenusResp = {
  success: boolean;
  data: MenuWebDB[];
  head?: MenuWebDB;
  pagination?: Params;
};

export default function MenuPage() {
  const router = useRouter();
  const { parentId } = router.query;

  const [params, setParams] = useState<Params>({
    page: 1,
    pageSize: 10,
    keyword: '',
    totalPages: 1,
    totalItems: 0,
  });

  const [headMenus, setHeadMenus] = useState<MenuWebDB | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  // สร้าง query string ด้วย useMemo ให้เสถียร
  const search = useMemo(() => {
    const p = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      keyword: params.keyword,
      parentId: typeof parentId === 'string' ? parentId : '',
    });
    return p.toString();
  }, [params.page, params.pageSize, params.keyword, parentId]);

  // ✅ v5: ใช้ generic + placeholderData แทน keepPreviousData
  const {
    data: menusResp,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<MenusResp>({
    queryKey: qk.menus.list(
      params.page,
      params.pageSize,
      params.keyword,
      typeof parentId === 'string' ? parentId : ''
    ),
    queryFn: async () => {
      const res = await axios.get(`/api/menu-web?${search}`);
      return res.data as MenusResp;
    },
    placeholderData: (prev) => prev, // ⬅️ แทน keepPreviousData
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: router.isReady, // กัน query รันก่อน router พร้อม
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!menusResp) return;
    setHeadMenus(menusResp.head);
    if (menusResp.pagination) {
      setParams((prev) => ({
        ...prev,
        totalPages: menusResp.pagination!.totalPages || 1,
        totalItems: menusResp.pagination?.totalItems || 0
      }));
    }
  }, [menusResp]);

  useEffect(() => {
    // ไม่มี parentId ให้เคลียร์ headMenus
    if (!parentId || typeof parentId !== 'string' || parentId === '') {
      setHeadMenus(undefined);
    }
  }, [parentId]);

  return (
    <TheLayout>
      <PageHeader
        title="รายการเมนู"
        icon='FaList'
        description="ระบบจัดการเมนูของระบบ"
        gradient={true}
        actions={
          <div className="flex flex-row gap-2">
            <MenuWebModalAdd onSuccess={() => refetch()} />
            <MenuWebModalPosition onSuccess={() => refetch()} data={menusResp?.data ?? []} />
          </div>
        }
      />
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* ถ้าต้องการแสดงโหลดเบา ๆ ตอนเปลี่ยนหน้า ใช้ isFetching ได้ */}
          {!isMounted || isLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">กำลังโหลด...</div>
          ) : menusResp?.data ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>ชื่อเมนู</TableHead>
                    <TableHead>ลิงก์</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(menusResp?.data ?? []).map((menu, index) => (
                    <TableRow key={menu.id}>
                      <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                      <TableCell>
                        <div className="w-full flex flex-row items-center justify-between gap-2">
                          {menu.name}
                          {menu.head && (
                            <Link
                              href={`/setting/menuweb?parentId=${menu.id}`}
                              className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ดูลูก
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-500 font-bold">
                          {(headMenus?.link ?? '') + (menu.link ?? '')}
                        </span>
                      </TableCell>
                      <TableCell>{menu.isVisible ? 'ใช้งาน' : 'ไม่ใช้งาน'}</TableCell>
                      <TableCell>
                        <div className="w-max ml-auto flex flex-row gap-1">
                          <MenuWebModalView data={menu} />
                          <MenuWebModalEdit data={menu} onSuccess={() => refetch()} />
                          <MenuWebModalDelete data={menu} onSuccess={() => refetch()} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="my-2 sm:mt-3">
                <PaginationSelect
                  params={params}
                  setParams={setParams}
                />
              </div>
              {isFetching && (
                <div className="mt-2 text-xs text-gray-500">กำลังอัปเดตรายการ…</div>
              )}
            </>
          ) : (
            <div className="py-6 text-center text-sm text-gray-500">ไม่มีข้อมูลเมนู</div>
          )}
        </div>
      </div>
    </TheLayout>
  );
}
