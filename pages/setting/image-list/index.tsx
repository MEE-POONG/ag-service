import { TheLayout } from '@/components/TheLayout';
import { useEffect, useMemo, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { FcAddImage } from 'react-icons/fc';
import { FaEdit, FaEllipsisH, FaEye, FaPlus, FaTrash, FaUserCog } from 'react-icons/fa';
import ImgIndex from '@/components/ui/img';
import PaginationSelect from '@/components/PaginationSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button, ButtonProps } from "@/components/ui/button"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ImageModalView from '@/container/image-list/ModalView';
import { ImageList } from '@prisma/client';
import ImageModalDelete from '@/container/image-list/ModalDelete';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/queryKeys';
import PageHeader from '@/components/PageHeader';
import { Params } from '@/data/interfaceDefault';
import { useHeadSupport } from '@/hooks/useHeadSupport'
import { useAuth } from '@/hooks/useAuth';
import Page404 from '@/components/Page404';

type ImageResp = {
    success: boolean;
    images: ImageList[];
    pagination?: Params;
};

export default function ImagePage() {
    const { user, userLoading } = useAuth();
    const hs = useHeadSupport(); // ใช้ path ปัจจุบัน

    // ตรวจสอบว่าเป็น dev user หรือไม่
    const isDevUser = user?.username === "superadmin" ||
                      user?.username === "admin" ||
                      user?.adminPosition?.adminDepartment?.name === "IT Department";

    // ถ้าไม่มีสิทธิ์เข้าถึง ให้แสดง 404
    const isAllowed = hs.ok || isDevUser;

    const [params, setParams] = useState<Params>({
        page: 1,
        pageSize: 10,
        keyword: '',
        totalPages: 1,
        totalItems: 0,
    });

    // ใช้ useMemo ให้ query string เสถียร
    const search = useMemo(() => {
        const p = new URLSearchParams({
            page: String(params.page),
            pageSize: String(params.pageSize),
            keyword: params.keyword ?? '',
        });
        return p.toString();
    }, [params.page, params.pageSize, params.keyword]);

    // ✅ ใส่ generic + ใช้ placeholderData แทน keepPreviousData (v5)
    const { data: imageResp, isLoading, isFetching, refetch } = useQuery<ImageResp>({
        queryKey: qk.images.list(params.page, params.pageSize, params.keyword),
        queryFn: async () => {
            const res = await axios.get(`/api/image-list?${search}`);
            return res.data as ImageResp;
        },
        placeholderData: (prev) => prev, // แทน keepPreviousData
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
    });

    const handleChange = (field: keyof typeof params, value: string | number) => {
        setParams((prev) => ({
            ...prev,
            page: field === 'keyword' ? 1 : prev.page, // ค้นหาแล้วรีเซ็ตหน้า
            [field]: value,
        }));
    };

    useEffect(() => {
        if (imageResp?.pagination) {
            setParams((prev) => ({
                ...prev,
                totalPages: imageResp.pagination!.totalPages || 1,
                totalItems: imageResp.pagination?.totalItems || 0
            }))
        }
    }, [imageResp]);

    // รอให้ user โหลดเสร็จก่อนตรวจสอบสิทธิ์
    if (userLoading) {
        return (
            <TheLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
                    </div>
                </div>
            </TheLayout>
        );
    }

    // ถ้าไม่มีสิทธิ์ ให้แสดง 404
    if (!isAllowed) {
        return (
            <Page404
                title="ไม่มีสิทธิ์เข้าถึง"
                message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ"
                backUrl="/"
            />
        );
    }

    return (
        <TooltipProvider>
            <TheLayout>
                <PageHeader
                    title="รายการรูปภาพ"
                    icon='FaImages'
                    description="ระบบจัดการรูปภาพของระบบ"
                    gradient={true}
                    actions={
                        <Link
                            href="/setting/image-list/add"
                            className="inline-flex items-center px-2 py-1 text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                        >
                            <FaPlus className="mr-2" /> เพิ่มรูปภาพ
                        </Link>
                    }
                />
                <div className="max-w-6xl mx-auto lg:max-w-full">
                    <div className="bg-white rounded-lg shadow-md pl-1 sm:p-2 mb-6 sm:mb-8">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>Preview</TableHead>
                                        <TableHead>ชื่อไฟล์</TableHead>
                                        <TableHead>Model Name</TableHead>
                                        <TableHead>วันที่สร้าง</TableHead>
                                        <TableHead className="text-right">การจัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(imageResp?.images ?? []).map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                                            <TableCell>
                                                <ImgIndex name={item.nameFile} imageValue={item.imageUrl} size="wsm" classValue="w-60 h-30 object-contain border border-gray-600" />
                                            </TableCell>
                                            <TableCell>{item.nameFile}</TableCell>
                                            <TableCell>{item.modelName}</TableCell>
                                            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <ImageModalView list={item} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>ดูรูปภาพ</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {/* <Tooltip content="แก้ไขรูปภาพ">
                                                <Button className="bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-300" variant="ghost" size="sm">
                                                    <FaEdit className="h-4 w-4" />
                                                </Button>
                                            </Tooltip> */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <ImageModalDelete list={item} onSuccess={() => refetch()} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>ลบรูปภาพ</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                {/* <Button className="bg-red-100 text-red-700 rounded hover:bg-red-300" variant="ghost" size="sm">
                                                    <FaTrash className="h-4 w-4" />
                                                </Button> */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="my-2 sm:mt-3">
                            <PaginationSelect
                                params={params}
                                setParams={setParams}
                            />
                        </div>
                    </div>
                </div>
            </TheLayout>
        </TooltipProvider>
    );
}
