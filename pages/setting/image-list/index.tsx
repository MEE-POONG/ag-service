import { TheLayout } from '@/components/TheLayout';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FcAddImage } from 'react-icons/fc';
import { FaEdit, FaEllipsisH, FaEye, FaPlus, FaTrash, FaUserCog } from 'react-icons/fa';
import ImgIndex from '@/components/ui/img';
import PaginationSelect from '@/components/PaginationSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Tooltip from '@/components/ui/tooltip';
import ImageModalView from '@/container/image-list/ModalView';
import { ImageList } from '@prisma/client';
import ImageModalDelete from '@/container/image-list/ModalDelete';


export default function ImagePage() {
    const [params, setParams] = useState({
        page: 1,
        pageSize: 10,
        keyword: '',
        totalPages: 1,
    });

    const [images, setImages] = useState<ImageList[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`/api/imagelist?page=${params.page}&pageSize=${params.pageSize}&keyword=${params.keyword}`);
            if (res?.data?.success) {
                setImages(res.data.images);
                setParams((prev) => ({ ...prev, totalPages: res.data.pagination.totalPages }));
            }
        } catch (error) {
            console.error('Error fetching image data:', error);
        }
    }, [params.page, params.pageSize, params.keyword]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (field: keyof typeof params, value: string | number) => {
        setParams((prev) => ({
            ...prev,
            page: field === 'keyword' ? 1 : prev.page,
            [field]: value,
        }));
    };

    return (
        <TheLayout>
            <div className="mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
                    <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
                        🖼️ รายการรูปภาพ
                    </h1>
                    <Link
                        href="/setting/image-list/add"
                        className="inline-flex items-center px-2 py-1 text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                    >
                        <FaPlus className="mr-2" /> เพิ่มรูปภาพ
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
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
                                {images.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{(params.page - 1) * params.pageSize + index + 1}</TableCell>
                                        <TableCell>
                                            <ImgIndex name={item.nameFile} imageValue={item.imageUrl} size="wsm" classValue="w-60 h-30 object-contain border border-gray-600" />
                                        </TableCell>
                                        <TableCell>{item.nameFile}</TableCell>
                                        <TableCell>{item.modelName}</TableCell>
                                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Tooltip content="ดูรูปภาพ">
                                                <ImageModalView list={item} />
                                            </Tooltip>
                                            {/* <Tooltip content="แก้ไขรูปภาพ">
                                                <Button className="bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-300" variant="ghost" size="sm">
                                                    <FaEdit className="h-4 w-4" />
                                                </Button>
                                            </Tooltip> */}
                                            <Tooltip content="ลบรูปภาพ">
                                                <ImageModalDelete list={item} onSuccess={fetchData} />
                                                {/* <Button className="bg-red-100 text-red-700 rounded hover:bg-red-300" variant="ghost" size="sm">
                                                    <FaTrash className="h-4 w-4" />
                                                </Button> */}
                                            </Tooltip>
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
    );
}

