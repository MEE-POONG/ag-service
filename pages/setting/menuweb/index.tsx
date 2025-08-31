import { TheLayout } from '@/components/TheLayout';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaginationSelect from '@/components/PaginationSelect';
import MenuWebModalAdd from '@/container/menuweb/ModalAdd';
import { MenuWebDB } from '@prisma/client';
import { useRouter } from 'next/router';
import MenuWebModalView from '@/container/menuweb/ModalView';
import MenuWebModalEdit from '@/container/menuweb/ModalEdit';
import MenuWebModalDelete from '@/container/menuweb/ModalDelete';
import MenuWebModalPosition from '@/container/menuweb/ModalPosition';

export default function MenuPage() {
    const router = useRouter();
    const { parentId } = router.query;
    const [params, setParams] = useState({
        page: 1,
        pageSize: 10,
        keyword: '',
        totalPages: 1,
    });

    const [headMenus, setHeadMenus] = useState<MenuWebDB>();
    const [menus, setMenus] = useState<MenuWebDB[]>([]);

    const fetchData = useCallback(async () => {
        let setParentId = '';
        if (parentId && typeof parentId === 'string' && parentId !== '') {
            setParentId = parentId;
        }

        try {
            const queryParams = new URLSearchParams({
                page: String(params.page),
                pageSize: String(params.pageSize),
                keyword: params.keyword,
                parentId: String(setParentId),
            });

            const res = await axios.get(`/api/menu-web?${queryParams.toString()}`);
            if (res.data.success) {
                if (res?.data?.head) {
                    setHeadMenus(res?.data?.head ? res.data.head : "");
                }
                setMenus(res.data.data);
                setParams((prev) => ({ ...prev, totalPages: res.data.pagination.totalPages }));
            }
        } catch (err) {
            console.error('Error loading menus:', err);
        }
    }, [params.page, params.pageSize, params.keyword, parentId]);



    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        // เมื่อไม่มี parentId ให้เคลียร์ headMenus
        if (!parentId || parentId === '') {
            setHeadMenus(undefined);
        }
    }, [parentId]);

    return (
        <TheLayout>
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
                    <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
                        📋 รายการเมนู
                    </h1>
                    <div className='flex flex-row gap-2'>
                        <MenuWebModalAdd onSuccess={() => {
                            fetchData();
                        }} />
                        <MenuWebModalPosition onSuccess={() => {
                            fetchData();
                        }} data={menus} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
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
                            {menus?.map((menu, index) => (
                                <TableRow key={menu.id}>
                                    <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                                    <TableCell>
                                        <div className='w-full flex flex-row items-center justify-between gap-2'>
                                            {menu.name}
                                            {menu.head &&
                                                <Link href={`/setting/menuweb?parentId=${menu.id}`} className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed" >
                                                    ดูลูก
                                                </Link>
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className='text-blue-500 font-bold'>
                                            {headMenus?.link}{menu.link}
                                        </span>
                                    </TableCell>
                                    <TableCell>{menu.isVisible ? 'ใช้งาน' : 'ไม่ใช้งาน'}</TableCell>
                                    <TableCell >
                                        <div className='w-max ml-auto flex flex-row gap-1'>
                                            <MenuWebModalView data={menu} />
                                            <MenuWebModalEdit data={menu} onSuccess={fetchData} />
                                            <MenuWebModalDelete data={menu} onSuccess={fetchData} />
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
        </TheLayout >
    );
}

