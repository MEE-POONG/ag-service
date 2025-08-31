
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { TheLayout } from '@/components/TheLayout'
import ImageUploader from '@/components/ui/input/ImageUploader'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import Page404 from '@/components/Page404'
import { SettingDB } from '@prisma/client'

export default function SettingPage() {
  const { user, logout } = useAuth();

  const [settingData, setSettingData] = useState<Partial<SettingDB>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // ถ้าไม่มีสิทธิ์เข้าถึง ให้แสดง 404 (อย่าเรียก Hook แบบมีเงื่อนไข)
  const isAllowed = !user || user.username === "admin" || user.username === "superadmin";

  const fetchSetting = async () => {
    setPageLoading(true)
    try {
      const res = await axios.get('/api/settings') // ✅ ใส่ URL ที่หายไป
      const data = res.data

      if (res.status === 200 && data.setting) {
        setSettingData(data.setting)
      } else {
        setSettingData({})
      }
    } catch (error) {
      console.error('Fetch setting error:', error)
      toast.error('โหลดข้อมูลการตั้งค่าล้มเหลว')
    } finally {
      setPageLoading(false)
    }
  }

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
      let imageUrlNew = '';

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('modelName', 'SettingDB');

        const uploadRes = await axios.post('/api/upload', formData);
        if (!uploadRes.data.success) throw new Error('อัปโหลดรูปไม่สำเร็จ');

        imageUrlNew = uploadRes.data.imageUrl;
      }

      // สร้าง body แบบไม่ใส่ logo ถ้าไม่ได้อัปโหลดใหม่
      const body: any = { ...settingData };
      if (selectedFile) {
        body.logo = imageUrlNew;
      }

      const method = settingData?.id ? 'put' : 'post';
      const res = await axios({ method, url: '/api/settings', data: body });

      if (res.status === 200 || res.status === 201) {
        toast.success(settingData?.id ? 'อัปเดตข้อมูลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลเรียบร้อยแล้ว');

        // ลบรูปเก่าก็ต่อเมื่อมีการอัปโหลดรูปใหม่เท่านั้น
        if (selectedFile && settingData.logo) {
          try {
            await axios.delete('/api/upload/searchDel', { data: { imageUrl: settingData.logo } });
          } catch (e) {
            console.warn('ลบรูปเก่าไม่สำเร็จ:', e);
          }
        }

        await fetchSetting();
        setSelectedFile(null);
      } else {
        toast.error('เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (e) {
      console.error('Submit error:', e);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (user?.username === "admin" || user?.username === "superadmin" || user === null) {
      fetchSetting();
    } else {
      logout();
    }
  }, [user])

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
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 m-2 sm:mb-4">
          <h1 className="flex items-center text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900">
            🖼️ ตั้งค่าเว็บไซต์
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
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
                fetchSetting();         // ดึงข้อมูลใหม่ (reset)
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

