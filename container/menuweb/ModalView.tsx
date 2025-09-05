import { Button } from '@/components/ui/button';
import { MenuWebDB } from '@prisma/client';
import axios from '@/lib/axios';
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Modal from '@/components/form/Modal';

interface MenuWebModalViewProps {
  data: MenuWebDB;
}

const MenuWebModalView: React.FC<MenuWebModalViewProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [parentMenus, setParentMenus] = useState<MenuWebDB[]>([]);
  const [formData, setFormData] = useState<Partial<MenuWebDB>>({});

  useEffect(() => {
    if (isOpen) {
      loadParentMenus();
      setFormData(data);
    }
  }, [isOpen]);

  const loadParentMenus = async () => {
    try {
      const response = await axios.get('/api/menu-web');
      if (response.data.success) {
        setParentMenus(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Error loading parent menus:', error);
    }
  };

  const parentName = parentMenus.find(menu => menu.id === formData.parentId)?.name;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2 py-1 rounded text-base bg-green-100 text-green-700 border border-solid border-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        size="sm"
      >
        ดู
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen} size="xl" closeOnOverlayClick closeOnEsc>
        <Modal.Header>
          <div>
            <Modal.Title>
              ดูข้อมูลเมนู <span className="text-blue-500">{formData.name}</span>
            </Modal.Title>
          </div>
          <Modal.Close onClick={() => setIsOpen(false)}>
            <FaTimes className="h-6 w-6" />
          </Modal.Close>
        </Modal.Header>
        <Modal.Body>
            <div className="p-1 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold">ชื่อเมนู:</label>
                  <p className="mt-1 border rounded px-3 py-2 bg-gray-50">{formData.name || '-'}</p>
                </div>
                <div>
                  <label className="font-bold">ลิงก์:</label>
                  <p className="mt-1 border rounded px-3 py-2 bg-gray-50">{formData.link || '-'}</p>
                </div>
              </div>

              <div>
                <label className="font-bold">คำอธิบาย:</label>
                <p className="mt-1 border rounded px-3 py-2 bg-gray-50 whitespace-pre-line">{formData.description || '-'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold">ไอคอน:</label>
                  <p className="mt-1 border rounded px-3 py-2 bg-gray-50">{formData.icon || '-'}</p>
                </div>
                <div>
                  <label className="font-bold">ลำดับการแสดงผล:</label>
                  <p className="mt-1 border rounded px-3 py-2 bg-gray-50">{formData.showOrder}</p>
                </div>
              </div>

              <div>
                <label className="font-bold">เมนูหลัก:</label>
                <p className="mt-1 border rounded px-3 py-2 bg-gray-50">
                  {parentName || 'ไม่มี (เมนูหลัก)'}
                </p>
              </div>

              <div>
                <label className="font-bold">หน้าจัดการ (Manager URLs):</label>
                <p className="mt-1 border rounded px-3 py-2 bg-gray-50">
                  {formData.manager?.length ? formData.manager.join(', ') : 'ไม่มี'}
                </p>
              </div>

              <div>
                <label className="font-bold">สิทธิ์การเข้าถึง:</label>
                {/* <span className="mt-1 border rounded px-3 py-2 bg-gray-50">
                  {formData.manager?.length ? formData.manager.join(', ') : 'ไม่มี'}
                </span> */}
                <div className="mt-1 w-full">
                  {formData.canCreate && <span className='mx-2 p-1 bg-blue-500 text-white rounded'>เพิ่ม</span>}
                  {formData.canUpdate && <span className='mx-2 p-1 bg-blue-100 text-blue rounded'>แก้ไข</span>}
                  {formData.canDelete && <span className='mx-2 p-1 bg-red-500 text-white rounded'>ลบ</span>}
                  {formData.canViews && <span className='mx-2 p-1 bg-green-500 text-white rounded'>ดู</span>}
                  {formData.canAdvance && <span className='mx-2 p-1 bg-purple-500 text-white rounded'>ครอบคลุม</span>}
                  {!formData.canCreate &&
                    !formData.canUpdate &&
                    !formData.canDelete &&
                    !formData.canViews &&
                    !formData.canAdvance && (
                      <span className="text-gray-500">ไม่มีสิทธิ์</span>
                    )}
                </div>
              </div>
              <div>
                <label className="font-bold">สถานะการแสดงผล:</label>
                <p className="mt-1 border rounded px-3 py-2 bg-gray-50">
                  {formData.isVisible ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </p>
              </div>
            </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center px-2 py-1 rounded text-base bg-gray-100 text-gray-700 border border-solid border-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ปิด
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MenuWebModalView;

