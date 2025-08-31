import { Button } from '@/components/ui/button';
import { MenuWebDB } from '@prisma/client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/form/Modal';
import ReactIconComponent from '@/components/ReactIconComponent';

interface MenuWebModalEditProps {
  onSuccess: () => void;
  data: MenuWebDB;
}

const MenuWebModalEdit: React.FC<MenuWebModalEditProps> = ({ onSuccess, data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [parentMenus, setParentMenus] = useState<MenuWebDB[]>([]);

  const [formData, setFormData] = useState<Partial<MenuWebDB>>({
    id: '',
    name: '',
    description: '',
    isVisible: true,
    showOrder: 0,
    link: '',
    icon: '',
    manager: [],
    head: false,
    parentId: undefined,
    canAdvance: false,
    canViews: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    createdBy: '',
    updatedBy: '',
    isDeleted: false,
  });

  const loadParentMenus = async () => {
    try {
      const response = await axios.get('/api/menu-web');
      if (response.data.success) {
        // กรองเมนูตัวเองออก
        const filtered = response.data.data.filter((menu: MenuWebDB) => menu.id !== data.id);
        setParentMenus(filtered);
      }
    } catch (error) {
      console.error('❌ Error loading parent menus:', error);
    }
  };

  const isParentMenu = !formData.parentId;

  const handleManagerChange = (value: string, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      manager: isChecked ? [...(prev.manager || []), value] : (prev.manager || []).filter(v => v !== value),
    }));
  };

  useEffect(() => {
    if (isOpen) {
      loadParentMenus();
      setFormData(data);
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      if (!formData.name?.trim()) {
        alert('⚠️ กรุณากรอกชื่อเมนู');
        return;
      }

      if (!formData.link?.trim()) {
        alert('⚠️ กรุณากรอกลิงก์');
        return;
      }

      // Check if link starts with /
      if (!formData.link.startsWith('/')) {
        alert('⚠️ ลิงก์ต้องขึ้นต้นด้วย / เช่น /dashboard, /users');
        return;
      }

      const url = '/api/menu-web';
      const method = 'PUT';
      const body = {
        ...formData,
        createdBy: 'admin', // Replace with actual user ID
        updatedBy: 'admin', // Replace with actual user ID
      };


      const response = await axios({
        method,
        url,
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (result.success) {
        alert('✅ เพิ่มเมนูสำเร็จ');
        onSuccess();
        setIsOpen(false);
        // Reset form
        setFormData({
          name: '',
          description: '',
          isVisible: true,
          showOrder: 0,
          link: '',
          icon: '',
          manager: [],
          head: false,
          parentId: undefined,
          canAdvance: false,
          canViews: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          createdBy: '',
          updatedBy: '',
          isDeleted: false,
        });
      } else {
        alert(`❌ ${result.error || 'เกิดข้อผิดพลาด'}`);
      }
    } catch (error: any) {
      console.error('Error saving menu:', error);
      if (error.response?.data?.error) {
        alert(`❌ ${error.response.data.error}`);
      } else {
        alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    }
  };

  return (
    <>

      <Button onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        size="sm">
        แก้ไข
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>แก้ไขเมนู <span className='text-blue-500'>{data.name}</span></Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)} size="">
            <ReactIconComponent icon="FaTimes" setClass="w-5 h-5" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  ชื่อเมนู *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อเมนู"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {/* ⚠️ ชื่อเมนูต้องไม่ซ้ำกับที่มีอยู่แล้ว */}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  ลิงก์ *
                </label>
                <input
                  type="text"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="เช่น /dashboard, /users"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {/* ⚠️ ต้องขึ้นต้นด้วย / {isParentMenu ? '(เมนูหลัก - ลิงก์ต้องไม่ซ้ำกัน)' : '(เมนูย่อย - สามารถมีลิงก์ซ้ำกันได้)'} */}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                คำอธิบาย
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="คำอธิบายเมนู"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  ไอคอน
                </label>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ชื่อไอคอนหรือ URL"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  ลำดับการแสดงผล
                </label>
                <input
                  type="number"
                  value={formData.showOrder || 0}
                  onChange={(e) => setFormData({ ...formData, showOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  เมนูหลัก
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ไม่มีเมนูหลัก (เมนูหลัก)</option>
                  {parentMenus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {isParentMenu ? '🔵 เมนูหลัก - ลิงก์ต้องไม่ซ้ำกัน' : '🟢 เมนูย่อย - สามารถมีลิงก์ซ้ำกันได้'}
                </p>
              </div>
            </div>

            {/* Manager URLs */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 border-b after:border-black w-max">
                หน้าจัดการ (Manager URLs)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['/create', '/update', '/delete', '/view',].map((url) => (
                  <label key={url} className="flex items-center space-x-2 ">
                    <input
                      type="checkbox"
                      checked={formData.manager?.includes(url) || false}
                      onChange={(e) => handleManagerChange(url, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{url}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 border-b-4 border-indigo-500 w-max">
                สิทธิ์การเข้าถึง
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {[
                  { key: 'canCreate', label: 'เพิ่ม' },
                  { key: 'canUpdate', label: 'แก้ไข' },
                  { key: 'canDelete', label: 'ลบ' },
                  { key: 'canViews', label: 'ดู' },
                  { key: 'canAdvance', label: 'ครอบคุม' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData[key as keyof typeof formData] as boolean || false}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible || false}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isVisible" className="ml-2 text-xs sm:text-sm text-gray-700 font-bold">
                  {formData.isVisible ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </label>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleSave}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-blue-100 text-blue-700 border border-solid border-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            บันทึก
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MenuWebModalEdit;


