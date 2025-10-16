
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
import ImageUploader from '@/components/ui/input/ImageUploader'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import Page404 from '@/components/Page404'
import { SettingDB } from '@prisma/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/queryKeys'
import PageHeader from '@/components/PageHeader'
import { useHeadSupport } from '@/hooks/useHeadSupport'

export default function SettingPage() {
  const { user, userLoading } = useAuth();
  const hs = useHeadSupport(); // ใช้ path ปัจจุบัน

  const [settingData, setSettingData] = useState<Partial<SettingDB>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // ตรวจสอบว่าเป็น dev user หรือไม่
  const isDevUser = user?.username === "superadmin" ||
                    user?.username === "admin" ||
                    user?.adminPosition?.adminDepartment?.name === "IT Department";

  // ถ้าไม่มีสิทธิ์เข้าถึง ให้แสดง 404 (ใช้ hs.ok จาก useHeadSupport หรือตรวจสอบว่าเป็น dev user)
  const isAllowed = hs.ok || isDevUser;

  const queryClient = useQueryClient()
  const { data: serverSetting, refetch } = useQuery({
    queryKey: qk.settings.root,
    queryFn: async () => {
      const res = await axios.get('/api/settings')
      return res?.data?.setting as SettingDB | undefined
    },
    enabled: isAllowed,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setSettingData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : 0,
      }))
    } else {
      setSettingData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async () => {
    setPageLoading(true);
    try {
      let imageUrlNew = ''
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('modelName', 'SettingDB')
        const uploadRes = await axios.post('/api/upload', formData)
        if (!uploadRes.data.success) throw new Error('อัปโหลดรูปไม่สำเร็จ')
        imageUrlNew = uploadRes.data.imageUrl
      }

      const body: any = { ...settingData }
      if (selectedFile) body.logo = imageUrlNew
      const method = settingData?.id ? 'put' : 'post'
      const res = await axios({ method, url: '/api/settings', data: body })
      if (res.status === 200 || res.status === 201) {
        toast.success(settingData?.id ? 'อัปเดตข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว')
        if (selectedFile && settingData.logo) {
          try { await axios.delete('/api/upload/searchDel', { data: { imageUrl: settingData.logo } }) } catch { }
        }
        await queryClient.invalidateQueries({ queryKey: qk.settings.root })
        await refetch()
        setSelectedFile(null)
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (e) {
      console.error('Submit error:', e)
      toast.error('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (serverSetting) setSettingData(serverSetting)
  }, [serverSetting])

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
    <TheLayout>
      <PageHeader
        title="ตั้งค่าเว็บไซต์"
        icon='FaGlobe'
        description="ระบบจัดการตั้งค่าเว็บไซต์ของระบบ"
        gradient={true}
      />
      <div className="mx-auto">
        <div className="bg-white rounded-lg shadow-md pl-1 sm:p-2 mb-6 sm:mb-8">
          {/* <form onSubmit={handleSubmit}> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">ชื่อเว็บไซต์ *</label>
              <input
                name="name"
                value={settingData.name || ''}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">โลโก้เว็บไซต์</label>
              <ImageUploader
                showImg={settingData.logo || ''}
                setSelectedFile={setSelectedFile}
                size="lg"
              />
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                อัปโหลดไฟล์รูปภาพ (.jpg, .png, .gif, .webp) ขนาดไม่เกิน 10MB
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">ข้อความโลโก้</label>
              <input
                name="logoText"
                value={settingData.logoText || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">สีข้อความโลโก้</label>
              <input
                name="logoTextColor"
                type="color"
                value={settingData.logoTextColor || '#000000'}
                onChange={handleInputChange}
                className="mt-1 block w-full h-8 sm:h-10 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">ขนาดข้อความโลโก้</label>
              <input
                name="logoTextSize"
                type="number"
                value={settingData.logoTextSize || 16}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">ฟอนต์ข้อความโลโก้</label>
              <input
                name="logoTextFont"
                value={settingData.logoTextFont || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">ขนาดฟอนต์ข้อความโลโก้</label>
              <input
                name="logoTextFontSize"
                type="number"
                value={settingData.logoTextFontSize || 16}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">สีฟอนต์ข้อความโลโก้</label>
              <input
                name="logoTextFontColor"
                type="color"
                value={settingData.logoTextFontColor || '#000000'}
                onChange={handleInputChange}
                className="mt-1 block w-full h-8 sm:h-10 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Facebook</label>
              <input
                name="facebook"
                value={settingData.facebook || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Instagram</label>
              <input
                name="instagram"
                value={settingData.instagram || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Line</label>
              <input
                name="line"
                value={settingData.line || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">YouTube</label>
              <input
                name="youtube"
                value={settingData.youtube || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">เว็บไซต์</label>
              <input
                name="website"
                value={settingData.website || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700">เบอร์โทร</label>
              <input
                name="tel"
                value={settingData.tel || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">ที่อยู่</label>
              <textarea
                name="address"
                value={settingData.address || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:justify-end">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={pageLoading}
            >
              {pageLoading ? 'กำลังบันทึก...' : 'อัปเดต'}
            </button>
            <button
              className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                refetch();              // ดึงข้อมูลใหม่ (reset)
                setSelectedFile(null);  // ล้างไฟล์ใหม่
              }}
              disabled={pageLoading}
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>
    </TheLayout>
  )
} 
